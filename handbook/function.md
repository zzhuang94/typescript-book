# 函数进阶

函数是任何应用程序的基本构建块，无论是本地函数、从其他模块导入的函数，还是类上的方法。它们也是值，就像其他值一样，TypeScript 有多种方式来描述如何调用函数。接下来，我们将学习如何编写描述函数的类型。

## 函数类型表达式

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

## 调用签名

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

## 构造签名

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

## 泛型函数

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

### 类型推断

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

### 类型约束

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

### 使用泛型约束

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

### 指定类型参数

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

### 泛型最佳实践

编写泛型函数很有趣，人们很容易沉迷于类型参数。类型参数过多或在不需要的地方使用约束，可能会降低推理的成功率，让调用你函数的人感到沮丧。

#### 类型下推

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

#### 减少泛型参数数量

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

#### 类型参数需两处引用

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

## 可选参数