# 泛型

软件工程的一个主要部分就是构建组件，这些组件不仅要有定义良好且一致的 API，还要具有可复用性。
那些既能处理当下的数据，也能适应未来数据的组件，将为你构建大型软件系统提供最灵活的能力。

在像 C# 和 Java 这样的语言中，创建可复用组件的主要工具箱之一就是**泛型（generics）**，即能够创建一个可以支持多种类型而非单一类型的组件。
这允许用户在使用这些组件时使用他们自己的类型。

## 泛型的 Hello World

首先，让我们来做一个泛型的“hello world”：identity（恒等）函数。identity 函数是一个返回任何传入值的函数。你可以把它想象成类似于 `echo` 命令的东西。

如果没有泛型，我们要么必须给 identity 函数一个特定的类型：

```js
function identity(arg: number): number {
  return arg;
}
```

或者，我们可以使用 `any` 类型来描述 identity 函数：

```js
function identity(arg: any): any {
  return arg;
}
```

虽然使用 `any` 确实是通用的（generic），因为它会让函数接受任何和所有类型的 `arg` 参数，但我们实际上丢失了函数返回时的类型信息。
如果我们传入一个数字，我们唯一知道的信息就是任何类型都可能被返回。

相反，我们需要一种方法来捕获参数的类型，以便我们也可以用它来表示返回的内容。
在这里，我们将使用**类型变量（type variable）**，这是一种特殊的变量，它作用于类型而不是值。

```js
function identity<Type>(arg: Type): Type {
  return arg;
}
```

我们现在给 identity 函数添加了一个类型变量 `Type`。这个 `Type` 允许我们捕获用户提供的类型（例如 `number`），以便我们稍后可以使用这个信息。
这里，我们再次使用 `Type` 作为返回类型。经过观察，我们可以看到参数和返回类型使用了相同的类型。这让我们能够将类型信息从函数的一端传递到另一端。

我们称这个版本的 identity 函数为泛型函数，因为它适用于多种类型。
与使用 `any` 不同，它与第一个使用数字作为参数和返回类型的 identity 函数一样精确（即，它不会丢失任何信息）。

一旦我们编写了泛型 identity 函数，我们可以通过两种方式之一来调用它。第一种方式是将所有参数（包括类型参数）传递给函数：

```js
let output = identity<string>("myString");
```

这里我们显式地将 `Type` 设置为 `string`，作为函数调用的参数之一，通过使用 `<>` 而不是 `()` 括起参数来表示。

第二种方式可能也是最常见的。这里我们使用**类型参数推断（type argument inference）**——也就是说，我们希望编译器根据我们传入的参数类型，自动为我们设置 `Type` 的值：

```js
let output = identity("myString");
```

注意，我们不需要在尖括号（`<>`）中显式地传递类型；编译器只是查看了值 `"myString"`，然后将 `Type` 设置为它的类型。
虽然类型参数推断是一个很有用的工具，可以让代码更简短、更易读，但在编译器无法推断出类型时（这可能发生在更复杂的例子中），你可能需要像上一个例子那样显式地传入类型参数。

## 使用泛型类型变量

当你开始使用泛型时，你会注意到，当你创建像 `identity` 这样的泛型函数时，编译器会强制你在函数体中正确地使用任何泛型类型的参数。
也就是说，你实际上必须将这些参数视为它们可能是任何和所有类型来处理。

让我们看看之前的 `identity` 函数：

```js
function identity<Type>(arg: Type): Type {
  return arg;
}
```

如果我们想在每次调用时也将参数 `arg` 的长度打印到控制台呢？我们可能会尝试这样写：

```js
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  // Property 'length' does not exist on type 'Type'.
  return arg;
}
```

当我们这样做时，编译器会报错，提示我们在使用 `arg` 的 `.length` 成员，但我们并没有在任何地方声明 `arg` 拥有这个成员。
请记住，我们之前说过这些类型变量代表任何和所有类型，所以使用这个函数的人可能传入了一个数字（`number`），而数字是没有 `.length` 成员的。

