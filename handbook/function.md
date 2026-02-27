# 函数进阶

函数是任何应用程序的基本构建块，无论是本地函数、从其他模块导入的函数，还是类上的方法。它们也是值，就像其他值一样，TypeScript 有多种方式来描述如何调用函数。接下来，我们将学习如何编写描述函数的类型。

# 函数类型表达式

描述函数最简单的方式是使用函数类型表达式。这些类型在语法上与箭头函数相似：

```js
function greeter(fn: (a: string) => void) {
  fn("Hello, World");
}
function printToConsole(s: string) {
  console.log(s);
}
greeter(printToConsole);
```

语法 `(a: string) => void` 表示“一个只有一个参数 a，类型为 string，且没有返回值的函数”。与函数声明一样，如果未指定参数类型，则默认为 `any`。

!> 注意，参数名是 **必需的**。函数类型 (string) => void 表示“一个带有名为 string 的参数且参数类型为 any 的函数”！

当然，我们可以使用类型别名来命名函数类型：

```js
type GreetFunction = (a: string) => void;
function greeter(fn: GreetFunction) {
  // ...
}
```

# 调用签名

在JavaScript中，函数除了可调用之外，还可以具有属性。然而，函数类型表达式语法不允许声明属性。如果我们想描述具有属性的可调用对象，可以在对象类型中编写一个调用签名：

```js
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}
 
function myFunc(someArg: number) {
  return someArg > 3;
}
myFunc.description = "default description";
 
doSomething(myFunc);
```

请注意，其语法与函数类型表达式略有不同——在参数列表和返回类型之间使用冒号（:）而不是箭头（=>）。

!> **译者注：** 感觉是奇技淫巧，不到万不得已，我不会用这个特性

# 构造签名

JavaScript函数也可以通过new运算符来调用。TypeScript将这些函数称为构造函数，因为它们通常会创建一个新的对象。你可以通过在调用签名前添加new关键字来编写构造签名：

```js
type SomeConstructor = {
  new (s: string): SomeObject;
};
function fn(ctor: SomeConstructor) {
  return new ctor("hello");
}
```

某些对象，如JavaScript的Date对象，可以用new或不用new来调用。你可以在同一类型中任意组合调用签名和构造签名：

```js
interface CallOrConstruct {
  (n?: number): string;
  new (s: string): Date;
}
 
function fn(ctor: CallOrConstruct) {
  // Passing an argument of type `number` to `ctor` matches it against
  // the first definition in the `CallOrConstruct` interface.
  console.log(ctor(10));
  // (parameter) ctor: CallOrConstruct
  // (n?: number) => string
 
  // Similarly, passing an argument of type `string` to `ctor` matches it
  // against the second definition in the `CallOrConstruct` interface.
  console.log(new ctor("10"));                
  //(parameter) ctor: CallOrConstruct
  // new (s: string) => Date
}
 
fn(Date);
```

# 泛型函数

编写一个输入类型与输出类型相关，或者两个输入类型以某种方式相关的函数是很常见的。让我们暂时考虑一个返回数组第一个元素的函数：

```js
function firstElement(arr: any[]) {
  return arr[0];
}
```

这个函数完成了它的工作，但遗憾的是它的返回类型是any。如果函数能返回数组元素的类型，那就更好了。

在TypeScript中，当我们想要描述两个值之间的对应关系时，会使用泛型。我们通过在函数签名中声明类型参数来实现这一点：

```js
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
```

通过在此函数中添加一个类型参数Type并在两处使用它，我们就在函数的输入（数组）和输出（返回值）之间建立了一个联系。现在，当我们调用它时，会得到一个更具体的类型：

```js
// s is of type 'string'
const s = firstElement(["a", "b", "c"]);
// n is of type 'number'
const n = firstElement([1, 2, 3]);
// u is of type undefined
const u = firstElement([]);
```

## 类型推断

请注意，在这个示例中，我们无需指定Type。TypeScript会自动推断并选择类型。

我们也可以使用多个类型参数。例如，一个独立的map函数版本可以这样写：

```js
function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
  return arr.map(func);
}
 
// Parameter 'n' is of type 'string'
// 'parsed' is of type 'number[]'
const parsed = map(["1", "2", "3"], (n) => parseInt(n));
```

