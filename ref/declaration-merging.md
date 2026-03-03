# 声明合并

TypeScript 中的一些独特概念描述了 JavaScript 对象在类型层面的结构。
其中一个 TypeScript 特有的概念是“声明合并”。理解这个概念将使你在处理现有 JavaScript 代码时更具优势，同时也为更高级的抽象概念打开了大门。

在本文中，“声明合并”指的是编译器将两个同名声明合并成一个定义。合并后的定义将同时包含两个原始声明的特性。可以合并任意数量的声明，不限于两个。

# 基本概念

在 TypeScript 中，声明会创建至少属于以下三类实体之一的实体：命名空间、类型或值。
- **命名空间** 声明会创建一个命名空间，其中包含可以使用点号表示法访问的名称。
- **类型** 声明顾名思义，会创建一个类型，该类型具有声明的形状，并绑定到给定的名称。
- **值** 声明会创建在输出的 JavaScript 代码中可见的值。

| **声明类型** | **Namespace** | **Type** | **Value** |
|:-------------|:-------------:|:--------:|:---------:|
| Namespace | X |  | X |
| Class |  | X | X |
| Enum |  | X | X |
| Interface |  | X |  |
| Type Alias |  | X |  |
| Function |  |  | X |
| Variable |  |  | X |

了解每个声明创建的内容将有助于您了解执行声明合并时合并的内容。

# 接口合并

最简单也可能是最常见的声明合并类型是接口合并。最基本的合并方式是将两个声明的成员机械地合并成一个同名的接口。

```js
interface Box {
  height: number;
  width: number;
}
interface Box {
  scale: number;
}
let box: Box = { height: 5, width: 6, scale: 10 };
```

接口中的非函数成员必须是唯一的。如果它们不唯一，则必须类型相同。如果两个接口都声明了同名但类型不同的非函数成员，编译器将报错。

对于函数成员，每个同名函数成员都被视为描述同一函数的不同重载版本。此外，值得注意的是，如果接口 A 与后续接口 A 合并，则后一个接口的优先级高于第一个接口。

例如：

```js
interface Cloner {
  clone(animal: Animal): Animal;
}
interface Cloner {
  clone(animal: Sheep): Sheep;
}
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}
```

这三个接口将合并为一个单一声明，如下所示：

```js
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}
```

请注意，每个组中的元素保持相同的顺序，但组本身会与后续的重载集合并，合并后的重载集会优先排序。

特殊签名是此规则的一个例外。如果签名包含一个类型为单个字符串字面量类型的参数（例如，不是字符串字面量的联合），则该参数会向上冒泡到其合并后的重载列表的顶部。

例如，以下接口将合并在一起：

```js
interface Document {
  createElement(tagName: any): Element;
}
interface Document {
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
}
interface Document {
  createElement(tagName: string): HTMLElement;
  createElement(tagName: "canvas"): HTMLCanvasElement;
}
```

合并后的文档声明如下：

```js
interface Document {
  createElement(tagName: "canvas"): HTMLCanvasElement;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
  createElement(tagName: string): HTMLElement;
  createElement(tagName: any): Element;
}
```

# 命名空间合并

与接口类似，同名命名空间也会合并其成员。由于命名空间既创建命名空间本身，也创建命名空间值，我们需要了解这两者是如何合并的。

要合并命名空间，需要将每个命名空间中声明的导出接口的类型定义合并，从而形成一个包含合并接口定义的单一命名空间。

要合并命名空间值，在每个声明位置，如果已存在同名命名空间，则会进一步扩展该命名空间，方法是将现有命名空间的导出成员添加到第一个命名空间中。

本例中 `Animals` 的声明合并如下：

```js
namespace Animals {
  export class Zebra {}
}
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Dog {}
}
```

等效于：

```js
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Zebra {}
  export class Dog {}
}
```

这种命名空间合并模型是一个有用的起点，但我们也需要了解未导出成员的处理方式。
未导出成员仅在原始（未合并的）命名空间中可见。这意味着合并后，来自其他声明的合并成员将无法访问未导出成员。

我们可以通过以下示例更清楚地了解这一点：

