# 枚举

枚举是 TypeScript 中少数几个并非 JavaScript 类型级扩展的特性之一。

枚举允许开发者定义一组命名常量。使用枚举可以更轻松地记录意图，或创建一组不同的情况。TypeScript 同时提供基于数值和字符串的枚举。

# 数值枚举

我们首先从数值枚举开始，如果您之前接触过其他语言，可能会对它比较熟悉。枚举可以使用 `enum` 关键字定义。

```js
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
```

上面我们有一个数值枚举，其中 `Up` 初始化为 1。
从该值开始，所有后续成员的值都会自动递增。
换句话说，`Direction.Up` 的值为 1，`Down` 的值为 2，`Left` 的值为 3，`Right` 的值为 4。

如果需要，我们可以完全省略初始化器：

```js
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

这里，Up 的值为 0，Down 的值为 1，依此类推。这种自增行为适用于我们可能并不关心成员值本身，但希望每个值都与其他枚举值不同的情况。

使用枚举很简单：只需将任何成员作为枚举本身的属性访问，并使用枚举名称声明类型即可。

```js
enum UserResponse {
  No = 0,
  Yes = 1,
}
 
function respond(recipient: string, message: UserResponse): void {
  // ...
}
 
respond("Princess Caroline", UserResponse.Yes);
```

数值枚举可以混合使用 `计算成员和常量成员`（见下文）。
简而言之，没有初始化器的枚举要么必须位于最前面，要么必须位于使用数值常量或其他常量枚举成员初始化的数值枚举之后。
换句话说，以下情况是不允许的：

```js
enum E {
  A = getSomeValue(),
  B,
  // Enum member must have initializer.
}
```

# 字符串枚举

字符串枚举的概念与之类似，但在运行时存在一些细微差别，如下所述。在字符串枚举中，每个成员都必须使用字符串字面量或另一个字符串枚举成员进行常量初始化。

```js
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

虽然字符串枚举不具备自增特性，但它们的优点在于易于“序列化”。
换句话说，如果您在调试时需要读取数值枚举的运行时值，该值通常是不透明的——它本身并不传达任何有用的含义（尽管反向映射通常有所帮助）。
字符串枚举允许您在代码运行时提供一个有意义且易读的值，而无需考虑枚举成员本身的名称。

# 混合枚举

从技术上讲，枚举可以与字符串和数值成员混合使用，但不清楚为什么要这样做：

```js
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}
```

# 计算成员和常量成员

枚举中的每个成员都有一个与之关联的值，该值可以是常量或计算值。枚举成员在以下情况下被视为常量：

- 它是枚举中的第一个成员，并且没有初始值设定项，在这种情况下，它的值被设定为 0。

```js
// E.X is constant:
enum E {
  X,
}
```

- 它没有初始化器，并且前一个枚举成员是一个数值常量。在这种情况下，当前枚举成员的值将是前一个枚举成员的值加一。

```js
// All enum members in 'E1' and 'E2' are constant.
enum E1 {
  X,
  Y,
  Z,
}
enum E2 {
  A = 1,
  B,
  C,
}
```

- 枚举成员使用常量枚举表达式进行初始化。常量枚举表达式是 TypeScript 表达式的一个子集，它可以在编译时完全求值。一个表达式如果满足以下条件，则它是常量枚举表达式：
  - 枚举字面表达式（本质上是字符串字面量或数值字面量）
  - 对先前定义的常量枚举成员的引用（可以来自不同的枚举）
  - 带括号的常量枚举表达式
  - 应用于常量枚举表达式的一元运算符 +、-、~
  - 以常量枚举表达式为操作数的二元运算符 +、-、*、/、%、<<、>>、>>>、&、|、^

  > 常量枚举表达式被求值为 NaN 或 Infinity 时，会产生编译时错误。

除此以外，枚举成员均被视为计算成员。

```js
enum FileAccess {
  // constant members
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  // computed member
  G = "123".length,
}
```

# 联合枚举和枚举成员类型

枚举常量成员中有一个特殊的子集，它们不进行计算：字面量枚举成员。字面量枚举成员是指没有初始化值，或者其值初始化为以下几种类型的常量枚举成员：