请注意，在此示例中，TypeScript 可以根据给定的字符串数组推断出 Input 类型参数的类型，并根据函数表达式的返回值（number）推断出 Output 类型参数的类型。

## 类型约束

我们已经编写了一些可以处理任何类型值的通用函数。有时我们希望关联两个值，但只能对值的某个子集进行操作。在这种情况下，我们可以使用约束来限制类型参数可以接受的类型种类。

让我们编写一个函数，该函数返回两个值中较大的那个。为此，我们需要一个长度属性，该属性是一个数字。我们通过编写一个extends子句来将类型参数约束为该类型：

```js
function longest<Type extends { length: number }>(a: Type, b: Type) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}
 
// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString is of type 'alice' | 'bob'
const longerString = longest("alice", "bob");
// Error! Numbers don't have a 'length' property
const notOK = longest(10, 100);
// Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
```

这个例子中有几个值得注意的有趣点。我们让TypeScript推断出`longest`函数的返回类型。返回类型推断也适用于泛型函数。

因为我们已将Type约束为 `{ length: number }`，所以我们能够访问a和b参数的.length属性。如果没有类型约束，我们将无法访问这些属性，因为值可能是其他没有length属性的类型。

根据参数推断出了 longerArray 和 longerString 的类型。*记住，泛型的作用就是将两个或多个具有相同类型的值关联起来！*

最后，正如我们所愿，对 longest(10, 100) 的调用被拒绝了，因为数字类型没有 .length 属性。

## 使用泛型约束

在使用泛型约束时，常会出现以下错误：

```js
function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type {
  if (obj.length >= minimum) {
    return obj;
  } else {
    return { length: minimum };
    // Type '{ length: number; }' is not assignable to type 'Type'.
    // '{ length: number; }' is assignable to the constraint of type 'Type', 
    // but 'Type' could be instantiated with a different subtype of constraint '{ length: number; }'.
  }
}
```

看起来这个函数似乎没问题——类型被限定为{ length: number }，并且函数要么返回Type，要么返回一个符合该约束的值。问题在于，该函数承诺返回与传入对象类型相同的对象，而不仅仅是某个符合约束的对象。如果这段代码是合法的，那么你可能会编写出肯定无法运行的代码：

```js
// 'arr' gets value { length: 6 }
const arr = minimumLength([1, 2, 3], 6);
// and crashes here because arrays have
// a 'slice' method, but not the returned object!
console.log(arr.slice(0));
```

## 指定类型参数

TypeScript通常可以推断出泛型调用中预期的类型参数，但并非总是如此。例如，假设你编写了一个函数来合并两个数组：

```js
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
```

通常，使用不匹配的数组调用此函数会出错：

```js
const arr = combine([1, 2, 3], ["hello"]);
// Type 'string' is not assignable to type 'number'.
```

然而，如果你打算这样做，你可以手动指定类型：

```js
const arr = combine<string | number>([1, 2, 3], ["hello"]);
```

## 泛型最佳实践

编写泛型函数很有趣，人们很容易沉迷于类型参数。类型参数过多或在不需要的地方使用约束，可能会降低推理的成功率，让调用你函数的人感到沮丧。

### 类型下推

以下是两种看似相似的编写函数的方式：

```js
function firstElement1<Type>(arr: Type[]) {
  return arr[0];
}
function firstElement2<Type extends any[]>(arr: Type) {
  return arr[0];
}
// a: number (good)
const a = firstElement1([1, 2, 3]);
// b: any (bad)
const b = firstElement2([1, 2, 3]);
```

乍一看，这些可能看起来一模一样，但`firstElement1`是编写此函数的更好方式。它推断出的返回类型是`Type`，而`firstElement2`推断出的返回类型是`any`，因为TypeScript必须使用约束类型来解析`arr[0]`表达式，而不是在调用时“等待”解析该元素。

> 在可能的情况下，直接使用类型参数本身，而不是对其进行约束

### 减少泛型参数数量

这是另一对相似的函数：

```js
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func);
}
 
function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func);
}
```

`filter2` 我们创建了一个不关联两个值的类型参数Func。这是一个危险信号，因为这意味着想要指定类型参数的调用者必须毫无理由地手动指定一个额外的类型参数。Func除了让函数更难阅读和理解之外，别无他用！

> 尽可能使用更少的泛型参数

### 类型参数需两处引用

有时我们会忘记，一个函数可能并不需要泛化：

