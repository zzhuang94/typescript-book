# 变量声明

`let` 和 `const` 是 JavaScript 中两个相对较新的变量声明概念。正如我们之前提到的，`let` 在某些方面与 `var` 类似，但它可以帮助用户避免一些在 JavaScript 中常见的“陷阱”。

`const` 是对 `let` 的增强，它能够防止对变量进行重新赋值。

由于 TypeScript 是 JavaScript 的扩展，因此它自然支持 `let` 和 `const`。接下来，我们将详细介绍这些新的声明方式，以及它们为何优于 `var`。

如果您只是偶尔使用 JavaScript，下一节可以帮助您温习一下相关知识。如果您对 JavaScript 中 `var` 声明的各种特性都非常熟悉，那么您可以直接跳过这一节。

# var 声明

在 JavaScript 中，声明变量历来都是使用 var 关键字。

```js
var a = 10;
```

正如你可能已经发现的，我们刚刚声明了一个名为 a 的变量，并将其值设为 10。

我们也可以在函数内部声明变量：

```js
function f() {
  var message = "Hello, world!";
  return message;
}
```

我们还可以在其他函数中访问这些相同的变量：

```js
function f() {
  var a = 10;
  return function g() {
    var b = a + 1;
    return b;
  };
}
var g = f();
g(); // returns '11'
```

在上面的例子中，函数 g 捕获了函数 f 中声明的变量 a。无论何时调用 g，a 的值都将与 f 中 a 的值绑定。即使 g 是在 f 运行结束后才被调用的，它仍然可以访问和修改 a。

## 作用域规则

var 声明的作用域规则对于习惯其他语言的人来说有些特殊。例如：

```js
function f(shouldInitialize: boolean) {
  if (shouldInitialize) {
    var x = 10;
  }
  return x;
}
f(true); // returns '10'
f(false); // returns 'undefined'
```

有些读者可能会对这个例子感到疑惑。变量 x 是在 if 代码块内声明的，但我们却能从代码块外部访问它。
这是因为 var 声明可以在其所在的函数、模块、命名空间或全局作用域内的任何位置访问——这些我们稍后会详细介绍——而无需考虑其所在的代码块。
有些人称之为变量作用域或函数作用域。参数的作用域也仅限于函数。

这些作用域规则可能会导致多种类型的错误。其中一个问题是，多次声明同一个变量并不会造成错误：

```js
function sumMatrix(matrix: number[][]) {
  var sum = 0;
  for (var i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (var i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }
  return sum;
}
```

对于一些经验丰富的 JavaScript 开发人员来说，这或许很容易发现，但内部的 for 循环会意外地覆盖变量 i，因为 i 指向的是同一个函数作用域的变量。
正如经验丰富的开发人员现在所知，类似的 bug 很容易在代码审查中被忽略，并可能成为无尽的挫败感之源。

## 变量捕获的特殊之处

请花一秒钟时间猜猜以下代码片段的输出结果是什么：

