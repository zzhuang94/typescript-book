# 从类型创建类型

TypeScript 的类型系统非常强大，因为它允许用其他类型来表达类型。

这个概念最简单的形式就是泛型。此外，我们还有各种各样的类型操作符可供使用。甚至可以用我们已经拥有的值来表达类型。

通过组合各种类型操作符，我们可以用一种简洁、可维护的方式来表达复杂的操作和值。在本节中，我们将介绍如何用现有的类型或值来表达新类型的方法。

*   [泛型](handbook/types/generics.md) - 带有参数的类型
*   **Keyof 类型操作符（Keyof Type Operator）** - 使用 `keyof` 操作符创建新类型
*   **Typeof 类型操作符（Typeof Type Operator）** - 使用 `typeof` 操作符创建新类型
*   **索引访问类型（Indexed Access Types）** - 使用 `Type['a']` 语法访问类型的子集
*   **条件类型（Conditional Types）** - 在类型系统中像 if 语句一样起作用的类型
*   **映射类型（Mapped Types）** - 通过映射现有类型中的每个属性来创建类型
*   **模板字面量类型（Template Literal Types）** - 通过模板字面量字符串更改属性的映射类型