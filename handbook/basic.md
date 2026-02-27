# 基础

欢迎来到手册的第一页。如果这是你第一次接触到 TypeScript —— 你可能需要先阅读一下 [入门](handbook/handbook.md)

JavaScript 中的每个值会随着我们执行不同的操作表现出一系列的行为。

这听起来很抽象，看下面的例子，考虑一下针对变量 message 可能执行的操作。

```js
// 访问 message 的 toLowerCase 方法并调用它
message.toLowerCase();
// 调用 message 函数
message();
```

如果我们拆分这个过程，那么第一行代码就是访问了 message 的 toLowerCase 方法并调用它；

第二行代码则尝试直接调用 message 函数。

不过让我们假设一下，我们并不知道 message 的值 —— 这是很常见的一种情况，仅从上面的代码中我们无法确切得知最终的结果。 每个操作的结果完全取决于 message 的初始值。

- message 是否可以调用？
- 它有 toLowerCase 属性吗？
- 如果有这个属性，那么 toLowerCase 可以调用吗？
- 如果 message 以及它的属性都是可以调用的，那么分别返回什么？

在编写 JavaScript 代码的时候，这些问题的答案经常需要我们自己记在脑子里，而且我们必须得祈祷自己处理好了所有细节。

假设 message 是这样定义的：

```js
const message = "Hello World!";
```

你可能很容易猜到，如果执行 message.toLowerCase()，我们将会得到一个所有字母都是小写的字符串。

如果执行第二行代码呢？

熟悉 JavaScript 的你肯定猜到了，这会抛出一个异常：

!> TypeError: message is not a function

如果可以避免这样的错误就好了。

当我们执行代码的时候，JavaScript 运行时会计算出值的 **类型** —— 这种类型有什么行为和功能，从而决定采取什么措施。

这就是上面的代码会抛出 TypeError 的原因 —— 它表明字符串 "Hello World!" 无法作为函数被调用。

对于诸如 string 或者 number 这样的原始类型，我们可以通过 typeof 操作符在运行时计算出它们的类型。

但对于像函数这样的类型，并没有对应的运行时机制去计算类型。

举个例子，看下面的函数：

```js
function fn(x) {
  return x.flip();
}
```

从代码可以看出，仅当存在一个带有 flip 属性的对象时，这个函数才可以正常运行，但 JavaScript 无法在代码执行时以一种我们可以检查的方式传递这个信息。

要让纯 JavaScript 告诉我们 fn 在给定特定参数的时候会做什么事，唯一的方法就是实际调用 fn 函数。

这样的行为使得我们很难在代码执行前进行相关的预测，也意味着我们在编写代码的时候，很难搞清楚代码会做什么事。

从这个角度看，所谓的 **类型** 其实就是描述了什么值可以安全传递给 fn，什么值会引起报错。

JavaScript 只提供了动态类型 —— 执行代码，然后才能知道会发生什么事。

那么不妨采用一种替代方案，使用一个静态的类型系统，在代码实际执行前预测代码的行为。

# 静态类型检查

还记得之前我们将字符串作为函数调用时，抛出的 TypeError 错误吗？

很多人不希望在执行代码时看到任何错误 —— 毕竟这些都是 bug！

当我们编写新代码的时候，我们也会尽量避免引入新的 bug。

如果我们只是添加了一点代码，保存文件，重新运行代码，然后马上看到报错，那么我们或许可以快速定位到问题 —— 但这种情况毕竟只是少数。

我们可能没有全面、彻底地进行测试，以至于没有发现一些潜在错误！

或者，如果我们幸运地发现了这个错误，我们可能最终会进行大规模的重构，并添加许多不同的代码。

理想的方案应该是，我们有一个工具可以在代码执行前找出 bug。

而这正是像 TypeScript 这样的静态类型检查器所做的事情。

静态类型系统描述了程序运行时值的结构和行为。

像 TypeScript 这样的静态类型检查器会利用类型系统提供的信息，并在事态发展不对劲的时候告知我们。

```js
const message = "hello!";
message(); // This expression is not callable. Type 'String' has no call signatures.
```

用 TypeScript 运行上一个例子，它会在我们执行代码之前首先抛出一个错误。

# 非异常失败

