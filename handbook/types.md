# 常见类型

在本章中，我们将介绍在JavaScript代码中常见的一些值类型，并解释在TypeScript中描述这些类型的相应方法。这并非一个详尽的列表，后续章节将介绍更多命名和使用其他类型的方法。

类型不仅出现在类型标注中，还出现在更多其他地方。当我们了解这些类型本身时，我们也会了解到可以在哪些地方引用这些类型来构建新的构造。

我们先来回顾一下在编写JavaScript或TypeScript代码时可能会遇到的最基本和最常见的类型。这些类型稍后将构成更复杂类型的核心构建块。

# 基础类型

JavaScript中有三种非常常用的原语 `string`、`number` 和 `boolean`。在TypeScript中，每种原语都有对应的类型。
如你所料，如果你对这些类型的值使用 JavaScript 的 `typeof` 操作符，也会看到相同的名称：

- `string` 表示如“Hello, world”这样的字符串值
- `number` 是用于表示像 42 这样的数字的。JavaScript 没有为整数设置特殊的运行时值，因此没有与 `int` 或 `float` 相对应的类型——所有类型都只是 number
- `boolean` 类型用于表示 `true` 和 `false` 两个值

> 类型名称 `String`、`Number` 和 `Boolean`（以大写字母开头）是合法的，但它们指的是一些特殊的内置类型，在你的代码中很少出现。对于类型，请始终使用 string、number 和 boolean。

# 数组

要指定一个数组的类型，如[1, 2, 3]，你可以使用 `number[]` 这种语法；这种语法适用于任何类型（例如，`string[]` 表示字符串数组，以此类推）。你可能还会看到写成Array<number>的形式，意思是一样的。当我们学习泛型时，会进一步了解 `T<U>` 这种语法。

> 请注意，[number] 是另一回事；请参阅有关元组的部分。

# any

TypeScript 还有一个特殊的类型 `any`，当你不希望某个特定值引发类型检查错误时，就可以使用它。

当某个值的类型为 `any` 时，你可以访问它的任何属性（这些属性本身也是 `any` 类型），像调用函数一样调用它，将它赋值给（或从其赋值）任何类型的值，或者执行几乎所有语法上合法的操作：

```js
let obj: any = { x: 0 };
// None of the following lines of code will throw compiler errors.
// Using `any` disables all further type checking, and it is assumed
// you know the environment better than TypeScript.
obj.foo();
obj();
obj.bar = 100;
obj = "hello";
const n: number = obj;
```

当你不想仅仅为了说服 TypeScript 某行代码是正确的而写出一个冗长的类型时，`any` 类型就很有用。

## noImplicitAny

当你不指定类型，且 TypeScript 无法从上下文推断出类型时，编译器通常会默认为 any。

不过，你通常希望避免这种情况，因为“any”是没有进行类型检查的。使用编译器标志“noImplicitAny”可以将任何隐式的“any”标记为错误。

# 变量上的类型标注

当你使用const、var或let声明变量时，你可以选择性地添加一个类型标注来明确指定变量的类型：

```js
let myName: string = "Alice";
```

> TypeScript 不使用像 int x = 0; 这样的“左类型”声明方式。类型标注总是跟在被标注的对象之后。

不过，在大多数情况下，这并不是必需的。只要有可能，TypeScript就会尝试自动推断代码中的类型。

大多数情况下，你无需明确学习推理规则。如果你刚开始学习，试着少用一些类型标注——你可能会惊讶地发现，只需要很少的类型标注，TypeScript就能完全理解你在做什么。

# 函数

函数是JavaScript中传递数据的主要方式。TypeScript允许你指定函数的输入值和输出值的类型。

## 入参类型标注

在声明函数时，可以在每个参数后添加类型标注，以声明函数接受的参数类型。参数类型标注位于参数名称之后：

```js
function greet(name: string) {
  console.log("Hello, " + name.toUpperCase() + "!!");
}
```

当参数带有类型标注时，该函数的参数将接受检查：

```js
// 将会导致运行时错误
greet(42);
// Argument of type 'number' is not assignable to parameter of type 'string'.
```

> 即使你的参数没有类型标注，TypeScript仍然会检查你传递的参数数量是否正确。

## 返回值类型标注

你也可以添加返回类型标注。返回类型标注出现在参数列表之后：