```js
namespace Animal {
  let haveMuscles = true;
  export function animalsHaveMuscles() {
    return haveMuscles;
  }
}
namespace Animal {
  export function doAnimalsHaveMuscles() {
    return haveMuscles;
    // Error, because haveMuscles is not accessible here
  }
}
```

由于 haveMuscles 没有导出，只有与 haveMuscles 共享同一未合并命名空间的 animalsHaveMuscles 函数才能看到该符号。
即使 doAnimalsHaveMuscles 函数属于已合并的 Animal 命名空间，它也无法看到这个未导出的成员。

# 将命名空间与类、函数和枚举合并

命名空间足够灵活，可以与其他类型的声明合并。要实现这一点，命名空间声明必须位于要合并的声明之后。合并后的声明将同时具备两种声明类型的属性。
TypeScript 利用此功能来模拟 JavaScript 以及其他编程语言中的一些模式。

## 将命名空间与类合并

这为用户提供了一种描述内部类的方法。

```js
class Album {
  label: Album.AlbumLabel;
}
namespace Album {
  export class AlbumLabel {}
}
```

合并成员的可见性规则与“合并命名空间”部分所述相同，因此我们必须导出 AlbumLabel 类，合并后的类才能看到它。
最终结果是，一个类被另一个类管理。您还可以使用命名空间向现有类添加更多静态成员。

除了内部类模式之外，您可能还熟悉 JavaScript 中创建函数然后通过添加属性来扩展函数的做法。TypeScript 使用声明合并来以类型安全的方式构建此类定义。

```js
function buildLabel(name: string): string {
  return buildLabel.prefix + name + buildLabel.suffix;
}
namespace buildLabel {
  export let suffix = "";
  export let prefix = "Hello, ";
}
console.log(buildLabel("Sam Smith"));
// 输出 Hello, Sam Smith
```

!> 译者注：奇技淫巧！ 非必要不使用！

类似地，命名空间可以用来扩展枚举类型，添加静态成员：

```js
enum Color {
  red = 1,
  green = 2,
  blue = 4,
}
namespace Color {
  export function mixColor(colorName: string) {
    if (colorName == "yellow") {
      return Color.red + Color.green;
    } else if (colorName == "white") {
      return Color.red + Color.green + Color.blue;
    } else if (colorName == "magenta") {
      return Color.red + Color.blue;
    } else if (colorName == "cyan") {
      return Color.green + Color.blue;
    }
  }
}
```

# 禁止合并

并非所有合并操作在 TypeScript 中都允许。目前，类不能与其他类或变量合并。有关如何模拟类合并的信息，请参阅 TypeScript 中的 Mixins 部分。

# 模块增强

虽然 JavaScript 模块不支持合并，但你可以通过导入并更新现有对象来对其进行修补。让我们来看一个简单的 Observable 示例：

```js
// observable.ts
export class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}
// map.ts
import { Observable } from "./observable";
Observable.prototype.map = function (f) {
  // ... another exercise for the reader
};
```

这在 TypeScript 中也能正常工作，但编译器并不了解 `Observable.prototype.map`。你可以使用模块增强来告诉编译器它的存在：

```js
// observable.ts
export class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}
// map.ts
import { Observable } from "./observable";
declare module "./observable" {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>;
  }
}
Observable.prototype.map = function (f) {
  // ... another exercise for the reader
};
// consumer.ts
import { Observable } from "./observable";
import "./map";
let o: Observable<number>;
o.map((x) => x.toFixed());
```

模块名称的解析方式与导入/导出中的模块说明符相同。更多信息请参阅“模块”部分。然后，扩展中的声明会合并，就像它们与原始声明位于同一文件中一样。

但是，需要注意以下两个限制：
- 您不能在扩展中声明新的顶级声明，只能对现有声明进行修补。
- 默认导出也不能被扩展，只能扩展命名导出（因为您需要通过导出名称来扩展导出，而 `default` 是一个保留字——详情请参阅 #14080）。

!> 译者注：我没看懂这些... 看懂了我也大概率不会在工程中使用这些特性，因为不能保证别人能否看懂这种写法

## 全局增强

略...