```js
for (var i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

对于不熟悉 `setTimeout` 的人来说，它会在指定毫秒数后尝试执行一个函数（但会等待所有其他程序停止运行）。

准备好了吗？请看：

```js
10
10
10
10
10
10
10
10
10
10
```

许多 JavaScript 开发者都非常熟悉这种行为，但如果你感到惊讶，也绝非孤例。大多数人期望的输出结果是：

```js
0
1
2
3
4
5
6
7
8
9
```

还记得我们之前提到的变量捕获吗？我们传递给 `setTimeout` 的每个函数表达式实际上都引用了同一作用域中的同一个变量 `i`。

我们花点时间思考一下这意味着什么。`setTimeout` 会在经过一定毫秒数后运行一个函数，但前提是 `for` 循环已经停止执行；当 `for` 循环停止执行时，`i` 的值为 10。
因此，每次调用该函数时，它都会输出 10！

一个常见的解决方法是使用立即调用函数表达式 (IIFE) 来捕获每次迭代中的 `i`：

```js
for (var i = 0; i < 10; i++) {
  // capture the current state of 'i'
  // by invoking a function with its current value
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 100 * i);
  })(i);
}
```

这种看似奇怪的模式其实很常见。参数列表中的 i 实际上与 for 循环中声明的 i 重叠了，但由于我们将它们命名为相同的名称，因此无需对循环体进行太多修改。

# let 声明

现在你应该已经发现 `var` 语句存在一些问题，而这正是引入 `let` 语句的原因。除了使用的关键字不同之外，`let` 语句的编写方式与 `var` 语句完全相同。

```js
let hello = "Hello!";
```

关键区别不在于语法，而在于语义，接下来我们将深入探讨这一点。

## 块级作用域

当使用 `let` 声明变量时，它采用的是所谓的词法作用域或块级作用域。
与使用 `var` 声明的变量不同，后者的作用域会扩展到包含它的函数，而块级作用域的变量在其最近的包含代码块或 `for` 循环之外是不可见的。

```js
function f(input: boolean) {
  let a = 100;
  if (input) {
    // Still okay to reference 'a'
    let b = a + 1;
    return b;
  }
  // Error: 'b' doesn't exist here
  return b;
}
```

这里有两个局部变量 a 和 b。a 的作用域限定在 f 函数体内部，而 b 的作用域限定在包含 f 函数的 if 语句块内部。

在 catch 子句中声明的变量也具有类似的作用域规则。

```js
try {
  throw "oh no!";
} catch (e) {
  console.log("Oh well.");
}
// Error: 'e' doesn't exist here
console.log(e);
```

块级作用域变量的另一个特性是，在它们被实际声明之前，无法对其进行读取或写入操作。
虽然这些变量在其作用域内始终“存在”，但直到它们被声明之前的所有时间点都处于其时间上的“死区”。
这其实就是一种比较复杂的说法，意思是说在 `let` 语句之前你无法访问它们，而幸运的是，TypeScript 会明确地告诉你这一点。

```js
a++; // illegal to use 'a' before it's declared;
let a;
```

需要注意的是，你仍然可以在声明变量之前捕获它。唯一的限制是，在声明之前调用该函数是非法的。
如果目标框架是 ES2015，现代运行时会抛出错误；但是，目前 TypeScript 比较宽松，不会将此报告为错误。

```js
function foo() {
  // okay to capture 'a'
  return a;
}
// illegal call 'foo' before 'a' is declared
// runtimes should throw an error here
foo();
let a;
```

## 重复声明和变量遮蔽

我们之前提到过，对于 var 声明，无论你声明多少次变量，最终都只会有一个变量生效。

```js
function f(x) {
  var x;
  var x;
  if (true) {
    var x;
  }
}
```

在上面的例子中，所有对 x 的声明实际上都指向同一个 x，这完全有效。但这往往会导致 bug。幸运的是，let 声明就没有这么大的容错率了。

```js
let x = 10;
let x = 20; // error: can't re-declare 'x' in the same scope
```

TypeScript 并不一定需要两个变量都具有块级作用域才能告诉我们存在问题。

```js
function f(x) {
  let x = 100; // error: interferes with parameter declaration
}
function g() {
  let x = 100;
  var x = 100; // error: can't have both declarations of 'x'
}
```

这并不是说块级作用域变量永远不能与函数级作用域变量一起声明。块级作用域变量只需要在完全不同的代码块中声明即可。

```js
function f(condition, x) {
  if (condition) {
    let x = 100;
    return x;
  }
  return x;
}
f(false, 0); // returns '0'
f(true, 0); // returns '100'
```

在更深层次的作用域中引入新名称的行为称为名称遮蔽。名称遮蔽是一把双刃剑，它本身可能会在意外遮蔽的情况下引入某些错误，但同时也能避免某些错误。
例如，假设我们之前使用 let 变量编写了 sumMatrix 函数。

```js
function sumMatrix(matrix: number[][]) {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (let i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }
  return sum;
}
```

这个版本的循环实际上可以正确执行求和操作，因为内层循环的 i 会遮蔽外层循环的 i。

为了编写更清晰的代码，通常应该避免使用遮蔽。虽然在某些情况下，利用遮蔽可能更合适，但你应该根据实际情况做出判断。

## 块级作用域的变量捕获

当我们第一次接触到使用 `var` 声明进行变量捕获的概念时，我们简要地讨论了变量被捕获后的行为。
为了更好地理解这一点，每次执行一个作用域时，它都会创建一个变量“环境”。
即使作用域内的所有内容都已执行完毕，该环境及其捕获的变量仍然存在。

```js
function theCityThatAlwaysSleeps() {
  let getCity;
  if (true) {
    let city = "Seattle";
    getCity = function () {
      return city;
    };
  }
  return getCity();
}
```

由于我们从其环境中捕获了 `city`，即使 `if` 代码块执行完毕，我们仍然可以访问它。

回想一下，在我们之前的 `setTimeout` 示例中，我们最终需要使用立即执行函数表达式 (IIFE) 来捕获 `for` 循环每次迭代中变量的状态。实际上，我们所做的就是为捕获的变量创建了一个新的变量环境。这有点麻烦，但幸运的是，在 TypeScript 中你再也不用这样做了。

当 `let` 声明作为循环的一部分时，其行为截然不同。这些声明不仅仅是为循环本身引入一个新的环境，而是在每次迭代中创建一个新的作用域。既然我们之前的 IIFE 也做了同样的事情，我们可以将之前的 `setTimeout` 示例更改为直接使用 `let` 声明。

```js
for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