```js
function getFavoriteNumber(): number {
  return 26;
}
```

与变量类型标注类似，通常不需要为函数添加返回类型标注，因为TypeScript会根据函数的返回语句来推断其返回类型。在上述示例中，类型标注并未改变任何内容。一些代码库会出于文档目的、防止意外更改或个人偏好而明确指定返回类型。

### 返回 Promise 的函数

如果你想为返回Promise的函数的返回类型添加注解，你应该使用Promise类型：

```js
async function getFavoriteNumber(): Promise<number> {
  return 26;
}
```

## 匿名函数

匿名函数与函数声明略有不同。当函数出现在TypeScript能够确定其调用方式的位置时，该函数的参数会被自动赋予类型。

示例：

```js
const names = ["Alice", "Bob", "Eve"];
 
// Contextual typing for function - parameter s inferred to have type string
names.forEach(function (s) {
  console.log(s.toUpperCase());
});
 
// Contextual typing also applies to arrow functions
names.forEach((s) => {
  console.log(s.toUpperCase());
});
```

尽管参数s没有类型标注，但TypeScript利用forEach函数的类型以及数组的推断类型来确定s将具有的类型。

这个过程被称为上下文类型推断，因为函数出现的上下文决定了它应该具有的类型。

与推理规则类似，你无需明确了解这一过程是如何发生的，但理解这一过程确实会发生，有助于你注意到何时不需要类型标注。稍后，我们将看到更多关于值出现的上下文如何影响其类型的示例。

# 对象类型

除了原始类型外，你会遇到的最常见的类型是对象类型。这指的是任何具有属性的JavaScript值，几乎所有的JavaScript值都是对象！要定义一个对象类型，我们只需列出其属性及其类型。

例如，这里有一个接受类似点对象的函数：

```js
// The parameter's type annotation is an object type
function printCoord(pt: { x: number; y: number }) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

在这里，我们为参数添加了一个带有两个属性（x和y）的类型注释，这两个属性都是 `number` 类型。您可以使用逗号或分号来分隔属性，且无论使用哪种分隔符，最后一个分隔符都是可选的。

每个属性的“type”部分也是可选的。如果不指定类型，则默认为任意类型。

## 可选属性

对象类型还可以指定其部分或全部属性为可选属性。为此，需要在属性名称后添加一个问号（?）：

```js
function printName(obj: { first: string; last?: string }) {
  // ...
}
// Both OK
printName({ first: "Bob" });
printName({ first: "Alice", last: "Alisson" });
```

在 JavaScript 中，如果你访问一个不存在的属性，得到的值会是 `undefined`，而不是运行时错误。因此，当你从可选属性中读取值时，必须在使用之前检查是否为 `undefined`。

```js
function printName(obj: { first: string; last?: string }) {
  // Error - might crash if 'obj.last' wasn't provided!
  console.log(obj.last.toUpperCase()); // 'obj.last' is possibly 'undefined'.
  if (obj.last !== undefined) {
    // OK
    console.log(obj.last.toUpperCase());
  }
 
  // A safe alternative using modern JavaScript syntax:
  console.log(obj.last?.toUpperCase());
}
```

# 联合类型

TypeScript的类型系统允许你使用各种运算符从现有类型构建新类型。既然我们已经知道如何编写一些类型，那么是时候开始以有趣的方式将它们组合起来了。

## 定义联合类型

你可能见到的第一种类型组合方式是联合类型。联合类型是由两个或更多其他类型组成的类型，表示其值可能是这些类型中的任何一个。我们将这些类型分别称为联合的成员。

让我们编写一个可以对字符串或数字进行操作的函数：

```js
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
// OK
printId(101);
// OK
printId("202");
// Error
printId({ myID: 22342 });
// Argument of type '{ myID: number; }' is not assignable
// to parameter of type 'string | number'.
```

联合成员的分隔符可以放在第一个元素之前，因此你也可以这样写：

```js
function printTextOrNumberOrBool(
  textOrNumberOrBool:
    | string
    | number
    | boolean
) {
  console.log(textOrNumberOrBool);
}
```

## 使用联合类型

为联合类型提供一个匹配的值很容易——只需提供一个与联合中任一成员匹配的类型即可。如果你有一个联合类型的值，该如何处理它呢？

TypeScript 仅在联合类型的每个成员都有效时才允许执行操作。例如，如果你有一个字符串和数字的联合类型 string | number，那么你不能使用仅在字符串上可用的方法：

```js
function printId(id: number | string) {
  console.log(id.toUpperCase());
  // Property 'toUpperCase' does not exist on type 'string | number'.
  // Property 'toUpperCase' does not exist on type 'number'.
}
```

解决方案是使用代码来收窄联合类型，就像在JavaScript中不使用类型标注时一样。当TypeScript能够根据代码结构推断出某个值的更具体类型时，就会发生类型收窄。

例如，TypeScript知道只有字符串值才会具有“string”的typeof值：

```js
function printId(id: number | string) {
  if (typeof id === "string") {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else {
    // Here, id is of type 'number'
    console.log(id);
  }
}
```

另一个例子是使用像 Array.isArray 这样的函数：

```js
function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // Here: 'x' is 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // Here: 'x' is 'string'
    console.log("Welcome lone traveler " + x);
  }
}
```

注意，在else分支中，我们不需要做任何特殊处理——如果 x 不是 `string[]` 类型，那么它一定是 `string` 类型。

有时你会遇到一个联合体，其中所有成员都有一些共同之处。例如，数组和字符串都有slice方法。如果一个联合体中的每个成员都有一个共同的属性，那么你可以在不进行类型收窄的前提下使用该属性：

```js
// Return type is inferred as number[] | string
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}
```

# 类型别名

我们一直通过在类型标注中直接编写对象类型和联合类型来使用它们。这很方便，但通常我们会多次使用相同的类型，并希望通过一个统一的名称来引用它。

类型别名，顾名思义，即为任何类型的名称。类型别名的语法如下：

```js
type Point = {
  x: number;
  y: number;
};
// Exactly the same as the earlier example
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 100, y: 100 });
```

实际上，你可以使用类型别名来为任何类型命名，而不仅仅是对象类型。例如，类型别名可以为联合类型命名：

```js
type ID = number | string;
```

请注意，别名仅仅是别名——你不能使用类型别名来创建同一类型的不同/独特“版本”。当你使用别名时，就像你直接写了被别名的类型一样。换句话说，这段代码可能看起来是非法的，但在TypeScript中是可以的，因为这两种类型都是同一类型的别名：

```js
type UserInputSanitizedString = string;
 
