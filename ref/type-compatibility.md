# 类型兼容

TypeScript 中的类型兼容性基于结构子类型。结构类型是一种仅基于类型成员来关联类型的方法。这与名义类型截然不同。请看以下代码：

```js
interface Pet {
  name: string;
}
class Dog {
  name: string;
}
let pet: Pet;
// OK, because of structural typing
pet = new Dog();
```

在 C# 或 Java 等名义类型语言中，等效代码会报错，因为 Dog 类没有明确地将自身描述为 Pet 接口的实现者。

TypeScript 的结构类型系统是基于 JavaScript 代码的典型编写方式而设计的。由于 JavaScript 广泛使用匿名对象，例如函数表达式和对象字面量，因此使用结构类型系统而非名义类型系统来表示 JavaScript 库中常见的各种关系要自然得多。

# 关于可靠性的说明

TypeScript 的类型系统允许某些在编译时无法预知的操作保持安全。当一个类型系统具有这种特性时，它就被称为“不健全的”。TypeScript 允许不健全行为的地方都经过了仔细考虑，本文档将解释这些行为发生的具体位置以及背后的原因。

# 入门

TypeScript 结构类型系统的基本规则是：如果类型 y 至少与类型 x 具有相同的成员，则 x 与类型 y 兼容。
例如，考虑以下代码，其中包含一个名为 Pet 的接口，该接口具有一个名为 name 的属性：

```js
interface Pet {
  name: string;
}
let pet: Pet;
// dog's inferred type is { name: string; owner: string; }
let dog = { name: "Lassie", owner: "Rudd Weatherwax" };
pet = dog;
```

为了检查 `dog` 是否可以赋值给 `pet`，编译器会检查 `pet` 的每个属性，找到 `dog` 中对应的兼容属性。
在本例中，`dog` 必须有一个名为 `name` 的字符串类型的成员。它确实有，因此赋值操作是允许的。

检查函数调用参数时也使用相同的赋值规则：

```js
interface Pet {
  name: string;
}
let dog = { name: "Lassie", owner: "Rudd Weatherwax" };
function greet(pet: Pet) {
  console.log("Hello, " + pet.name);
}
greet(dog); // OK
```

请注意，`dog` 类型多了一个 `owner` 属性，但这不会产生错误。
在检查兼容性时，只会考虑目标类型（本例中为 `Pet`）的成员。此比​​较过程会递归进行，逐个检查每个成员及其子成员的类型。

但是请注意，对象字面量只能指定已知的属性。例如，由于我们已明确指定 `dog` 的类型为 `Pet`，因此以下代码无效：

```js
let dog: Pet = { name: "Lassie", owner: "Rudd Weatherwax" }; // Error
```

# 比较两个函数

比较基本类型和对象类型相对简单，但哪些类型的函数应该被视为兼容则更为复杂。

让我们从一个简单的例子开始，假设有两个函数，它们的区别仅在于参数列表：

```js
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;
y = x; // OK
x = y; // Error
```

要检查 x 是否可以赋值给 y，我们首先查看参数列表。x 中的每个参数都必须在 y 中有一个类型兼容的对应参数。
注意，这里只考虑参数类型，不考虑参数名称。在本例中，x 的每个参数在 y 中都有一个类型兼容的对应参数，因此赋值是允许的。

第二个赋值是错误的，因为 y 有一个 x 没有的必需的第二个参数，所以赋值是不允许的。

你可能想知道为什么我们允许像 y = x 这样“丢弃”参数。
允许这种赋值的原因在于，忽略额外的函数参数在 JavaScript 中非常常见。
例如，`Array#forEach` 会向回调函数提供三个参数：数组元素、其索引和包含该元素的数组。
尽管如此，提供一个只使用第一个参数的回调函数仍然非常有用：

```js
let items = [1, 2, 3];
// Don't force these extra parameters
items.forEach((item, index, array) => console.log(item));
// Should be OK!
items.forEach((item) => console.log(item));
```

现在让我们来看看返回类型的处理方式，我们使用两个仅返回类型不同的函数：

```js
let x = () => ({ name: "Alice" });
let y = () => ({ name: "Alice", location: "Seattle" });
x = y; // OK
y = x; // Error, because x() lacks a location property
```

类型系统强制要求源函数的返回类型必须是目标类型返回类型的子类型。

## 函数参数双变性

比较函数参数类型时，如果源参数可以赋值给目标参数，或者反之亦然，则赋值成功。
这是不合理的，因为调用者最终可能会得到一个接受更特殊类型的函数，但却使用不太特殊的类型来调用该函数。
实际上，这种错误很少见，而且允许这种双变性使得许多常见的 JavaScript 模式成为可能。以下是一个简短的示例：

```js
enum EventType {
  Mouse,
  Keyboard,
}
interface Event {
  timestamp: number;
}
interface MyMouseEvent extends Event {
  x: number;
  y: number;
}
interface MyKeyEvent extends Event {
  keyCode: number;
}
function listenEvent(eventType: EventType, handler: (n: Event) => void) {
  /* ... */
}

// Unsound, but useful and common
listenEvent(EventType.Mouse, (e: MyMouseEvent) => console.log(e.x + "," + e.y));

// Undesirable alternatives in presence of soundness
listenEvent(EventType.Mouse, (e: Event) =>
  console.log((e as MyMouseEvent).x + "," + (e as MyMouseEvent).y)
);
listenEvent(EventType.Mouse, ((e: MyMouseEvent) => console.log(e.x + "," + e.y)) as (e: Event) => void);

// Still disallowed (clear error). Type safety enforced for wholly incompatible types
listenEvent(EventType.Mouse, (e: number) => console.log(e));
```