就像我们所期望的那样，会输出如下内容：

```js
0
1
2
3
4
5
6
7
8
9
```

# const 声明

const 声明是声明变量的另一种方式。

```js
const numLivesForCat = 9;
```

它们类似于 `let` 声明，但顾名思义，一旦绑定，其值就无法更改。换句话说，它们的作用域规则与 `let` 相同，但你不能重新赋值给它们。

这不应与它们所指向的值是不可变的概念混淆。

```js
const numLivesForCat = 9;
const kitty = {
  name: "Aurora",
  numLives: numLivesForCat,
};
// Error
kitty = {
  name: "Danielle",
  numLives: numLivesForCat,
};
// all "okay"
kitty.name = "Rory";
kitty.name = "Kitty";
kitty.name = "Cat";
kitty.numLives--;
```

除非采取特定措施，否则常量变量的内部状态仍然是可修改的。幸运的是，TypeScript 允许你指定对象的成员是只读的。接口章节对此有详细说明。

# let vs. const

鉴于我们有两种作用域语义相似的声明类型，自然会有人问：到底该用哪一种？和大多数宽泛的问题一样，答案是：视情况而定。

> 遵循最小权限原则，除了计划修改的声明之外，所有声明都应该使用 `const`。

其理由是，如果一个变量不需要被写入，那么在同一代码库中工作的其他人员就不应该自动拥有写入该对象的权限，他们需要考虑是否真的需要重新赋值给该变量。
使用 `const` 还能使代码在数据流分析中更具可预测性。

请根据实际情况做出判断，并在必要时咨询团队其他成员的意见。

本手册的大部分内容都使用 `let` 声明。

# 解构赋值

TypeScript 还继承了 ECMAScript 2015 的另一项特性：解构赋值。完整参考资料请参阅 Mozilla 开发者网络上的文章。本节将对其进行简要概述。

## 数组解构赋值

最简单的解构赋值形式是数组解构赋值：

```js
let input = [1, 2];
let [first, second] = input;
console.log(first); // outputs 1
console.log(second); // outputs 2
```

这将创建两个名为 first 和 second 的新变量。这相当于使用索引，但要方便得多：

```js
first = input[0];
second = input[1];
```

解构赋值也适用于已声明的变量：

```js
// swap variables
[first, second] = [second, first];
```

以及带有参数的函数：

```js
function f([first, second]: [number, number]) {
  console.log(first);
  console.log(second);
}
f([1, 2]);
```

您可以使用以下语法为列表中的剩余参数创建一个变量：

```js
let [first, ...rest] = [1, 2, 3, 4];
console.log(first); // outputs 1
console.log(rest); // outputs [ 2, 3, 4 ]
```

当然，由于这是 JavaScript，您可以忽略您不关心的尾随元素：

```js
let [first] = [1, 2, 3, 4];
console.log(first); // outputs 1
```

或忽略其它元素：

```js
let [, second, , fourth] = [1, 2, 3, 4];
console.log(second); // outputs 2
console.log(fourth); // outputs 4
```

## 元组解构

元组可以像数组一样进行解构；解构变量会获得对应元组元素的类型：

```js
let tuple: [number, string, boolean] = [7, "hello", true];
let [a, b, c] = tuple; // a: number, b: string, c: boolean
```

对元组进行超出其元素范围的解构是错误的：

```js
let [a, b, c, d] = tuple; // Error, no element at index 3
```

与数组类似，您可以使用 ... 解构元组的其余部分，从而获得更短的元组：

```js
let [a, ...bc] = tuple; // bc: [string, boolean]
let [a, b, c, ...d] = tuple; // d: [], the empty tuple
```

或者忽略尾随元素或其他元素：

```js
let [a] = tuple; // a: number
let [, b] = tuple; // b: string
```

## 对象解构

你也可以对对象进行解构：

```js
let o = {
  a: "foo",
  b: 12,
  c: "bar",
};
let { a, b } = o;
```

这会根据 o.a 和 o.b 创建新变量 a 和 b。注意，如果不需要 c，可以省略。

与数组解构类似，也可以不声明变量进行赋值：

