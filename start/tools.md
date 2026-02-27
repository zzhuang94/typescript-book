# TypeScript工具

让我们从使用TypeScript构建一个简单的Web应用程序开始。

# 安装 TypeScript

```shell
npm install -g typescript
```

# 创建 TypeScript 文件

在你的编辑器中，在greeter.ts中输入以下JavaScript代码：

```js
function greeter(person) {
  return "Hello, " + person;
}
 
let user = "Jane User";
 
document.body.textContent = greeter(user);
```

# 编译代码

我们使用了.ts扩展名，但这段代码只是JavaScript。你本可以直接从现有的JavaScript应用中复制粘贴这段代码。

在命令行中，运行 TypeScript 编译器：

```shell
tsc greeter.ts
```

结果将是一个名为 `greeter.js` 的文件，其中包含您输入的相同JavaScript代码。我们的JavaScript应用已使用TypeScript启动并运行！

现在，我们可以开始利用TypeScript提供的一些新工具了。在此处所示的“person”函数参数中添加一个 `: string` 类型注解：

```js
function greeter(person: string) {
  return "Hello, " + person;
}
 
let user = "Jane User";
 
document.body.textContent = greeter(user);
```

# 类型注解

在TypeScript中，类型标注是一种轻量级的方法，用于记录函数或变量的预期契约。在本例中，我们希望greeter函数能够接受一个字符串参数。我们可以尝试将调用greeter改为传递一个数组：

```js
function greeter(person: string) {
  return "Hello, " + person;
}
 
let user = [0, 1, 2];
 
document.body.textContent = greeter(user);
// Argument of type 'number[]' is not assignable to parameter of type 'string'.
```

重新编译，你将会看到一个报错：

!> error TS2345: Argument of type 'number[]' is not assignable to parameter of type 'string'.

同样，尝试移除greeter调用的所有参数。TypeScript会提示你调用此函数时使用了意外数量的参数。在这两种情况下，TypeScript都可以基于代码结构和您提供的类型注释提供静态分析。

请注意，尽管存在错误，greeter.js文件仍然被创建了。即使代码中有错误，你也可以使用TypeScript。但在这种情况下，TypeScript会警告你的代码可能无法按预期运行。

# 接口

让我们进一步开发我们的示例。这里我们使用一个接口来描述具有 firstName 和 lastName 字段的对象。
在TypeScript中，如果两个类型的内部结构兼容，那么它们就是兼容的。这使我们只需拥有接口所需的形状，就可以实现接口，而无需显式的 `implements` 子句。

```js
interface Person {
  firstName: string;
  lastName: string;
}
 
function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}
 
let user = { firstName: "Jane", lastName: "User" };
 
document.body.textContent = greeter(user);
```

# 类

最后，让我们最后一次用类来扩展这个示例。TypeScript支持JavaScript中的新特性，比如支持基于类的面向对象编程。

接下来，我们将创建一个包含构造函数和几个公共字段的Student类。请注意，类和接口可以很好地结合使用，让程序员能够决定合适的抽象层次。

同样值得注意的是，在构造函数的参数上使用公共（public）关键字是一种简写方式，它允许我们自动创建具有该名称的属性。

```js
class Student {
  fullName: string;
  constructor(
    public firstName: string,
    public middleInitial: string,
    public lastName: string
  ) {
    this.fullName = firstName + " " + middleInitial + " " + lastName;
  }
}
 
interface Person {
  firstName: string;
  lastName: string;
}
 
function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}
 
let user = new Student("Jane", "M.", "User");
 
document.body.textContent = greeter(user);
```

重新运行tsc greeter.ts，你会看到生成的JavaScript与之前的代码相同。TypeScript中的类只是基于原型面向对象（OO）的简写，这种面向对象在JavaScript中经常使用。

# 运行 TypeScript

创建 `greeter.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>TypeScript Greeter</title>
  </head>
  <body>
    <script src="greeter.js"></script>
  </body>
</html>
```

在浏览器中打开greeter.html，运行你的第一个简单的TypeScript Web应用程序！