```js
function greet<Str extends string>(s: Str) {
  console.log("Hello, " + s);
}
greet("world");
```

我们也可以轻松地编写一个更简单的版本：

```js
function greet(s: string) {
  console.log("Hello, " + s);
}
```

记住，类型参数用于关联多个值的类型。如果一个类型参数在函数签名中只使用了一次，那么它并没有关联任何东西。这包括推断出的返回类型；例如，如果Str是greet函数推断出的返回类型的一部分，那么它就会关联参数类型和返回类型，因此尽管在编写的代码中只出现了一次，但会被使用两次。

> 如果一个类型参数只出现在一个位置，那么请慎重考虑你是否真的需要它

# 可选参数

JavaScript中的函数通常会接受数量可变的参数。例如，number对象的toFixed方法会接受一个可选的数字位数参数：

```js
function f(n: number) {
  console.log(n.toFixed()); // 0 arguments
  console.log(n.toFixed(3)); // 1 argument
}
```

我们可以在TypeScript中通过在参数后面加上 `?` 来将其标记为可选参数，从而对其进行建模：

```js
function f(x?: number) {
  // ...
}
f(); // OK
f(10); // OK
```

尽管该参数被指定为 `number` 类型，但 `x` 参数实际上将具有 `number|undefined` 类型，因为在JavaScript中，未指定的参数将获取值undefined。

您还可以提供一个参数默认值：

```js
function f(x = 10) {
  // ...
}
```

在函数f的主体中，x的类型将是数字，因为任何未定义的参数都将被替换为10。请注意，当参数是可选的时，调用者总是可以传递undefined，因为这只是在模拟一个“缺失”的参数：

```js
// All OK
f();
f(10);
f(undefined);
```

## 回调函数中的可选参数

一旦你了解了可选参数和函数类型表达式，在编写调用回调函数的代码时，就很容易犯以下错误：

```js
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}
```

人们在编写索引时（作为可选参数）通常的意图是什么？他们希望这两个调用都是合法的：

```js
myForEach([1, 2, 3], (a) => console.log(a));
myForEach([1, 2, 3], (a, i) => console.log(a, i));
```

这实际上意味着，callback可能会被调用并带有一个参数。换言之，函数定义表明其实现可能如下：

```js
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    // I don't feel like providing the index today
    callback(arr[i]);
  }
}
```

反过来，TypeScript会强制执行这一含义，并发出实际上不可能出现的错误：

```js
myForEach([1, 2, 3], (a, i) => {
  console.log(i.toFixed()); // 'i' is possibly 'undefined'.
});
```

在JavaScript中，如果调用函数的参数个数多于函数的参数个数，那么多余的参数将被忽略。TypeScript的行为与此相同。具有较少参数（类型相同）的函数总是可以替代具有更多参数的函数。

> 在为回调函数编写函数类型时，除非你打算在调用函数时不传递该参数，否则切勿编写可选参数

# 函数重载

一些JavaScript函数可以在不同的参数数量和类型下被调用。例如，你可能编写一个函数来生成一个Date对象，该函数可以接受一个时间戳（一个参数）或一个月/日/年的指定（三个参数）。

在TypeScript中，我们可以通过编写重载签名来指定一个可以以不同方式调用的函数。为此，需要编写多个函数签名（通常为两个或更多），然后编写函数体：

```js
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3);
// No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.
```

在这个例子中，我们编写了两个重载：一个接受一个参数，另一个接受三个参数。这两个签名被称为重载签名。

然后，我们编写了一个具有兼容签名的函数实现。函数有一个实现签名，但这个签名不能直接调用。尽管我们在必需参数之后编写了一个带有两个可选参数的函数，但不能用两个参数来调用它！

## 重载签名与实现签名

这是一个常见的混淆点。人们经常会写出这样的代码，却不明白为什么会出错：

```js
function fn(x: string): void;
function fn() {
  // ...
}
// Expected to be able to call with zero arguments
fn();
// Expected 1 arguments, but got 0.
```

再说一次，用于编写函数体的签名无法从外部“看到”。

> 实现部分的签名从外部不可见。在编写重载函数时，函数的实现部分上方应始终有两个或更多签名。

实现签名也必须与重载签名兼容。例如，下面这些函数存在错误，因为实现签名与重载签名不匹配：

