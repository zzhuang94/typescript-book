# 对象类型

在 JavaScript 中，我们分组和传递数据的基本方式是通过对象。在 TypeScript 中，我们通过对象类型来表示这些对象。

正如我们所见，对象类型可以是匿名的：

```js
function greet(person: { name: string; age: number }) {
  return "Hello " + person.name;
}
```

或者，它们可以通过 `interface` 命名：

```js
interface Person {
  name: string;
  age: number;
}
function greet(person: Person) {
  return "Hello " + person.name;
}
```

或者通过 `type` 命名：

```js
type Person = {
  name: string;
  age: number;
};
function greet(person: Person) {
  return "Hello " + person.name;
}
```

在以上三个例子中，我们都编写了函数，这些函数接受包含属性名称（必须是字符串）和年龄（必须是数字）的对象。

## 快速参考

我们提供了 `type` 和 `interface` 的 [速查表](https://www.typescriptlang.org/cheatsheets/)，如果您想快速了解重要的日常语法，可以一目了然地查阅。

## 属性修饰符

对象类型中的每个属性都可以指定：类型、属性是否可选以及属性是否可写。

### 可选属性

很多时候，我们会遇到一些对象，它们可能具有一组属性。在这种情况下，我们可以通过在属性名称末尾添加问号（?）来将这些属性标记为可选。

```js
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}
 
function paintShape(opts: PaintOptions) {
  // ...
}
 
const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
```

在这个例子中，`xPos` 和 `yPos` 都被视为可选属性。我们可以选择提供其中任何一个，因此上面对 paintShape 的每次调用都是有效的。
可选属性的真正含义是，如果设置了该属性，则它必须具有特定的类型。

我们也可以读取这些属性的值——但是，如果启用了 `strictNullChecks`，TypeScript 会提示我们这些值可能未定义。

```js
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos; // (property) PaintOptions.xPos?: number | undefined
  let yPos = opts.yPos; // (property) PaintOptions.yPos?: number | undefined
  // ...
}
```

在 JavaScript 中，即使属性从未被设置过，我们仍然可以访问它——只是会返回 undefined 值。我们可以通过检查 undefined 值来特殊处理它。

```js
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos;
  let yPos = opts.yPos === undefined ? 0 : opts.yPos;
}
```

请注意，这种为未指定值设置默认值的模式非常常见，以至于 JavaScript 有相应的语法来支持它。

```js
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log("x coordinate at", xPos);
  console.log("y coordinate at", yPos);
}
```

这里我们对 paintShape 的参数使用了解构模式，并为 xPos 和 yPos 提供了默认值。
现在，xPos 和 yPos 都明确存在于 paintShape 函数体中，但对于 paintShape 的任何调用者来说，它们是可选的。

### 只读属性

在 TypeScript 中，属性也可以标记为只读。虽然这不会改变运行时行为，但标记为只读的属性在类型检查期间无法写入。

```js
interface SomeType {
  readonly prop: string;
}
 
function doSomething(obj: SomeType) {
  // We can read from 'obj.prop'.
  console.log(`prop has the value '${obj.prop}'.`);
 
  // But we can't re-assign it.
  obj.prop = "hello";
  // Cannot assign to 'prop' because it is a read-only property.
}
```

使用 readonly 修饰符并不一定意味着一个值是完全不可变的——或者换句话说，它的内部内容不能被更改。它仅仅意味着属性本身不能被重写。

```js
interface Home {
  readonly resident: { name: string; age: number };
}
 
function visitForBirthday(home: Home) {
  // We can read and update properties from 'home.resident'.
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}
 
function evict(home: Home) {
  // But we can't write to the 'resident' property itself on a 'Home'.
  home.resident = {
    name: "Victor the Evictor",
    age: 42,
  };
  // Cannot assign to 'resident' because it is a read-only property.
}
```

> **译者注：** 类似 const a = obj; a 不能被重新赋值，但是 a 的属性可以被修改

管理对 `readonly` 属性含义的预期非常重要。在 TypeScript 开发阶段，明确对象的使用方式至关重要。
TypeScript 在检查两种类型是否兼容时，不会考虑它们的属性是否为只读，因此只读属性也可能通过别名而改变。

```js
interface Person {
  name: string;
  age: number;
}
 
interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}
 
let writablePerson: Person = {
  name: "Person McPersonface",
  age: 42,
};
 
// works
let readonlyPerson: ReadonlyPerson = writablePerson;
 
console.log(readonlyPerson.age); // prints '42'
writablePerson.age++;
console.log(readonlyPerson.age); // prints '43'

// error
 readonlyPerson.age ++;
```

使用 [映射修饰符](xxx)，可以移除只读属性。

### 索引签名

有时你无法预先知道某个类型所有属性的名称，但你知道其值的格式。

在这种情况下，你可以使用索引签名来描述可能的值的类型，例如：

```js
interface StringArray {
  [index: number]: string;
}
 
const myArray: StringArray = getStringArray();
const secondItem = myArray[1]; // string
```

上面我们定义了一个 StringArray 接口，它带有一个索引签名。该索引签名表明，当使用数字作为索引访问 StringArray 时，它将返回一个字符串。

索引签名属性仅允许使用以下几种类型：字符串、数字、符号、模板字符串模式以及仅包含这些类型的联合类型。

虽然字符串索引签名是描述“字典”模式的强大方法，但它也强制所有属性必须与其返回类型匹配。这是因为字符串索引声明 `obj.property` 也可以通过 `obj["property"]` 获取。在下面的示例中，`name` 的类型与字符串索引的类型不匹配，因此类型检查器会报错：

```js
interface NumberDictionary {
  [index: string]: number;
 
  length: number; // ok
  name: string;
  // Property 'name' of type 'string' is not assignable to 'string' index type 'number'.
}
```

但是，如果索引签名是属性类型的并集，则不同类型的属性是可以接受的：

```js
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number; // ok, length is a number
  name: string; // ok, name is a string
}
```

最后，您可以将索引签名设置为只读，以防止对其索引进行赋值：

```js
interface ReadonlyStringArray {
  readonly [index: number]: string;
}
 
let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = "Mallory";
// Index signature in type 'ReadonlyStringArray' only permits reading.
```

您无法设置 myArray[2]，因为索引签名是只读的。

## 额外属性检查

对象被赋予类型的位置和方式会对类型系统产生影响。一个关键的例子是额外的属性检查，它会在创建对象并将其分配给对象类型时，对对象进行更彻底的验证。

```js
interface SquareConfig {
  color?: string;
  width?: number;
}
function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}

let mySquare = createSquare({ colour: "red", width: 100 });
// Object literal may only specify known properties,
// but 'colour' does not exist in type 'SquareConfig'. Did you mean to write 'color'?
```

注意，`createSquare` 函数的参数拼写为 `colour` 而不是 `color`。在纯 JavaScript 中，这种错误会静默报错。

你可能会认为这个程序类型正确，因为宽度属性是兼容的，没有 `color` 属性，而且多余的 `color` 属性也无关紧要。

然而，TypeScript 认为这段代码可能存在 bug。对象字面量会受到特殊处理，在将其赋值给其他变量或作为参数传递时，会进行额外的属性检查。

绕过这些检查其实很简单。最简单的方法就是使用类型断言：

```js
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

然而，如果您确定对象可以拥有一些以特殊方式使用的额外属性，那么更好的方法可能是添加字符串索引签名。
例如，如果 SquareConfig 可以拥有上述类型的颜色和宽度属性，但还可以拥有任意数量的其他属性，那么我们可以这样定义它：

```js
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: unknown;
}
```

这里我们说的是，SquareConfig 可以拥有任意数量的属性，只要它们不是颜色或宽度属性，它们的类型就无关紧要。

最后一种绕过这些检查的方法（可能有点出乎意料）是将该对象赋值给另一个变量：由于赋值 squareOptions 不会进行额外的属性检查，编译器不会报错：

```js
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
```

只要 `squareOptions` 和 `SquareConfig` 之间存在共同属性，上述解决方法就能奏效。在本例中，该属性是 `width`。但是，如果变量没有任何共同的对象属性，则此方法会失败。例如：

```js
let squareOptions = { colour: "red" };
let mySquare = createSquare(squareOptions);
// Type '{ colour: string; }' has no properties in common with type 'SquareConfig'.
```

请记住，对于像上面这样的简单代码，您可能不应该试图“绕过”这些检查。对于包含方法和状态的更复杂的对象字面量，您可能需要记住这些技巧，但大多数属性过多的错误实际上是 bug。

这意味着，如果您在处理类似选项包之类的东西时遇到属性过多检查的问题，您可能需要修改一些类型声明。在这种情况下，如果允许将同时包含 color 或 colour 属性的对象传递给 createSquare，则应该修改 SquareConfig 的定义以反映这一点。

## 接口扩展

有些类型是其他类型的更具体版本，这种情况很常见。例如，我们可能有一个名为 BasicAddress 的类型，它描述了一个地址所需的字段。

```js
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