到目前为止，我们一直在讨论某些事情，比如运行时错误——即JavaScript运行时告诉我们它认为某些事情不合理的情况。出现这些情况是因为ECMAScript规范对语言在遇到意外情况时应如何表现有明确的指示。

例如，规范中指出，尝试调用不可调用的对象时应抛出错误。这听起来像是“显而易见的行为”，但你可以想象，访问一个对象上不存在的属性时也应该抛出错误。然而，JavaScript 却给出了不同的行为，并返回了值 `undefined`：

```js
const user = {
    name: 'Daniel',
    age: 26,
};
user.location;       // 返回 undefined
```

最终，我们需要一个静态类型系统来告诉我们，哪些代码在这个系统中被标记为错误的代码 —— 即使它是不会马上引起错误的 *有效* JavaScript 代码。

在 TypeScript 中，下面的代码会抛出一个错误，指出 location 没有定义：

```js
const user = {
  name: "Daniel",
  age: 26,
};
user.location; // Property 'location' does not exist on type '{ name: string; age: number; }'.
```

虽然有时候这意味着你需要在表达的内容上进行权衡，但我们的目的是为了找到程序中更多合法的 bug。

而 TypeScript 也的确可以捕获到很多合法的 bug：

举个例子，拼写错误：

```js
const announcement = "Hello World!";
 
// 你需要花多久才能注意到拼写错误？
announcement.toLocaleLowercase();
announcement.toLocalLowerCase();
 
// 实际上正确的拼写是这样的……
announcement.toLocaleLowerCase();
```

未调用的函数：

```js
function flipCoin() {
  // 应该是 Math.random()
  return Math.random < 0.5; // Operator '<' cannot be applied to types '() => number' and 'number'.
}
```

或者是基本的逻辑错误：

```js
const value = Math.random() < 0.5 ? "a" : "b";
if (value !== "a") {
  // ...
} else if (value === "b") {
  // This comparison appears to be unintentional because
  // the types '"a"' and '"b"' have no overlap.
  // 永远无法到达这个分支
}
```

# 类型工具

当我们代码出错时，TypeScript能够捕捉到这些错误。这很棒，但TypeScript还能从源头上防止我们犯这些错误。

类型检查器拥有相关信息，可以检查我们是否正在访问变量和其他属性上的正确属性。一旦获取到这些信息，它还可以开始建议你可能想要使用的属性。

这意味着TypeScript也可以用于编辑代码，并且核心类型检查器可以在你在编辑器中输入时提供错误消息和代码补全功能。这也是人们在谈论TypeScript中的工具时经常提到的一部分内容。

> TypeScript 在工具层面的作用非常强大，远不止拼写时进行代码补全和错误信息提示。

TypeScript非常重视工具功能，这不仅限于键入时的自动补全和错误提示。支持TypeScript的编辑器可以提供“快速修复”功能，自动修复错误；支持重构功能，方便重新组织代码；还提供有用的导航功能，可跳转到变量的定义处，或查找给定变量的所有引用。所有这些功能都建立在类型检查器之上，并且完全跨平台，因此你最喜欢的编辑器很可能支持TypeScript。

# 编译器 —— tsc

我们一直在讨论类型检查器，但目前为止还没上手使用过。

是时候和我们的新朋友 —— TypeScript 编译器 tsc 打交道了。

首先，通过 npm 进行安装。

```shell
npm install -g typescript
```

> 这将全局安装 TypeScript 的编译器 tsc。如果你更倾向于安装在本地的 node_modules 文件夹中，那你可能需要借助 npx 或者类似的工具才能便捷地运行 tsc 指令。

现在，我们新建一个空文件夹，尝试编写第一个 TypeScript 程序：hello.ts ：

```js
// 和世界打个招呼
console.log('Hello world!');
```

注意这行代码没有任何多余的修饰，它看起来就和使用 JavaScript 编写的 “hello world” 程序一模一样。

现在，让我们运行 typescript 安装包自带的 tsc 指令进行类型检查。

```shell
tsc hello.ts
```

我们运行了tsc，但什么都没发生！好吧，没有类型错误，所以控制台没有任何输出，因为没有可报告的内容。

但请再检查一遍——我们得到了一些文件输出。如果我们查看当前目录，会在hello.ts旁边看到一个hello.js文件。这是我们的hello.ts文件在经过tsc编译或转换为纯JavaScript文件后的输出。如果我们查看内容，就会看到TypeScript在处理.ts文件后输出的内容：

