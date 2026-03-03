# 类型推断

在 TypeScript 中，当没有显式类型注解时，会在多个地方使用类型推断来提供类型信息。例如，在以下代码中。

```js
let x = 3;
// let x: number
```

变量 x 的类型被推断为数字。这种类型推断发生在初始化变量和成员、设置参数默认值以及确定函数返回类型时。

在大多数情况下，类型推断非常简单直接。在接下来的章节中，我们将探讨类型推断的一些细微差别。

# 最佳普通类型

当从多个表达式进行类型推断时，会使用这些表达式的类型来计算“最佳公共类型”。例如：

```js
let x = [0, 1, null];
// let x: (number | null)[]
```

要推断上例中 x 的类型，我们必须考虑数组中每个元素的类型。
这里数组的类型有两种选择：number 和 null。最佳公共类型算法会考虑每个候选类型，并选择与其他所有候选类型兼容的类型。

由于最佳公共类型必须从提供的候选类型中选择，因此有些类型共享相同的结构，但没有一个类型是所有候选类型的超类型。例如：

```js
let zoo = [new Rhino(), new Elephant(), new Snake()];
// let zoo: (Rhino | Elephant | Snake)[]
```

理想情况下，我们希望 `zoo` 被推断为 `Animal[]` 类型，但由于数组中没有严格意义上的 `Animal` 对象，因此我们无法推断数组元素的类型。
为了解决这个问题，当没有一个类型是所有其他候选类型的超类型时，需要显式地提供类型：

```js
let zoo: Animal[] = [new Rhino(), new Elephant(), new Snake()];
// let zoo: Animal[]
```

当找不到最佳公共类型时，推断结果为联合数组类型，(Rhino | Elephant | Snake)[]。

# 上下文类型

在 TypeScript 中，类型推断在某些情况下也可以反向进行，这被称为“上下文类型”。上下文类型是指表达式的类型由其所在位置推断出来的类型。例如：

```js
window.onmousedown = function (mouseEvent) {
  console.log(mouseEvent.button);
  console.log(mouseEvent.kangaroo);
  // Property 'kangaroo' does not exist on type 'MouseEvent'.
}
```

这里，TypeScript 类型检查器使用 `Window.onmousedown` 函数的类型来推断赋值语句右侧函数表达式的类型。
通过这种方式，它能够推断出 `mouseEvent` 参数的类型，该参数包含一个 `button` 属性，但不包含 `kangaroo` 属性。

之所以能够成功，是因为 `window` 类型中已经声明了 `onmousedown` 属性。

```js
// Declares there is a global variable called 'window'
declare var window: Window & typeof globalThis;
// Which is declared as (simplified):
interface Window extends GlobalEventHandlers {
  // ...
}
// Which defines a lot of known handler events
interface GlobalEventHandlers {
  onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
  // ...
}
```

TypeScript 非常智能，也能在其他上下文中推断类型：

```js
window.onscroll = function (uiEvent) {
  console.log(uiEvent.button);
  // Property 'button' does not exist on type 'Event'.
}
```

由于上述函数被赋值给了 `Window.onscroll`，TypeScript 知道 `uiEvent` 是一个 `UIEvent` 对象，而不是像前面例子那样的 `MouseEvent` 对象。
`UIEvent` 对象不包含 `button` 属性，因此 TypeScript 会抛出错误。

如果此函数不在上下文类型化的位置，则函数的参数将隐式地具有 `any` 类型，并且不会发出错误（除非您使用了 `noImplicitAny` 选项）：

```js
const handler = function (uiEvent) {
  console.log(uiEvent.button); // <- OK
};
```

我们还可以显式地为函数的参数提供类型信息，以覆盖任何上下文类型：

```js
window.onscroll = function (uiEvent: any) {
  console.log(uiEvent.button); // <- Now, no error is given
};
```

然而，这段代码会输出 undefined，因为 uiEvent 没有名为 button 的属性。

上下文类型在很多情况下都适用。常见情况包括函数调用的参数、赋值语句的右侧、类型断言、对象和数组字面量的成员以及 return 语句。
上下文类型还可以作为最佳公共类型的候选类型。例如：

```js
function createZoo(): Animal[] {
  return [new Rhino(), new Elephant(), new Snake()];
}
```

在这个例子中，最佳公共类型有四个候选类型：Animal, Rhino, Elephant 和 Snake。其中，最佳公共类型算法可以选择 Animal。