在某些情况下，这样就足够了，但如果某个地址所在的建筑物有多个单元，那么地址通常会关联一个单元号。这时，我们就可以描述一个带有单元号的地址（AddressWithUnit）。

```js
interface AddressWithUnit {
  name?: string;
  unit: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

这样做虽然可行，但缺点是我们需要重复添加 BasicAddress 中的所有其他字段，而我们的更改仅仅是新增的。其实，我们可以扩展原始的 BasicAddress 类型，只添加 AddressWithUnit 特有的新字段。

```js
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
 
interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

接口上的 `extends` 关键字允许我们有效地从其他命名类型复制成员，并添加任何我们想要的新成员。这有助于减少我们需要编写的类型声明样板代码量，并表明同一属性的多个不同声明可能存在关联。例如，`AddressWithUnit` 不需要重复 `street` 属性，因为 `street` 源自 `BasicAddress`，读者会知道这两个类型之间存在某种关联。

接口也可以继承自多个类型。

```js
interface Colorful {
  color: string;
}
 
interface Circle {
  radius: number;
}
 
interface ColorfulCircle extends Colorful, Circle {}
 
const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
```

## 接口交集

接口允许我们通过扩展现有类型来构建新的类型。TypeScript 还提供了另一种称为交集类型的构造，主要用于组合现有的对象类型。