假设我们实际上是想让这个函数作用于 `Type` 的数组，而不是直接作用于 `Type`。
既然我们是在处理数组，`.length` 成员应该是可用的。我们可以像创建其他类型的数组一样来描述它：

```js
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length);
  return arg;
}
```

你可以这样解读 `loggingIdentity` 的类型：“泛型函数 `loggingIdentity` 接收一个类型参数 `Type` 和一个参数 `arg`，`arg` 是一个 `Type` 类型的数组，并且函数返回一个 `Type` 类型的数组。” 
如果我们传入一个数字数组，我们将得到一个数字数组作为返回，因为 `Type` 会绑定到 `number`。
这允许我们将泛型类型变量 `Type` 用作我们正在处理的类型的一部分，而不是整个类型，从而赋予我们更大的灵活性。

我们也可以用这种方式来编写这个示例：

```js
function loggingIdentity<Type>(arg: Array<Type>): Array<Type> {
  console.log(arg.length); // Array has a .length, so no more error
  return arg;
}
```

你可能已经从其他语言中熟悉了这种类型的风格。在下一节中，我们将介绍如何创建你自己的泛型类型，比如 `Array<Type>`。

## 泛型

在前几节中，我们创建了适用于多种类型的泛型 identity 函数。在本节中，我们将探讨函数本身的类型以及如何创建泛型接口。

泛型函数的类型与非泛型函数的类型非常相似，只是类型参数列在最前面，就像函数声明一样：

```js
function identity<Type>(arg: Type): Type {
  return arg;
}
let myIdentity: <Type>(arg: Type) => Type = identity;
```

我们也可以在类型中使用不同的泛型类型参数名称，只要类型变量的数量以及类型变量的使用方式能对应上即可。

```js
function identity<Type>(arg: Type): Type {
  return arg;
}
let myIdentity: <Input>(arg: Input) => Input = identity;
```

我们还可以将泛型类型编写为对象字面量类型的调用签名：

```js
function identity<Type>(arg: Type): Type {
  return arg;
}
let myIdentity: { <Type>(arg: Type): Type } = identity;
```

这引导我们编写第一个泛型接口。让我们把上一个例子中的对象字面量拿出来，放到一个接口中：

```js
interface GenericIdentityFn {
  <Type>(arg: Type): Type;
}
function identity<Type>(arg: Type): Type {
  return arg;
}
let myIdentity: GenericIdentityFn = identity;
```

类似地，我们可能希望将泛型参数移至整个接口的参数中。
这样我们就能看到泛型所针对的类型（例如，`Dictionary<string>` 而不仅仅是 `Dictionary`）。
这使得接口的所有其他成员都能看到该类型参数。

```js
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}
function identity<Type>(arg: Type): Type {
  return arg;
}
let myIdentity: GenericIdentityFn<number> = identity;
```

请注意，我们的示例略有不同。
现在，我们不再描述泛型函数，而是描述一个非泛型函数签名，它是泛型类型的一部分。
使用 `GenericIdentityFn` 时，我们还需要指定相应的类型参数（此处为数字），从而有效地锁定底层调用签名将使用的类型。
理解何时将类型参数直接放在调用签名中，何时放在接口本身，有助于描述类型的哪些方面是泛型的。

除了泛型接口之外，我们还可以创建泛型类。请注意，无法创建泛型枚举和命名空间。

## 泛型类

泛型类的结构与泛型接口类似。泛型类在类名后用尖括号 (`<>`) 括起来，列出泛型类型参数。

```js
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}
let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
```

这是对 GenericNumber 类的一种非常字面的用法，但您可能已经注意到，它并没有限制只能使用数字类型。我们也可以使用字符串，甚至更复杂的对象。