```js
// Greets the world.
console.log("Hello world!");
```

在这种情况下，TypeScript 几乎没有进行转换，因此它看起来与我们编写的代码完全相同。编译器会尝试生成清晰易读的代码，就像人类编写的代码一样。虽然这并不总是那么容易，但 TypeScript 会保持一致的缩进，注意代码跨行的情况，并尝试保留注释。

如果我们确实引入了一个类型检查错误，那会怎么样呢？让我们重写hello.ts：

```js
// This is an industrial-grade general-purpose greeter function:
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date}!`);
}
greet("Brendan");
```

如果我们再次运行tsc hello.ts，请注意，命令行上会显示一个错误！

!> Expected 2 arguments, but got 1.

TypeScript 告诉我们，我们忘记给 greet 函数传递参数了，这确实是个疏忽。到目前为止，我们只写了标准的 JavaScript，但类型检查仍然能够发现我们代码中的问题。感谢 TypeScript！

# 报错时仍产出文件

在上一个示例中，你可能没有注意到一件事，那就是我们的hello.js文件又发生了变化。如果我们打开那个文件，我们会发现内容基本上与我们的输入文件相同。考虑到tsc报告了关于我们代码的错误，这可能有点令人惊讶，但这正是基于TypeScript的一个核心价值：大多数时候，你会比TypeScript更清楚。

重申一下之前的话，类型检查代码限制了你可以运行的程序类型，因此在类型检查器认为可接受的内容上存在权衡。大多数时候这都没问题，但在某些情况下，这些检查会成为障碍。例如，想象一下，你正在将JavaScript代码迁移到TypeScript并引入类型检查错误。最终你会为类型检查器清理这些问题，但原来的JavaScript代码已经可以运行了！为什么要把它转换为TypeScript就阻止你运行它呢？

所以TypeScript不会妨碍你。当然，随着时间的推移，你可能想对错误采取更严格的防御措施，并让TypeScript执行得更严格一些。在这种情况下，你可以使用noEmitOnError编译器选项。尝试更改hello.ts文件，并使用该标志运行tsc：

> tsc --noEmitOnError hello.ts

现在你会发现，hello.js 没有再发生改动了。

# 显式类型

到目前为止，我们还没有告诉TypeScript person或date是什么。让我们编辑代码，告诉TypeScript person是一个字符串，而date应该是一个Date对象。我们还会在date上使用toDateString()方法。

```js
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
```

我们所做的是在person和date上添加类型标注，以描述greet可以调用的值的类型。你可以将该签名解读为“greet接受一个字符串类型的人和一个Date类型的日期”。

有了这个，TypeScript 可以告诉我们其他可能错误调用 greet 的情况。例如…

```js
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", Date()); // Argument of type 'string' is not assignable to parameter of type 'Date'.
```

啊？TypeScript在我们的第二个参数上报告了一个错误，但这是为什么？

或许令人惊讶的是，在JavaScript中调用Date()会返回一个字符串。另一方面，使用new Date()构造一个Date对象实际上会得到我们预期的结果。

不管怎样，我们可以快速修复这个错误：

```js
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", new Date());
```

记住，我们并不总是需要显式地编写类型标注。在许多情况下，即使我们省略了类型标注，TypeScript也能为我们推断（或“识别”）出类型。

```js
let msg = "hello there!";
```

尽管我们没有明确告诉 TypeScript msg 的类型是 `string`，它还是能够推断出来。这是一个特性，当类型系统最终能够推断出相同的类型时，最好不要添加注解。

> 如果你将鼠标悬停在单词上，你的编辑器会显示 msg 是个 string

# 类型擦除

让我们来看看，当我们使用tsc编译上述的greet函数以输出JavaScript时，会发生什么：

```js
"use strict";
function greet(person, date) {
    console.log("Hello ".concat(person, ", today is ").concat(date.toDateString(), "!"));
}
greet("Maddison", new Date());
```

这里有两点需要注意：
1. 我们的 person 和 date 参数不再有类型标注。
1. 我们的“模板字符串”——即使用反引号（`字符）的字符串——被转换为带有拼接的普通字符串。