交集类型使用 `&` 运算符定义。

```js
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}
 
type ColorfulCircle = Colorful & Circle;
```

在这里，我们将 `Colorful` 和 `Circle` 进行交集运算，从而生成了一个新类型，该类型拥有 `Colorful` 和 `Circle` 的所有成员。

## 接口扩展 vs. 接口交集

我们刚刚看到了两种组合类型的方法，它们看起来很相似，但实际上有细微的差别。
使用 `interface`，我们可以使用 `extends` 子句来扩展其他类型，而我们也可以使用交叉类型做类似的事情，并使用类型别名来命名结果。
两者之间的主要区别在于如何处理冲突，这种区别通常是你在二者之间做出选择的主要原因之一。

如果定义了同名的 `interface`，只要属性兼容，TypeScript 就会尝试合并它们。如果属性不兼容（即它们具有相同的属性名称但类型不同），TypeScript 将会报错。

而在接口交集的情况下，具有不同类型的属性会被自动合并。当稍后使用该类型时，TypeScript 会期望该属性同时满足这两种类型，这可能会产生意想不到的结果。

例如，下面的代码会抛出一个错误，因为属性是不兼容的：

```js
interface Person {
  name: string;
}
interface Person {
  name: number;
}
```

相比之下，下面的代码可以编译通过，但结果是一个 `never` 类型：

```js
interface Person1 {
  name: string;
}
interface Person2 {
  name: number;
}
type Staff = Person1 & Person2
declare const staffer: Staff;
staffer.name; // never
```

在这种情况下，`Staff` 将要求 `name` 属性既是 `string` 又是 `number`，这导致该属性的类型变为 `never`。

