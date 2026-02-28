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