关于第二点我们稍后再详述，现在我们先来关注第一点。类型标注并非JavaScript（或者严谨来说，并非ECMAScript）的一部分，因此实际上没有任何浏览器或其他运行时环境能够直接运行未经修改的TypeScript。这就是为什么TypeScript首先需要一个编译器——它需要某种方式来剥离或转换任何特定于TypeScript的代码，以便你可以运行它。大多数特定于TypeScript的代码都会被删除，同样地，这里的类型标注也被完全删除了。

> 记住：类型标注永远不会改变程序的运行时行为。


# 降级

上面的另一个变化，就是我们的模板字符串

```js
`Hello ${person}, today is ${date.toDateString()}!`;
// 被重写为
"Hello ".concat(person, ", today is ").concat(date.toDateString(), "!");
```

为什么会发生这种情况？

模板字符串是ECMAScript 2015版本（亦称ECMAScript 6、ES2015、ES6等，别问）中的一项特性。TypeScript能够将代码从较新版本的ECMAScript重写为较旧版本，如ECMAScript 3或ECMAScript 5（亦称ES5）。这种从较新或“更高”版本的ECMAScript向下迁移到较旧或“更低”版本的过程有时被称为降级。

默认情况下，TypeScript的目标是ES5，这是ECMAScript的一个非常老的版本。我们本可以通过使用target选项选择一个更新一点的版本。运行命令`tsc --target es2015 hello.ts`会将TypeScript的目标设置为ECMAScript 2015，这意味着代码应该能在任何支持ECMAScript 2015的环境中运行。因此，运行`tsc --target es2015 hello.ts`会得到以下输出：

```js
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", new Date());
```

> 虽然默认目标是ES5，但当前绝大多数浏览器都支持ES2015。因此，除非与某些老旧浏览器的兼容性很重要，否则大多数开发人员可以安全地将ES2015或更高版本指定为目标。

# 严格性

不同的用户在类型检查器中寻找不同的东西。有些人希望获得一种更宽松的选择性体验，这种体验可以帮助他们只验证程序中的某些部分，同时仍然拥有不错的工具支持。这是TypeScript的默认体验，其中类型是可选的，类型推断采用最宽松的类型，并且不会检查可能为 `null`/`undefined` 的值。就像tsc在遇到错误时的输出一样，这些默认设置是为了不打扰你而设置的。如果你正在迁移现有的JavaScript，这可能是可取的第一步。

相比之下，许多用户更倾向于让TypeScript立即进行尽可能多的验证，这也是该语言提供严格性设置的原因。这些严格性设置将静态类型检查从一个开关（要么检查代码，要么不检查）转变为更接近一个刻度盘的东西。你越将这个刻度盘调高，TypeScript就会为你检查得越多。这可能需要一些额外的工作，但总体而言，从长远来看是值得的，并且能够进行更彻底的检查和更准确的工具化。在可能的情况下，新的代码库应始终开启这些严格性检查。

TypeScript提供了多个可启用或禁用的类型检查严格性标志，除非另有说明，否则我们所有的示例都将启用所有这些标志。在命令行界面（CLI）中使用strict标志，或在tsconfig.json中设置"strict": true，可同时启用所有这些标志，但我们也可以单独选择禁用其中的某个标志。其中，你应该了解的两个最重要的标志是 noImplicitAny 和 strictNullChecks。

## noImplicitAny

回想一下，在某些情况下，TypeScript不会尝试为我们推断类型，而是退而求其次，使用最宽松的类型：`any`。这并不是最糟糕的情况——毕竟，退而求其次使用 `any` 只是普通的 JavaScript 体验而已。

然而，使用任何“any”都会违背使用TypeScript的初衷。你的程序类型化程度越高，得到的验证和工具支持就越多，这意味着你在编码时遇到的bug会更少。启用noImplicitAny标志后，对于任何被隐式推断为“any”类型的变量，都会报错。

## strictNullChecks

默认情况下，像 `null` 和 `undefined` 这样的值可以被赋给任何其他类型。这虽然可以使编写代码变得更加容易，但忘记处理 `null` 和 `undefined` 却是世界上无数 bug 的根源——有些人甚至认为这是一个价值数十亿美元的错误！`strictNullChecks` 标志使处理 `null` 和 `undefined` 更加明确，使我们不必担心是否忘记了处理它们。