## 泛型对象类型

让我们想象一个 `Box` 类型，它可以包含任何值——`string`、`number`、`Giraffe` 等等。

```js
interface Box {
  contents: any;
}
```

目前，`contents` 属性的类型被指定为 `any`，这虽然能行得通，但可能会在后续引发意外事故。

我们可以改用 `unknown`，但这意味在那些我们已经知道 `contents` 类型的情况下，我们仍然需要进行预防性检查，或者使用容易出错的类型断言。

```js
interface Box {
  contents: unknown;
}
let x: Box = {
  contents: "hello world",
};
// we could check 'x.contents'
if (typeof x.contents === "string") {
  console.log(x.contents.toLowerCase());
}
// or we could use a type assertion
console.log((x.contents as string).toLowerCase());
```

一种类型安全的做法是为每种 `contents` 的类型搭建不同的 `Box` 类型。

```js
interface NumberBox {
  contents: number;
}
interface StringBox {
  contents: string;
}
interface BooleanBox {
  contents: boolean;
}
```

但这意味我们将不得不创建不同的函数，或者函数的重载，来对这些类型进行操作。

```js
function setContents(box: StringBox, newContents: string): void;
function setContents(box: NumberBox, newContents: number): void;
function setContents(box: BooleanBox, newContents: boolean): void;
function setContents(box: { contents: any }, newContents: any) {
  box.contents = newContents;
}
```

这太繁琐了（boilerplate）。而且，我们以后可能还需要引入新的类型和重载。这令人沮丧，因为我们的盒子类型和重载实际上都是一样的。

相反，我们可以创建一个声明了类型参数的泛型 `Box` 类型。

```js
interface Box<Type> {
  contents: Type;
}
```

你可以将其解读为“一个 `Type` 类型的 `Box`，其 `contents` 的类型为 `Type`”。稍后，当我们引用 `Box` 时，我们必须提供一个类型参数来代替 `Type`。

```js
let box: Box<string>;
```

你可以把 `Box` 想象成一个真实类型的模板，其中 `Type` 是一个占位符，会被替换为其他类型。
当 TypeScript 看到 `Box<string>` 时，它会将 `Box<Type>` 中出现的每一个 `Type` 替换为 `string`，
最终结果就像是在处理 `{ contents: string }`。换句话说，`Box<string>` 和我们之前的 `StringBox` 工作原理完全相同。

```js
interface Box<Type> {
  contents: Type;
}
interface StringBox {
  contents: string;
}
let boxA: Box<string> = { contents: "hello" };
boxA.contents;
let boxB: StringBox = { contents: "world" };
boxB.contents;
```

`Box` 是可重用的，因为 `Type` 可以被替换为任何东西。这意味着当我们需要一个用于新类型的盒子时，我们根本不需要声明一个新的 `Box` 类型（尽管如果我们想的话当然也可以）。

```js
interface Box<Type> {
  contents: Type;
}
interface Apple {
  // ....
}
// Same as '{ contents: Apple }'.
type AppleBox = Box<Apple>;
```

这也意味着我们可以通过使用泛型函数来完全避免使用重载。

```js
function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

值得注意的是，类型别名（type aliases）也可以是泛型的。我们可以定义新的 `Box<Type>` 接口，如下所示：

```js
type Box<Type> = {
  contents: Type;
};
```

由于类型别名与接口不同，它不仅可以描述对象类型，因此我们还可以使用它们来编写其他类型的泛型辅助类型。

```js
type OrNull<Type> = Type | null;
type OneOrMany<Type> = Type | Type[];
type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;
// type OneOrManyOrNull<Type> = OneOrMany<Type> | null
type OneOrManyOrNullStrings = OneOrManyOrNull<string>;
// type OneOrManyOrNullStrings = OneOrMany<string> | null
```

我们稍后会回过头来再讲类型别名。

### Array

泛型对象类型通常是某种容器类型，它们独立于所包含元素的类型而工作。数据结构以这种方式工作是非常理想的，这样它们就可以在不同的数据类型之间重用。

事实证明，我们在整个手册中一直使用的就是这样一种类型：`Array`（数组）类型。每当我们写出像 `number[]` 或 `string[]` 这样的类型时，这实际上只是 `Array<number>` 和 `Array<string>` 的简写形式。

```js
function doSomething(value: Array<string>) {
  // ...
}
let myArray: string[] = ["hello", "world"];
// either of these work!
doSomething(myArray);
doSomething(new Array("hello", "world"));
```

就像上面的 `Box` 类型一样，`Array` 本身也是一个泛型类型。

```js
interface Array<Type> {
  /**
   * Gets or sets the length of the array.
   */
  length: number;
 