function sanitizeInput(str: string): UserInputSanitizedString {
  return sanitize(str);
} 
// Create a sanitized input
let userInput = sanitizeInput(getInput());

// Can still be re-assigned with a string though
userInput = "new input";
```

# 接口

接口声明是另一种命名对象类型的方式：

```js
interface Point {
  x: number;
  y: number;
}
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 100, y: 100 });
```

就像我们在上面使用类型别名一样，这个例子就像我们使用了匿名对象类型一样。TypeScript只关心我们传递给printCoord的值的结构——它只关心它是否具有预期的属性。TypeScript之所以被称为结构化类型系统，正是因为它只关注类型的结构和功能。

## 类型别名 对比 接口

类型别名和接口非常相似，在许多情况下，你可以自由地在它们之间做出选择。接口的几乎所有特性在类型中都是可用的，关键的区别在于，类型不能被重新打开以添加新属性，而接口则始终是可扩展的。

- 接口

  ```js
  // 接口继承
  interface Animal {
    name: string;
  }
  interface Bear extends Animal {
    honey: boolean;
  }
  const bear = getBear();
  bear.name;
  bear.honey;

  // 给已存在的接口增加新属性
  interface Window {
    title: string;
  }
  interface Window {
    ts: TypeScriptAPI;
  }
  const src = 'const a = "Hello World"';
  window.ts.transpileModule(src, {});
  ```
- 类型别名

  ```js
  // 类型继承
  type Animal = {
    name: string;
  }
  type Bear = Animal & { 
    honey: boolean;
  }
  const bear = getBear();
  bear.name;
  bear.honey;
  
  // 类型一旦创建，禁止修改
  type Window = {
    title: string;
  }
  type Window = { // Error: Duplicate identifier 'Window'.
    ts: TypeScriptAPI;
  }
  ```

在后续章节中，你将学到更多关于这些概念的知识，所以如果你现在还不完全理解，也不用担心。

- 在 TypeScript 4.2 版本之前，类型别名名称可能会出现在错误消息中，有时会替代等效的匿名类型（这可能是可取的，也可能是不可取的）。在错误消息中，接口总是会被命名。
- 类型别名可能无法参与声明合并，但接口可以。
- 接口只能用于声明对象的形状，而不能用于重命名图元。
- 在错误消息中，接口名称将始终以原始形式出现，但仅当它们被直接使用时才会如此。
- 对于编译器而言，使用带有 `extends` 的接口通常比使用带有交集的类型别名性能更高

在大多数情况下，你可以根据个人喜好进行选择，而TypeScript会提示你是否需要将某物声明为另一种类型。如果你希望有一个启发性的建议，那么在需要使用 `type` 的特性之前，请一直使用 `interface`。

# 类型断言

有时你会掌握一些关于值类型的信息，而TypeScript却无法获知这些信息。

例如，如果你在使用 `document.getElementById`，TypeScript只知道它会返回某种 `HTMLElement`，但你可能知道你的页面总是会包含一个具有给定ID的 `HTMLCanvasElement`。

在这种情况下，你可以使用类型断言来指定一个更具体的类型：

```js
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