- 任何字符串字面量（例如 "foo", "bar", "baz")
- 任何数值字面量（例如 1, 100）
- 应用于任何数值字面量的减号（例如 -1, -100）

当枚举中的所有成员都具有字面量枚举值时，一些特殊的语义就会发挥作用。

首先，枚举成员也成为类型！例如，我们可以说某些成员只能具有枚举成员的值：

```js
enum ShapeKind {
  Circle,
  Square,
}
interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}
interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}
 
let c: Circle = {
  kind: ShapeKind.Square,
  // Type 'ShapeKind.Square' is not assignable to type 'ShapeKind.Circle'.
  radius: 100,
};
```

另一个变化是枚举类型本身实际上变成了每个枚举成员的联合体。有了联合枚举，类型系统就能利用它知道枚举中所有值的确切集合这一事实。
正因如此，TypeScript 可以捕获到我们可能错误比较值的错误。例如：

```js
enum E {
  Foo,
  Bar,
}
function f(x: E) {
  if (x !== E.Foo || x !== E.Bar) {
  // This comparison appears to be unintentional because the types 'E.Foo' and 'E.Bar' have no overlap.
  }
}
```

在这个例子中，我们首先检查 x 是否不是 E.Foo。如果检查成功，则 || 运算符会短路，if 语句的主体部分会执行。但是，如果检查失败，那么 x 只能是 E.Foo，所以再检查它是否等于 E.Bar 就没有意义了。

> 译者补充示例：

```js
enum A {
    X,
    Y,
}
enum B {
    X,
    Y,
}
console.log(A.X, A.Y); // 0 1
console.log(B.X, B.Y); // 0 1
console.log(A.X == B.X, A.Y == B.Y); // 有报错信息，但是 tsx 能执行，输出 true true
```

# 枚举运行时

枚举是运行时存在的真实对象。例如，以下枚举

```js
enum E {
  X,
  Y,
  Z,
}
```

实际上可以传递给函数。

```js
enum E {
  X,
  Y,
  Z,
}
 
function f(obj: { X: number }) {
  return obj.X;
}
 
// Works, since 'E' has a property named 'X' which is a number.
f(E);
```

# 枚举编译时

尽管枚举是运行时存在的真实对象，但 `keyof` 关键字的工作方式与普通对象有所不同。您应该使用 `keyof typeof` 来获取一个类型，该类型将所有枚举键表示为字符串。

```js
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}
 
/**
 * This is equivalent to:
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof LogLevel;
 
function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  if (num <= LogLevel.WARN) {
    console.log("Log level key is:", key);
    console.log("Log level value is:", num);
    console.log("Log level message is:", message);
  }
}
printImportant("ERROR", "This is a message");
```

!> 译者注： 又是奇技淫巧...

## 反向映射

除了为成员创建包含属性名称的对象之外，数值枚举成员还会获得从枚举值到枚举名称的反向映射。例如，在这个例子中：

```js
enum Enum {
  A,
}
let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

TypeScript 将其编译成以下 JavaScript 代码：

```js
"use strict";
var Enum;
(function (Enum) {
    Enum[Enum["A"] = 0] = "A";
})(Enum || (Enum = {}));
let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

在生成的代码中，枚举类型会被编译成一个对象，该对象同时存储正向映射（名称 -> 值）和反向映射（值 -> 名称）。
对其他枚举成员的引用始终以属性访问的形式发出，而不会被内联。

请注意，字符串类型的枚举成员根本不会生成反向映射。

## 常量枚举

在大多数情况下，枚举是一种完全有效的解决方案。然而，有时需求会更加严格。
为了避免生成额外的代码以及访问枚举值时增加间接层级，可以使用常量枚举。常量枚举通过枚举类型上的 `const` 修饰符来定义：

```js
const enum Enum {
  A = 1,
  B = A * 2,
}
```

常量枚举只能使用常量枚举表达式，并且与普通枚举不同，它们在编译期间会被完全移除。常量枚举成员会在使用处内联。这是因为常量枚举不能包含计算成员。