```js
function fn(x: boolean): void;
// Argument type isn't right
function fn(x: string): void;
// This overload signature is not compatible with its implementation signature.
function fn(x: boolean) {}
```

```js
function fn(x: string): string;
// Return type isn't right
function fn(x: number): boolean;
// This overload signature is not compatible with its implementation signature.
function fn(x: string | number) {
  return "oops";
}
```

## 函数重载推荐用法

与泛型类似，在使用函数重载时，您应遵循一些准则。遵循这些原则将使您的函数更易于调用、更易于理解、更易于实现。

让我们考虑一个返回字符串或数组长度的函数：

```js
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}
```

这个函数是可以的；我们可以用字符串或数组来调用它。但是，我们不能使用可能是字符串或数组的值来调用它，因为TypeScript只能将函数调用解析为单个重载：

```js
len(""); // OK
len([0]); // OK
len(Math.random() > 0.5 ? "hello" : [0]);
// No overload matches this call.
//  Overload 1 of 2, '(s: string): number', gave the following error.
//    Argument of type 'number[] | "hello"' is not assignable to parameter of type 'string'.
//      Type 'number[]' is not assignable to type 'string'.
//  Overload 2 of 2, '(arr: any[]): number', gave the following error.
//    Argument of type 'number[] | "hello"' is not assignable to parameter of type 'any[]'.
//      Type 'string' is not assignable to type 'any[]'.
```

由于两个重载函数的参数数量和返回类型都相同，我们可以编写一个非重载版本的函数：

```js
function len(x: any[] | string) {
  return x.length;
}
```

这样好多了！调用者可以用任何一种值来调用这个方法，而且作为额外的好处，我们不必费心去确定一个正确的实现签名。

> 在可能的情况下，总是更倾向于使用带有联合类型的参数，而不是重载

# this 指针

TypeScript会通过代码流分析来推断函数中 `this` 应该是什么，例如在以下情况下：

```js
const user = {
  id: 123,
 
  admin: false,
  becomeAdmin: function () {
    this.admin = true;
  },
};
```

TypeScript 理解函数 `user.becomeAdmin` 有一个对应的 `this`，即外部对象 `user`。嘿，这在很多情况下已经足够了，但在很多情况下，你需要对 `this` 所代表的对象有更多的控制。JavaScript 规范规定不能有名为 `this` 的参数，因此 TypeScript 利用这一语法空间，让你在函数体中声明 `this` 的类型。

```js
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}
 
const db = getDB();
const admins = db.filterUsers(function (this: User) {
  return this.admin;
});
```

这种模式在回调式API中很常见，在这种模式中，通常由另一个对象来控制函数何时被调用。请注意，要实现这种行为，你需要使用普通函数，而不是箭头函数：

```js
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}
 
const db = getDB();
const admins = db.filterUsers(() => this.admin);
// The containing arrow function captures the global value of 'this'.
// Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
```

> **译者注：** 这里的示例太少了，难以理解，先不管，继续往后面学习。

# 其它类型

在处理函数类型时，你会遇到一些经常出现的额外类型。与所有类型一样，你可以在任何地方使用它们，但这些类型在函数的上下文中尤其重要。

## void

void 表示不返回值的函数的返回值。当函数没有任何返回语句，或者没有从这些返回语句中返回任何显式值时，就会推断出类型为 void：

```js
// The inferred return type is void
function noop() {
  return;
}
```

在JavaScript中，不返回任何值的函数将隐式返回undefined值。然而，在TypeScript中，void和undefined并不是一回事。本章末尾有更多详细信息。

> `void` 和 `undefined` 不一样.

## object

特殊类型对象指的是任何非原始类型（`string` `bnumber` `bigint` `boolean` `symbol` `null` `undefined`）的值。
它与 `空对象类型{}` 不同，也与 `全局类型Object` 不同。你很可能永远不会用到 `全局类型Object`。

> object 不是 Object，永远使用 object 而不是 Object

请注意，在JavaScript中，函数值是对象：它们具有属性，原型链中包含Object.prototype，是Object的实例，可以对它们调用Object.keys方法，等等。因此，在TypeScript中，函数类型也被视为对象。

## unknown

`unknownn` 表示任何值。这与 `any` 相似，但更为安全，因为 `unkonwn` 执行任何操作都是非法的：