与类型标注类似，类型断言也会被编译器移除，不会影响代码的运行时行为。

你也可以使用尖括号语法（除非代码位于 .tsx 文件中），它等效于：

```js
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

> 提醒：由于类型断言在编译时被移除，因此没有与类型断言相关的运行时检查。如果类型断言错误，也不会生成异常或 `null` 。

TypeScript 仅允许类型断言，这些断言可以将类型转换为更具体或更不具体的版本。此规则可防止“不可能”的强制类型转换，例如：

```js
const x = "hello" as number;
// Conversion of type 'string' to type 'number'
// may be a mistake because neither type sufficiently overlaps with the other.
// If this was intentional, convert the expression to 'unknown' first.
```

有时，这条规则可能过于保守，会禁止一些可能有效的更复杂的类型转换。如果发生这种情况，你可以使用两个断言，首先断言为任何类型（或稍后我们将介绍的未知类型），然后再断言为所需的类型：

```js
const a = expr as any as T;
```

# 字面量类型

字面量类型 除了通用的字符串和数字类型外，我们还可以在类型位置上引用特定的字符串和数字。

对此的一种理解方式是考虑JavaScript如何提供不同的变量声明方式。`var`和`let`都允许更改变量内部保存的内容，而`const`则不允许。这体现在TypeScript如何为字面量创建类型上。

```js
let changingString = "Hello World";
changingString = "Olá Mundo";
// Because `changingString` can represent any possible string, that
// is how TypeScript describes it in the type system
changingString; // let changingString: string