```js
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}
let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

它会被编译成：

```js
"use strict";
let directions = [
    0 /* Direction.Up */,
    1 /* Direction.Down */,
    2 /* Direction.Left */,
    3 /* Direction.Right */,
];
```

**常量枚举的陷阱**

内联枚举值乍看之下很简单，但实际上却暗藏着一些不易察觉的问题。
这些陷阱仅适用于环境常量枚举（基本上是指 .d.ts 文件中的常量枚举）以及在项目间共享这些枚举的情况。
但如果您发布或使用 .d.ts 文件，这些陷阱很可能也会影响到您，因为 `tsc --declaration` 会将 .ts 文件转换为 .d.ts 文件。

1. 正如 isolatedModules 文档中所述，该模式与环境常量枚举本质上是不兼容的。这意味着如果您发布了环境常量枚举，下游用户将无法同时使用 isolatedModules 和这些枚举值。
1. 您可以轻松地在编译时内联依赖项版本 A 的值，并在运行时导入版本 B。如果您不够小心，版本 A 和版本 B 的枚举值可能会不同，从而导致一些意想不到的错误，例如 if 语句执行错误的分支。这些 bug 尤其棘手，因为自动化测试通常会在项目构建的同时运行，并且依赖项版本也相同，这完全忽略了这些 bug。
1. `importsNotUsedAsValues: "preserve"` 不会省略用作值的常量枚举的导入，但环境常量枚举并不能保证运行时 .js 文件存在。无法解析的导入会在运行时导致错误。目前，明确省略导入的常用方法（仅类型导入）不允许使用常量枚举值。

以下是避免这些陷阱的两种方法：

1. 完全不使用常量枚举。您可以借助代码检查工具轻松禁用常量枚举。显然，这可以避免常量枚举带来的任何问题，但会阻止您的项目内联自身的枚举。与内联其他项目的枚举不同，内联项目自身的枚举不会造成问题，并且对性能有影响。
1. 不要发布环境常量枚举，而是借助 `preserveConstEnums` 将其反常量化。TypeScript 项目内部就是采用这种方法。`preserveConstEnums` 会为常量枚举生成与普通枚举相同的 JavaScript 代码。这样，你就可以在构建步骤中安全地从 `.d.ts` 文件中移除 `const` 修饰符。

这样，下游用户就不会内联你项目中的枚举，从而避免上述陷阱；但项目仍然可以内联自己的枚举，这与完全禁止使用常量枚举截然不同。

# 环境枚举

环境枚举用于描述已存在枚举类型的结构。

```js
declare enum Enum {
  A = 1,
  B,
  C = 2,
}
```

环境枚举和非环境枚举的一个重要区别在于:
- 在常规枚举中，如果前一个枚举成员被视为常量，则没有初始值设定项的枚举成员也将被视为常量。
- 相比之下，没有初始值设定项的环境（且非 const）枚举成员始终被视为计算型成员。

# 对象 VS 枚举

在现代 TypeScript 中，当一个带有 const 属性的对象就足够时，你可能不需要枚举：

```js
const enum EDirection {
  Up,
  Down,
  Left,
  Right,
}
const ODirection = {
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
} as const;
 
EDirection.Up; // (enum member) EDirection.Up = 0
ODirection.Up; // (property) Up: 0

// Using the enum as a parameter
function walk(dir: EDirection) {}
 
// It requires an extra line to pull out the values
type Direction = typeof ODirection[keyof typeof ODirection];
function run(dir: Direction) {}
 
walk(EDirection.Left);
run(ODirection.Right);
```

这种格式相对于 TypeScript 枚举的最大优势在于，它可以使你的代码库与 JavaScript 的状态保持一致，并且当 JavaScript 添加了枚举时，你可以迁移到额外的语法。

- `const enum` 提供了一种编译时完全消失、成员被内联替换的枚举方式，适合对性能敏感且不需要在运行时访问枚举对象的场景。
- `as const` 对象 则保留了运行时对象，同时通过类型推导获得精确的字面量联合类型，可以更灵活地用于类型编程，并且与普通 JavaScript 对象完全兼容。