```js
function f1(a: any) {
  a.b(); // OK
}
function f2(a: unknown) {
  a.b(); // FAIL 'a' is of type 'unknown'.
}
```

这在描述函数类型时非常有用，因为你可以描述接受任何值的函数，而无需在函数体中指定任何值。

相反，你可以描述一个返回未知类型值的函数：

```js
function safeParse(s: string): unknown {
  return JSON.parse(s);
}
// Need to be careful with 'obj'!
const obj = safeParse(someRandomString);
```

## never

有些函数从不返回值：

```js
function fail(msg: string): never {
  throw new Error(msg);
}
```

`never` 类型表示从未观察到的值。在返回类型中，这意味着函数会抛出异常或终止程序执行。

当 TypeScript 确定联合类型中没有任何剩余内容时，也会出现 `never`。

```js
function fn(x: string | number) {
  if (typeof x === "string") {
    // do something
  } else if (typeof x === "number") {
    // do something else
  } else {
    x; // has type 'never'!
  }
}
```

## Function

全局类型 Function 描述了 JavaScript 中所有函数值都具有的属性，例如 `bind`、`call`、`apply` 等。
它还有一个特殊属性：Function 类型的值始终可以被调用；这些调用会返回任意值。

```js
function doSomething(f: Function) {
  return f(1, 2, 3);
}
```

# 可变参数

除了使用可选参数或重载来创建可以接受不同数量固定参数的函数之外，我们还可以使用剩余参数来定义接受无限数量参数的函数。

剩余参数出现在所有其他参数之后，并使用 `...` 语法：

```js
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}
// 'a' gets value [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4);
```

在 TypeScript 中，这些参数上的类型注解隐式为 any[] 而不是 any，并且给出的任何类型注解都必须是 Array<T> 或 T[] 的形式，或者元组类型（我们稍后会学习）。

反之，我们可以使用扩展运算符从可迭代对象（例如数组）中提供可变数量的参数。例如，数组的 push 方法可以接受任意数量的参数：

```js
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
```

请注意，TypeScript 通常不会假定数组是不可变的。这可能会导致一些意想不到的行为：

```js
// Inferred type is number[] -- "an array with zero or more numbers",
// not specifically two numbers
const args = [8, 5];
const angle = Math.atan2(...args);
// A spread argument must either have a tuple type or be passed to a rest parameter.
```

针对这种情况的最佳解决方案取决于你的代码，但一般来说，使用常量上下文是最直接的解决方案：

```js
// Inferred as 2-length tuple
const args = [8, 5] as const;
// OK
const angle = Math.atan2(...args);
```

使用剩余参数时，如果目标运行时版本较旧，可能需要启用 downlevelIteration。

# 参数解构

你可以使用参数解构来方便地将作为参数提供的对象解包到函数体内的一个或多个局部变量中。在 JavaScript 中，它看起来像这样：

```js
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });
```

对象的类型注解位于解构语法之后：

```js
function sum({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
```

这看起来可能有点冗长，但你也可以在这里使用命名类型：

```js
// Same as prior example
type ABC = { a: number; b: number; c: number };
function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

# 函数的可分配性

函数的 void 返回类型可能会产生一些不寻常但符合预期的行为。

上下文类型化并指定返回类型为 void 并不会强制函数不返回任何值。换句话说，一个上下文函数类型（例如 type voidFunc = () => void）在实现时，可以返回任何其他值，但这些值会被忽略。

因此，以下 type () => void 的实现是有效的：

```js
type voidFunc = () => void;
 
const f1: voidFunc = () => {
  return true;
};
 
const f2: voidFunc = () => true;
 
const f3: voidFunc = function () {
  return true;
};
```

当这些函数之一的返回值被赋给另一个变量时，它将保持 void 类型：

```js
const v1 = f1();
const v2 = f2();
const v3 = f3();
```

这种行为的存在是为了保证即使 Array.prototype.push 返回一个数字，而 Array.prototype.forEach 方法期望一个返回类型为 void 的函数，以下代码仍然有效。

```js
const src = [1, 2, 3];
const dst = [0];
 
src.forEach((el) => dst.push(el));
```

还有一种特殊情况需要注意，当字面函数定义具有 void 返回类型时，该函数不能返回任何内容。

```js
function f2(): void {
  // @ts-expect-error
  return true;
}
 
const f3 = function (): void {
  // @ts-expect-error
  return true;
};
```