  /**
   * Removes the last element from an array and returns it.
   */
  pop(): Type | undefined;
 
  /**
   * Appends new elements to an array, and returns the new length of the array.
   */
  push(...items: Type[]): number;
 
  // ...
}
```

现代 JavaScript 还提供了其他泛型数据结构，比如 `Map<K, V>`、`Set<T>` 和 `Promise<T>`。这实际上意味着，由于 `Map`、`Set` 和 `Promise` 的行为方式，它们可以与任何类型集合一起工作。

### ReadonlyArray

`ReadonlyArray` 是一个特殊类型，用于描述不应该被更改的数组。

```js
function doStuff(values: ReadonlyArray<string>) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);
 
  // ...but we can't mutate 'values'.
  values.push("hello!");
  // Property 'push' does not exist on type 'readonly string[]'.
}
```

就像属性的 `readonly` 修饰符一样，它主要是一个我们可以用来表达意图的工具。当我们看到一个返回 `ReadonlyArray` 的函数时，它告诉我们根本不应该更改其内容；当我们看到一个接收 `ReadonlyArray` 的函数时，它告诉我们可以将任何数组传递给该函数，而无需担心它会更改数组的内容。

与 `Array` 不同，没有我们可以使用的 `ReadonlyArray` 构造函数。

```js
new ReadonlyArray("red", "green", "blue");
// 'ReadonlyArray' only refers to a type, but is being used as a value here.
```

相反，我们可以将普通数组赋值给 `ReadonlyArray`。

```js
const roArray: ReadonlyArray<string> = ["red", "green", "blue"];
```

正如 TypeScript 为 `Array<Type>` 提供了 `Type[]` 这种简写语法一样，它也为 `ReadonlyArray<Type>` 提供了 `readonly Type[]` 这种简写语法。

```js
function doStuff(values: readonly string[]) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);
 
  // ...but we can't mutate 'values'.
  values.push("hello!");
  // Property 'push' does not exist on type 'readonly string[]'.
}
```

最后要注意的一点是，与 `readonly` 属性修饰符不同，普通数组（`Array`）和只读数组（`ReadonlyArray`）之间的可赋值性不是双向的。

```js
let x: readonly string[] = [];
let y: string[] = [];
 
x = y;
y = x;
// The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
```

### Tuple

元组类型是另一种数组类型，它确切地知道自己包含多少个元素，以及在特定位置包含确切的什么类型。

```js
type StringNumberPair = [string, number];
```

在这里，`StringNumberPair` 是一个由 `string` 和 `number` 组成的元组类型。
像 `ReadonlyArray` 一样，它在运行时没有表现形式，但对 TypeScript 来说意义重大。
对于类型系统而言，`StringNumberPair` 描述了一个数组，其索引 `0` 处包含一个 `string`，索引 `1` 处包含一个 `number`。

```js
function doSomething(pair: [string, number]) {
  const a = pair[0]; // string
  const b = pair[1]; // number
  // ...
}
doSomething(["hello", 42]);
```

如果我们尝试访问超出元素数量的索引，将会得到一个错误。

```js
function doSomething(pair: [string, number]) {
  // ...
  const c = pair[2];
  // Tuple type '[string, number]' of length '2' has no element at index '2'.
}
```

我们也可以使用 JavaScript 的数组解构语法来解构元组。

```js
function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;
  console.log(inputString);
  console.log(hash);
}
```

> 元组类型在严重依赖约定的 API 中非常有用，因为在这些 API 中，每个元素的含义都是“显而易见”的。这让我们在解构它们时，可以灵活地将变量命名为任何我们想要的名字。在上面的例子中，我们可以将元素 0 和 1 命名为任何我们想要的名字。

> 然而，由于并非每个用户都对什么是“显而易见”持有相同的看法，因此重新考虑使用具有描述性属性名称的对象是否对你的 API 更好，或许是值得的。

除了那些长度检查之外，像这样的简单元组类型等价于这样一种类型：它们是声明了特定索引属性、并且使用数字字面量类型声明了 `length` 属性的 `Array` 版本。

```js
interface StringNumberPair {
  // specialized properties
  length: 2;
  0: string;
  1: number;
 