```js
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x, y) {
  return x + y;
};
console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

与接口类似，将类型参数放在类本身可以确保类的所有属性都使用相同的类型。

正如我们在类章节中所述，类的类型包含两个方面：静态方面和实例方面。
泛型类仅在其实例方面是泛型的，而非静态方面，因此在使用类时，静态成员不能使用类的类型参数。

## 泛型约束

如果你还记得之前的例子，有时你可能需要编写一个泛型函数，该函数可以处理一组类型，而你对这些类型所具备的功能有一定的了解。
在我们的 `loggingIdentity` 示例中，我们希望能够访问 arg 的 .length 属性，但编译器无法证明每种类型都具有 .length 属性，因此它会警告我们不能做出这样的假设。

```js
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  // Property 'length' does not exist on type 'Type'.
  return arg;
}
```

我们希望这个函数能够处理所有类型，而不是允许它处理所有同时具有 `.length` 属性的类型。
只要类型拥有这个属性，我们就允许它使用，但前提是它必须至少拥有这个属性。为此，我们必须将这个要求作为对 `Type` 的约束条件。

为此，我们将创建一个接口来描述我们的约束条件。
这里，我们将创建一个包含单个 `.length` 属性的接口，然后使用这个接口和 `extends` 关键字来表示我们的约束条件：

```js
interface Lengthwise {
  length: number;
}
function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // Now we know it has a .length property, so no more error
  return arg;
}
```

由于泛型函数现在受到限制，它将不再适用于所有类型：

```js
loggingIdentity(3);
// Argument of type 'number' is not assignable to parameter of type 'Lengthwise'.
```

相反，我们需要传入类型具备所有必需属性的值：

```js
loggingIdentity({ length: 10, value: 3 });
```

### 使用类型参数

你可以声明一个受另一个类型参数约束的类型参数。
例如，这里我们想根据对象名称获取其属性。为了确保不会意外获取对象上不存在的属性，我们将在两个类型之间添加约束：

```js
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}
let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
// Argument of type '"m"' is not assignable to parameter of type '"a" | "b" | "c" | "d"'.
```

## Class 类型

在 TypeScript 中使用泛型创建工厂时，必须通过构造函数来引用类类型。例如：

```js
function create<Type>(c: { new (): Type }): Type {
  return new c();
}
```

更高级的例子使用原型属性来推断和约束构造函数与类类型实例之间的关系。

```js
class BeeKeeper {
  hasMask: boolean = true;
}
class ZooKeeper {
  nametag: string = "Mikle";
}
class Animal {
  numLegs: number = 4;
}
class Bee extends Animal {
  numLegs = 6;
  keeper: BeeKeeper = new BeeKeeper();
}
class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}
function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}
createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
```

这种模式用于驱动 `mixins` 设计模式。

## 泛型参数默认值

通过为泛型类型参数声明默认值，您可以使指定相应的类型参数成为可选的。
例如，一个创建新 HTMLElement 的函数。
不带任何参数调用该函数会生成一个 HTMLDivElement；如果将一个元素作为第一个参数调用该函数，则会生成一个与该参数类型相同的元素。
您还可以选择传递一个子元素列表。以前，您必须将函数定义为：

```js
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

使用通用参数默认值，我们可以将其简化为：

```js
declare function create<T extends HTMLElement = HTMLDivElement, U extends HTMLElement[] = T[]>(
  element?: T,
  children?: U
): Container<T, U>;
 
const div = create();
// const div: Container<HTMLDivElement, HTMLDivElement[]>
const p = create(new HTMLParagraphElement());
// const p: Container<HTMLParagraphElement, HTMLParagraphElement[]>
```

泛型参数默认值遵循以下规则：

- 如果类型参数具有默认值，则该类型参数被视为可选。
- 必需类型参数不能位于可选类型参数之后。
- 类型参数的默认类型必须满足该类型参数的约束（如果存在）。
- 指定类型参数时，只需为必需类型参数指定类型参数。未指定的类型参数将解析为其默认类型。
- 如果指定了默认类型且类型推断无法选择候选类型，则推断默认类型。
- 与现有类或接口声明合并的类或接口声明可以为现有类型参数引入默认值。
- 与现有类或接口声明合并的类或接口声明可以引入新的类型参数，只要它指定了默认值即可。

## 差异注解

> 这是一项用于解决特定问题的高级功能，仅应在确定有必要使用的情况下才可启用。

略...