const constantString = "Hello World";
// Because `constantString` can only represent 1 possible string, it
// has a literal type representation
constantString; //const constantString: "Hello World"
```

就其本身而言，字面类型并不是很有价值：

```js
let x: "hello" = "hello";
// OK
x = "hello";
// ...
x = "howdy"; // Type '"howdy"' is not assignable to type '"hello"'.
```

一个变量如果只能取一个值，那它就没多大用处了！

但是，通过将字面量组合成联合体，你可以表达出一个更有用的概念——例如，只接受一组特定已知值的函数：

```js
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre");
// Argument of type '"centre"' is not assignable to parameter 
// of type '"left" | "right" | "center"'.
```

数值字面量类型的工作方式与此相同：

```js
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}
```

当然，你可以将这些与非字面类型结合起来：

```js
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
// Argument of type '"automatic"' is not assignable to parameter of type 'Options | "auto"'.
```

还有一种字面类型：布尔字面量。布尔字面量只有两种，正如你所猜测的，它们是 `true` 和 `false`。布尔类型本身实际上是 `true | false` 并集的别名。

## 字面推断

当你使用一个对象来初始化一个变量时，TypeScript会假设该对象的属性值可能会在后续发生变化。例如，如果你编写了这样的代码：

```js
const obj = { counter: 0 };
if (someCondition) {
  obj.counter = 1;
}
```

TypeScript 不认为将 1 赋值给之前为 0 的字段是错误的。换言之，obj.counter 的类型必须是数字，而不是 0，因为类型用于确定读取和写入行为。

这同样适用于字符串：

```js
declare function handleRequest(url: string, method: "GET" | "POST"): void;
 
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
// Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'.
```

在上述示例中，req.method 被推断为字符串类型，而非“GET”。因为在创建 req 和调用 handleRequest 之间，代码可以被执行，而 handleRequest 可能会为 req.method 赋值一个新的字符串，如“GUESS”。因此，TypeScript 认为这段代码存在错误。

有两种方法可以解决这个问题。

1. 你可以在以下任一位置添加类型断言来更改推断：

  ```js
  // 变更 1:
  const req = { url: "https://example.com", method: "GET" as "GET" };
  // 变更 2
  handleRequest(req.url, req.method as "GET");
  ```

  - 变更1 意味着“我期望req.method始终具有字面类型'GET'”，从而防止之后可能对该字段分配'GUESS'。
  - 变更2 意味着“由于其他原因，我知道req.method的值为'GET'”。

2. 你可以使用`as const`将整个对象转换为类型字面量：

  ```js
  const req = { url: "https://example.com", method: "GET" } as const;
  handleRequest(req.url, req.method);
  ```

  as const后缀的作用类似于const，但对于类型系统而言，它确保所有属性都被赋予字面类型，而不是像 `string` 或 `number` 这样的更通用的类型。

# null 和 undefined

JavaScript 有两个原始值用于表示缺失值或未初始化值：`null` 和 `undefined`。

TypeScript中有两个同名对应类型。这些类型如何表现取决于你是否启用了 `strictNullChecks` 选项。

- 关闭 strictNullChecks

  在关闭 `strictNullChecks` 的情况下，仍可以正常访问可能为 `null` 或 `undefined` 的值，并且可以将 `null` 和 `undefined` 值赋给任何类型的属性。这与没有空值检查的语言（如C#、Java）的行为相似。对这些值缺乏检查往往是导致错误的主要根源；我们始终建议，如果代码库中可行的话，应始终开启 `strictNullChecks`。

- 开启 strictNullChecks

  在启用 `strictNullChecks` 的情况下，当值是 `null` 或 `undefined` 时，您需要在使用该值的方法或属性之前先测试这些值。就像在使用可选属性之前检查是否为 `undefined` 一样，我们也可以使用收窄来检查可能为 `null` 的值：

  ```js
  function doSomething(x: string | null) {
    if (x === null) {
      // do nothing
    } else {
      console.log("Hello, " + x.toUpperCase());
    }
  }
  ```

- 非空断言运算符 ! 后缀

  TypeScript 还有一种特殊的语法，可以在不进行任何显式检查的情况下从类型中移除 `null` 和 `undefined`。在任何表达式后加上 `!` 实际上是一种类型断言，表明该值不是 `null` 或 `undefined`：
  ```js
  function liveDangerously(x?: number | null) {
    // No error
    console.log(x!.toFixed());  
  }
  ```

  就像其他类型断言一样，这并不会改变代码的运行时行为，因此，仅在你知道值不可能为 null 或 undefined 时使用 ! 非常重要。

  > 当 liveDangerously 被传入一个空值参数时，仍然会执行 x.toFixed() 进而引发运行时错误

# 枚举

枚举是TypeScript为JavaScript添加的一项功能，它允许描述一个值，该值可以是若干个可能命名的常量之一。与大多数TypeScript功能不同，这不是对JavaScript的类型级添加，而是对语言和运行时的补充。因此，虽然你应该知道这项功能的存在，但除非你确信无疑，否则还是暂缓使用为好。你可以在枚举（Enums）参考页面上阅读更多关于枚举的信息。

# 不太常见的原语

值得一提的是，在JavaScript中，类型系统还表示了其他原语。不过我们在此不作深入探讨。

## bigint

从 ES2020 开始，`JavaScript` 中引入了一个用于表示非常大的整数的原语，即 `BigInt`：

```js
// Creating a bigint via the BigInt function
const oneHundred: bigint = BigInt(100);
// Creating a BigInt via the literal syntax
const anotherHundred: bigint = 100n;
```

## symbol

在JavaScript中，有一个原始类型（primitive）用于通过Symbol()函数创建全局唯一的引用：

```js
const firstName = Symbol("name");
const secondName = Symbol("name");
 
if (firstName === secondName) {
  // This comparison appears to be unintentional
  // because the types 'typeof firstName' and 'typeof secondName' have no overlap.
  // Can't ever happen
}
```