当这种情况发生时，你可以通过编译器标志 strictFunctionTypes 让 TypeScript 引发错误。

## 可选参数和剩余参数

在比较函数兼容性时，可选参数和必需参数可以互换。源类型的额外可选参数不会报错，目标类型的可选参数即使源类型中没有对应的参数也不会报错。

当一个函数有剩余参数时，它会被视为一个无限的可选参数序列。

从类型系统的角度来看，这种做法是不合理的；但从运行时的角度来看，可选参数的概念通常没有得到很好的执行，因为对于大多数函数来说，在该位置传递 undefined 是等效的。

一个典型的例子是，一个函数接受一个回调函数，并向其传递一些（对程序员而言）可预测但（对类型系统而言）未知数量的参数：

```js
function invokeLater(args: any[], callback: (...args: any[]) => void) {
  /* ... Invoke callback with 'args' ... */
}
// Unsound - invokeLater "might" provide any number of arguments
invokeLater([1, 2], (x, y) => console.log(x + ", " + y));
// Confusing (x and y are actually required) and undiscoverable
invokeLater([1, 2], (x?, y?) => console.log(x + ", " + y));
```

## 函数重载

当一个函数有重载时，目标类型中的每个重载都必须与源类型中兼容的签名相匹配。这确保了源函数可以在与目标函数相同的所有情况下被调用。

# 枚举

枚举类型与数字类型兼容，数字类型也与枚举类型兼容。不同枚举类型的枚举值被视为不兼容。例如：

```js
enum Status {
  Ready,
  Waiting,
}
enum Color {
  Red,
  Blue,
  Green,
}
let status = Status.Ready;
status = Color.Green; // Error
```

# 类

类的工作方式与对象字面量类型和接口类似，但有一个例外：类同时具有静态类型和实例类型。
比较同一类的两个对象时，仅比较实例的成员。静态成员和构造函数不影响兼容性。

```js
class Animal {
  feet: number;
  constructor(name: string, numFeet: number) {}
}
class Size {
  feet: number;
  constructor(numFeet: number) {}
}
let a: Animal;
let s: Size;
a = s; // OK
s = a; // OK
```

## 类中的私有成员和受保护成员

类中的私有成员和受保护成员会影响它们的兼容性。
当检查类的实例是否兼容时，如果目标类型包含私有成员，则源类型也必须包含源自同一类的私有成员。
同样，对于包含受保护成员的实例，也适用相同的规则。
这使得一个类可以与其父类实现赋值兼容，但不能与来自不同继承层次结构但结构相同的类实现赋值兼容。

# 泛型

由于 TypeScript 是一个结构化类型系统，类型参数只有在作为成员类型的一部分使用时才会影响最终的类型。例如：

```js
let identity = function<T>(x: T): T {
  // ...
};
let reverse = function<U>(y: U): U {
  // ...
};
identity = reverse; // OK, because (x: any) => any matches (y: any) => any
```

# 高级主题

## 子类型与赋值

到目前为止，我们一直在使用“兼容”一词，但该术语并未在语言规范中定义。
在 TypeScript 中，有两种兼容性：子类型和赋值。
它们的区别仅在于赋值扩展了子类型的兼容性，允许对任意类型进行赋值，以及对枚举类型及其对应的数值进行赋值。

语言中的不同位置会根据具体情况使用这两种兼容性机制中的一种。实际上，即使在 implements 和 extends 子句中，类型兼容性也由赋值兼容性决定。

## 抽象类型

下表总结了一些抽象类型之间的赋值关系。行表示每种类型可以赋值给哪个类型，列表示可以赋值给哪些类型。“✓”表示仅在禁用 strictNullChecks 时才兼容。

<div style="text-align: center">
<img src="images/type-compatibility.png" width="600"/>
</div>

**重申基本概念：**

- 所有类型都可以赋值给自身。
- `any` 和 `unknown` 在可赋值类型方面相同，区别在于 `unknown` 只能赋值给 `any`，不能赋值给任何其他类型。
- `unknown` 和 `never` 互为逆运算。所有类型都可以赋值给 `unknown`，`never` 可以赋值给所有类型。任何类型都不能赋值给 `never`，`unknown` 不能赋值给任何其他类型（`any` 除外）。
- `void` 不能赋值给任何其他类型，也不能从任何其他类型赋值，但以下类型除外：`any`、`unknown`、`never`、`undefined` 和 `null`（如果 `strictNullChecks` 关闭，详情请参见表格）。
- 当 `strictNullChecks` 关闭时，`null` 和 `undefined` 与 `never` 类似：可以赋值给大多数类型，大多数类型不能赋值给它们。它们之间可以相互赋值。
- 当 `strictNullChecks` 开启时，`null` 和 `undefined` 的行为更接近 `void`：不能赋值给任何其他类型，也不能从任何其他类型赋值，但 `any`、`unknown` 和 `void` 除外（`undefined` 始终可以赋值给 `void`）。