# 给新程序员的 TypeScript

> 恭喜你选择 TypeScript 作为你的首选语言之一——你已经做出了明智的决定！

你可能已经听说，TypeScript 是 JavaScript 的一种“变体”或“版本”。TypeScript（TS）和JavaScript（JS）之间的关系在现代编程语言中相当独特，因此，深入了解这种关系将有助于你理解TypeScript是如何为JavaScript增色的。

## JavaScript 简史

JavaScript（亦称ECMAScript）最初是为浏览器开发的一种简单脚本语言。在其诞生之初，人们期望它被用于嵌入网页中的简短代码片段——编写超过几十行的代码在当时显得有些不同寻常。正因如此，早期的网页浏览器执行此类代码的速度相当缓慢。然而，随着时间的推移，JavaScript变得越来越流行，网页开发者开始利用它来创造交互式体验。

面对JavaScript使用量的增加，网页浏览器开发者通过优化其执行引擎（动态编译）和扩展其功能（增加API）来应对，这反过来又促使网页开发者更多地使用它。在现代网站上，你的浏览器经常运行着跨越数十万行代码的应用程序。这就是“网页”漫长而渐进的发展历程，它从一个简单的静态页面网络开始，逐渐演变成一个支持各种丰富应用的平台。

不仅如此，JavaScript（JS）已经足够流行，可以在浏览器之外的环境中使用，例如使用node.js实现JS服务器。JavaScript的“随处运行”特性使其成为跨平台开发的有吸引力的选择。如今，有许多开发人员仅使用JavaScript来编写整个堆栈！

总而言之，我们拥有一种语言，它最初是为快速使用而设计的，后来发展成为一种功能齐全的工具，可用于编写包含数百万行代码的应用程序。每种语言都有其独特之处——奇特之处和令人惊讶之处，而JavaScript的简陋起源使其具有许多这样的特点。以下是一些例子：

- JavaScript的等号运算符（==）会对其操作数进行强制类型转换，从而导致不可预知的行为：

```js
if ("" == 0) {
  // It is! But why??
}
if (1 < x < 3) {
  // True for *any* value of x!
}
```

- JavaScript 还允许访问不存在的属性：

```js
const obj = { width: 10, height: 15 };
// Why is this NaN? Spelling is hard!
const area = obj.width * obj.heigth;
```

当这类错误发生时，大多数编程语言都会报错，有些会在编译阶段——即在任何代码运行之前——报错。在编写小程序时，这种小问题虽然令人烦恼，但尚在可控范围内；但在编写包含数百或数千行代码的应用程序时，这些不断出现的意外就成了一个严重的问题。

## TypeScript：静态类型检查工具

我们之前提到过，有些语言根本不允许运行那些有漏洞的程序。在不运行代码的情况下检测其中的错误，这被称为静态检查。根据操作值的类型来判断哪些是错误、哪些不是，这被称为静态类型检查。

TypeScript 在执行前会检查程序中的错误，并且是基于值的类型来进行检查的，因此它是一个静态类型检查器。例如，上述最后一个示例中由于 obj 的类型而存在错误。以下是 TypeScript 发现的错误：

```js
const obj = { width: 10, height: 15 };
const area = obj.width * obj.heigth;
```

!> Property 'heigth' does not exist on type '{ width: number; height: number; }'. Did you mean 'height'?

JavaScript的类型化超集
那么，TypeScript与JavaScript有什么关系呢？

### 语法

TypeScript是一种语言，它是JavaScript的超集：因此，JavaScript语法也是合法的TypeScript语法。语法是指我们编写文本以形成程序的方式。例如，这段代码有一个语法错误，因为它缺少一个冒号：
```js
let a = (4
```
!')' expected.

由于TypeScript的语法特性，它不会将任何JavaScript代码视为错误。这意味着你可以将任何可运行的JavaScript代码放入TypeScript文件中，而无需担心其具体编写方式。

### 类型

然而，TypeScript是一个类型化的超集，这意味着它增加了关于如何使用不同类型值的规则。之前关于obj.heigth的错误不是语法错误：而是以错误的方式使用了某种类型的值（即类型错误）。

再举个例子，这是一段可以在浏览器中运行的JavaScript代码，它会输出一个值：

```js
console.log(4 / []);
```

这个语法上合法的程序会输出“Infinity”。然而，TypeScript认为将数字除以数组是一个无意义的操作，并会报错：

!> The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.

你可能真的打算将一个数字除以一个数组，也许只是为了看看会发生什么，但大多数时候，这是一种编程错误。TypeScript的类型检查器旨在允许通过正确的程序，同时尽可能多地捕获常见错误。（稍后，我们将了解可用于配置TypeScript检查代码严格程度的设置。）

如果你将一些代码从JavaScript文件移到TypeScript文件中，根据代码的编写方式，你可能会看到类型错误。这些错误可能是代码本身的问题，也可能是TypeScript过于保守造成的。在本指南中，我们将演示如何添加各种TypeScript语法来消除这些错误。

### 运行时行为

TypeScript也是一种保留JavaScript运行时行为的编程语言。例如，在JavaScript中，除以零会得到 `Infinity`，而不是抛出运行时异常。作为一项原则，**TypeScript永远不会改变JavaScript代码的运行时行为。**

> 这意味着，即使 TypeScript 认为代码存在类型错误，只要你将代码从 JavaScript 迁移到 TypeScript，它也能保证以同样的方式运行。

保持与JavaScript相同的运行时行为是TypeScript的基本承诺，因为这意味着你可以轻松地在两种语言之间切换，而不必担心那些可能导致程序停止运行的细微差异。

### 擦除类型

粗略地说，一旦 TypeScript 的编译器完成了检查代码的工作，它就会 擦除 类型以生成最终的“已编译”代码。这意味着一旦您的代码被编译，生成的普通 JS 代码便没有类型信息。

这也意味着 TypeScript 绝不会根据它推断的类型更改程序的 行为 。最重要的是，尽管您可能会在编译过程中看到类型错误，但类型系统自身与程序如何运行无关。

最后，TypeScript 不提供任何额外运行时库。你的程序会使用与 JavaScript 程序相同的标准库（或外部库）。因此你不需要学习其他专属于 TypeScript 的框架。

## 学习 JavaScript 和 TypeScript

我们经常看到这样的问题：“我该学习 JavaScript 还是 TypeScript？”。

答案是，不学习 JavaScript，就无法学习 TypeScript！TypeScript 共用了 JavaScript 的语法和运行时行为。因此，对JavaScript 的任何了解都可以帮助你学习 TypeScript 。

程序员可以使用很多很多资源来学习 JavaScript 。如果你正在编写 TypeScript，不应该 忽略这些资源。例如，带有 javascript 标签的 StackOverflow 问题大约比 typescript 标签的多20倍，但是 所有 javascript问题也适用于 TypeScript 。

如果你正在搜索“如何在 TypeScript 中对列表进行排序”之类的内容，请记住： **TypeScript 是带有编译时类型检查器的 JavaScript 运行时** 。在 TypeScript 中对列表进行排序的方式与在 JavaScript 中相同。如果你找到直接使用 TypeScript 的资源，那也很好，但解决运行时任务的日常问题时，不要局限地认为你需要特定于 TypeScript 的答案。