```js
({ a, b } = { a: "baz", b: 101 });
```

请注意，我们需要用圆括号将这条语句括起来。JavaScript 通常会将 `{` 解析为代码块的开始。

您可以使用 `...` 语法为对象中剩余的元素创建一个变量：

```js
let { a, ...passthrough } = o;
let total = passthrough.b + passthrough.c.length;
```

### 属性重命名

您还可以为属性指定不同的名称：

```js
let { a: newName1, b: newName2 } = o;
```

这里语法开始变得令人困惑。你可以把 `a: newName1` 理解为“a 作为 newName1”。方向是从左到右，就像你这样写：

```js
let newName1 = o.a;
let newName2 = o.b;
```

令人困惑的是，这里的冒号并不表示类型。如果您指定了类型，则仍然需要在整个解构之后写出类型：

```js
let { a: newName1, b: newName2 }: { a: string; b: number } = o;
```

### 默认值

默认值允许您在属性未定义时指定默认值：

```js
function keepWholeObject(wholeObject: { a: string; b?: number }) {
  let { a, b = 1001 } = wholeObject;
}
```

在这个例子中，`b?` 表示 `b` 是可选的，因此它可能为 `undefined`。即使 `b` 为 `undefined`，`keepWholeObject` 现在也拥有一个 `wholeObject` 变量以及属性 `a` 和 `b`。

## 函数解构

解构也适用于函数声明。对于简单情况，这很容易理解：

```js
type C = { a: string; b?: number };
function f({ a, b }: C): void {
  // ...
}
```

但为参数指定默认值更为常见，而使用解构赋值时正确设置默认值可能比较棘手。首先，你需要记住将模式放在默认值之前。

```js
function f({ a = "", b = 0 } = {}): void {
  // ...
}
f();
```

!> 上面的代码片段是类型推断的一个示例，这在手册前面已经解释过了。

然后，你需要记住在解构属性中为可选属性指定默认值，而不是在主初始化器中指定。记住，C 定义时 b 是可选的：

```js
function f({ a, b = 0 } = { a: "" }): void {
  // ...
}
f({ a: "yes" }); // ok, default b = 0
f(); // ok, default to { a: "" }, which then defaults b = 0
f({}); // error, 'a' is required if you supply an argument
```

谨慎使用解构赋值。正如前面的例子所示，任何非最简单的解构表达式都会令人困惑。
对于深度嵌套的解构赋值尤其如此，即使不添加重命名、默认值和类型注解，也很难理解。
尽量保持解构赋值表达式简洁明了。你始终可以自己编写解构赋值语句。

# 展开

展开运算符与解构运算符相反。它允许你将一个数组展开到另一个数组中，或者将一个对象展开到另一个对象中。例如：

```js
let first = [1, 2];
let second = [3, 4];
let bothPlus = [0, ...first, ...second, 5];
```

这将 bothPlus 的值设为 [0, 1, 2, 3, 4, 5]。展开操作会创建 first 和 second 的浅拷贝。展开操作不会改变它们本身。

您还可以展开对象：

```js
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { ...defaults, food: "rich" };
```

现在搜索条件是 `{ food: "rich", price: "$$", ambiance: "noisy" }`。
对象扩展比数组扩展更复杂。与数组扩展类似，它也是从左到右扩展，但结果仍然是一个对象。
这意味着扩展对象中后面出现的属性会覆盖前面出现的属性。所以，如果我们修改前面的例子，使其在末尾扩展：

```js
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { food: "rich", ...defaults };
```

这样一来，defaults 中的 food 属性就会覆盖 food: "rich"，这并非我们想要的结果。

对象展开还有一些其他令人意想不到的限制。首先，它只包含对象自身的可枚举属性。也就是说，展开对象实例时会丢失一些方法：

```js
class C {
  p = 12;
  m() {}
}
let c = new C();
let clone = { ...c };
clone.p; // ok
clone.m(); // error!
```

其次，TypeScript 编译器目前不允许泛型函数中使用类型参数展开。该特性预计将在未来的语言版本中加入。

# using 声明

using 声明是 JavaScript 即将推出的一项特性，属于第三阶段显式资源管理提案的一部分。
using 声明与 const 声明非常相似，区别在于它将绑定到声明的值的生命周期与变量的作用域关联起来。

当控制流离开包含 using 声明的代码块时，将执行声明值的 [Symbol.dispose]() 方法，从而允许该值执行清理操作。

```js
function f() {
  using x = new C();
  doSomethingWith(x);
} // `x[Symbol.dispose]()` is called
```

略...