  // Other 'Array<string | number>' members...
  slice(start?: number, end?: number): Array<string | number>;
}
```

你可能感兴趣的另一件事是，元组可以通过写一个问号（`?`，在元素类型之后）来拥有可选属性。可选的元组元素只能出现在末尾，并且还会影响 `length` 的类型。

```js
type Either2dOr3d = [number, number, number?];
function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;
  // const z: number | undefined
  console.log(`Provided coordinates had ${coord.length} dimensions`);
  // (property) length: 2 | 3
}
```

元组还可以包含剩余元素，这些元素必须是数组或元组类型。

```js
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
```

- `StringNumberBooleans` 描述了一个元组，其前两个元素分别是 `string` 和 `number`，但后面可以跟随任意数量的 `boolean`。
- `StringBooleansNumber` 描述了一个元组，其第一个元素是 `string`，然后是任意数量的 `boolean`，并以一个 `number` 结尾。
- `BooleansStringNumber` 描述了一个元组，其起始元素是任意数量的 `boolean`，并以一个 `string` 后跟一个 `number` 结尾。

带有剩余元素的元组没有固定的“长度”——它只有一组位于不同位置的已知元素。

```js
const a: StringNumberBooleans = ["hello", 1];
const b: StringNumberBooleans = ["beautiful", 2, true];
const c: StringNumberBooleans = ["world", 3, true, false, true, false, true];
```

为什么可选元素和剩余元素会有用呢？嗯，这使得 TypeScript 能够将元组与参数列表对应起来。元组类型可以用于剩余参数和实参中，因此以下代码：

```js
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
```

上述代码基本上等同于：

```js
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

当你想要使用剩余参数来接收可变数量的参数，并且需要保证最少元素个数，但又不想引入中间变量时，这就非常方便了。


### readonly Tuple

关于元组类型最后要注意的一点是——元组类型也有 `readonly`（只读）变体，并且可以通过在它们前面加上 `readonly` 修饰符来指定——就像数组的简写语法一样。

```js
function doSomething(pair: readonly [string, number]) {
  // ...
}
```

正如你所预料的那样，在 TypeScript 中不允许写入只读元组的任何属性。

```js
function doSomething(pair: readonly [string, number]) {
  pair[0] = "hello!";
  // Cannot assign to '0' because it is a read-only property.
}
```

在大多数代码中，元组往往被创建后就保持不修改，因此在可能的情况下，将类型注解为只读元组是一个很好的默认做法。
这一点也很重要，因为带有 `const` 断言的数组字面量将被推断为只读元组类型。

```js
let point = [3, 4] as const;
 
function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}
 
distanceFromOrigin(point);
// Argument of type 'readonly [3, 4]' is not assignable to parameter of type '[number, number]'.
// The type 'readonly [3, 4]' is 'readonly' and cannot be assigned to the mutable type '[number, number]'.
```

在这里，`distanceFromOrigin` 从不修改它的元素，但它期望接收一个可变的元组。
由于 `point` 的类型被推断为 `readonly [3, 4]`，它将与 `[number, number]` 不兼容，因为后者的类型无法保证 `point` 的元素不会被修改。