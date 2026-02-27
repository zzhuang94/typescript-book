# 类型收窄

假设我们有一个 `padLeft` 函数：

```js
function padLeft(padding: number | string, input: string): string {
  throw new Error("Not implemented yet!");
}
```

如果padding是一个数字，则将其视为我们想要在输入前添加的空格数量。如果padding是一个字符串，则应直接将padding添加到输入前。让我们尝试实现当padLeft传递给padding一个数字时的逻辑。

```js
function padLeft(padding: number | string, input: string): string {
  return " ".repeat(padding) + input;
  // Argument of type 'string | number' is not assignable to parameter of type 'number'.
  // Type 'string' is not assignable to type 'number'. 
}
```

哎呀，我们在处理padding时遇到了错误。TypeScript警告我们，传递给repeat函数的值的类型是number | string，而该函数只接受数字，它是对的。换句话说，我们没有先明确检查padding是否为数字，也没有处理它是字符串的情况，所以让我们现在就做这件事。

```js
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

如果这看起来主要是些无趣的JavaScript代码，那也正是我们的目的。除了我们添加的注释外，这段TypeScript代码看起来和JavaScript没什么两样。TypeScript的类型系统的设计理念是，在不牺牲类型安全的前提下，尽可能简化编写典型JavaScript代码的过程。

虽然看起来可能没什么，但实际上这里有很多东西在幕后进行。就像TypeScript使用静态类型来分析运行时值一样，它会在JavaScript的运行时控制流结构（如if/else、条件三元组、循环、真值检查等）上叠加类型分析，这些都会影响这些类型。

在我们的if检查中，TypeScript识别到typeof padding === "number"，并将其理解为一种特殊的代码形式，称为类型保护。TypeScript会追踪程序可能采取的执行路径，以分析给定位置上值的最具体可能类型。它会查看这些特殊的检查（称为类型保护）和赋值操作，而将类型精炼为比声明时更具体的类型的过程称为“窄化”。在许多编辑器中，我们可以观察到这些类型的变更，在我们的示例中也会这样做。

```js
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input; // (parameter) padding: number
  }
  return padding + input; // (parameter) padding: string
}
```

TypeScript支持几种不同的构造来进行类型收窄。

# typeof 校验

如我们所知，JavaScript支持一个 `typeof` 操作符，该操作符可以在运行时提供关于值类型的非常基本的信息。TypeScript期望该操作符返回一组特定的字符串：

- "string"
- "number"
- "bigint"
- "boolean"
- "symbol"
- "undefined"
- "object"
- "function"

正如我们在padLeft中所见，这个操作符在许多JavaScript库中经常出现，而TypeScript能够理解它，从而在不同分支中缩小类型范围。

在TypeScript中，根据typeof返回的值进行校验是一种类型保护机制。由于TypeScript对不同类型的值进行了编码，因此它了解JavaScript中的一些特性。例如，请注意，在上面的列表中，typeof 并没有返回字符串 `null`。请看以下示例：

```js
function printAll(strs: string | string[] | null) {
  if (typeof strs === "object") {
    for (const s of strs) { // 'strs' is possibly 'null'.
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  } else {
    // do nothing
  }
}
```

在printAll函数中，我们尝试检查strs是否为对象，以判断其是否为数组类型（*现在可能是时候强调一下，在JavaScript中数组是对象类型*）。
但事实证明，在JavaScript中，**typeof null实际上返回的是"object"！** 这是历史遗留的不幸问题之一。

有足够经验的用户可能不会感到惊讶，但并非每个人在JavaScript中都遇到过这种情况；幸运的是，TypeScript让我们知道，strs 的类型被限定为 `string[] | null`，而不仅仅是 `string[]`。

这或许是一个很好的过渡，引入我们所说的“真实性”检查。

# 真值检查

`Truthiness` 真值————这个词可能不会出现在字典里，但你肯定会在JavaScript中听到它。

在JavaScript中，我们可以在条件语句、&&运算符、||运算符、if语句、布尔否定（!）等中使用任何表达式。例如，if语句并不要求其条件总是布尔类型。

```js
function getUsersOnlineMessage(numUsersOnline: number) {
  if (numUsersOnline) {
    return `There are ${numUsersOnline} online now!`;
  }
  return "Nobody's here. :(";
}
```

在JavaScript中，像if这样的构造首先会将其条件“强制转换为”布尔值以便理解，然后根据结果为 `true` 还是 `false` 来选择执行相应的分支。像

- 0
- NaN
- "" (the empty string)
- 0n (the bigint version of zero)
- null
- undefined

所有值都会被强制转换为 `false`，而其他值则会被强制转换为 `true`。你总是可以通过运行布尔函数或将值置于双否定（double-Boolean negation）中来将值强制转换为布尔值。（后者的优点是，TypeScript 会推断出一种更精确的布尔字面量类型 `true`，而前者则会被推断为 `boolean` 类型。）

!> **译者注：** 注意，空数组 `[]` 和 空对象 `{}` 会强制转为 `true`

```js
// both of these result in 'true'
Boolean("hello"); // type: boolean, value: true
!!"world"; // type: true,    value: true  XXX This kind of expression is always truthy.
```

利用这一行为相当流行，尤其是在防范 `null` 或 `undefined` 等值时。举个例子，让我们尝试将其应用于我们的printAll函数。

```js
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
```

你会注意到，我们通过检查strs是否为真来避免了上述错误。这至少能防止我们在运行代码时出现可怕的错误，例如：`TypeError: null is not iterable`

但请记住，对原语进行真实性检查往往容易出错。举个例子，考虑一下编写printAll的另一种尝试

```js
function printAll(strs: string | string[] | null) {
  // !!!!!!!!!!!!!!!!
  //  DON'T DO THIS!
  //   KEEP READING
  // !!!!!!!!!!!!!!!!
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}
```

我们将函数的整个主体都包裹在一个真值检查中，但这有一个微妙的缺点：我们可能无法再正确处理空字符串的情况。

TypeScript在这里对我们完全没有影响，但如果你对JavaScript不太熟悉，这种行为就值得注意。TypeScript通常可以帮助你尽早发现bug，但如果你选择对一个值不做任何处理，在不显得过于规范的情况下，它所能做的也就仅此而已。如果你愿意，可以使用代码检查工具来确保处理这类情况。

关于通过真实性进行缩小的最后一点是，使用！进行布尔否定会从被否定的分支中过滤掉。

```js
function multiplyAll(
  values: number[] | undefined,
  factor: number
): number[] | undefined {
  if (!values) {
    return values;
  } else {
    return values.map((x) => x * factor);
  }
}
```

# 等值校验

TypeScript 还使用 switch 语句和等式检查（如 ===、!==、== 和 !=）来缩小类型范围。例如：

```js
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // We can now call any 'string' method on 'x' or 'y'.
    x.toUpperCase(); // (method) String.toUpperCase(): string
    y.toLowerCase(); // (method) String.toLowerCase(): string
  } else {
    console.log(x); // (parameter) x: string | number
    console.log(y); // (parameter) y: string | boolean
  }
}
```

在上述示例中，当我们检查x和y是否都相等时，TypeScript知道它们的类型也必须是相等的。由于 `string` 是 x 和 y 可能采用的唯一共同类型，因此 TypeScript 知道在第一个分支中 x 和 y 必须是字符串。

针对特定字面值（而非变量）的检查也是有效的。在我们关于真值缩小的部分中，我们编写了一个printAll函数，该函数容易出错，因为它意外地没有正确处理空字符串。相反，我们本可以进行特定的检查来排除 `null`，而 TypeScript 仍然会正确地从 strs 的类型中移除 `null`。

```js
function printAll(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === "object") {
      for (const s of strs) { // (parameter) strs: string[]
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs); // (parameter) strs: string
    }
  }
}
```

JavaScript 中使用 == 和 != 进行的较宽松的等式检查也会被正确缩小范围。如果你不熟悉，检查某个值是否等于 null 实际上不仅会检查它是否具体为值 null，还会检查它是否可能为 undefined。这同样适用于 == undefined：它会检查一个值是 null 还是 undefined。

```js
interface Container {
  value: number | null | undefined;
}
 
function multiplyValue(container: Container, factor: number) {
  // Remove both 'null' and 'undefined' from the type.
  if (container.value != null) {
    console.log(container.value); // (property) Container.value: number
    // Now we can safely multiply 'container.value'.
    container.value *= factor;
  }
}
```

# in 校验

JavaScript 有一个运算符用于判断一个对象或其原型链中是否存在具有特定名称的属性：即 in 运算符。TypeScript 将此作为缩小潜在类型范围的一种方法加以考虑。

例如，对于代码：“value” in x，其中“value”是一个字符串字面量，x是一个联合类型。“true”分支将x的类型限定为具有可选或必需属性值的类型，而“false”分支则限定为具有可选或缺失属性值的类型。

```js
type Fish = { swim: () => void };
type Bird = { fly: () => void };
 
function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }
  return animal.fly();
}
```

重申一下，在筛选过程中，双方都会存在可选属性。例如，一个人可以既会游泳又会飞行（在有合适装备的情况下），因此他应该出现在筛选的两方面：

```js
type Fish = { swim: () => void };
type Bird = { fly: () => void };
type Human = { swim?: () => void; fly?: () => void };
 
function move(animal: Fish | Bird | Human) {
  if ("swim" in animal) {
    animal; // (parameter) animal: Fish | Human
  } else {
    animal; // (parameter) animal: Bird | Human
  }
}
```

# instanceof 校验

JavaScript 有一个运算符用于检查一个值是否是另一个值的“实例”。更具体地说，在 JavaScript 中，x instanceof Foo 会检查 x 的原型链是否包含 Foo.prototype。虽然我们在这里不会深入探讨，而且当我们进入类的话题时，你会看到更多相关内容，但对于大多数可以通过 new 构造的值来说，它们仍然很有用。你可能已经猜到了，instanceof 也是一种类型保护机制，而 TypeScript 会在由 instanceof 保护的分支中进行类型收窄。

```js
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString()); // (parameter) x: Date
  } else {
    console.log(x.toUpperCase()); // (parameter) x: string
  }
}
```

# 赋值

正如我们之前提到的，当我们给任何变量赋值时，TypeScript会查看赋值语句的右侧，并相应地缩小左侧变量的类型范围。

```js
let x = Math.random() < 0.5 ? 10 : "hello world!"; // let x: string | number
x = 1;
console.log(x); // let x: number
x = "goodbye!";
console.log(x); // let x: string

x = true; // Type 'boolean' is not assignable to type 'string | number'.
```
请注意，这些赋值操作都是有效的。尽管在第一次赋值后，x 的观察到的类型更改为 `number`，但我们仍然能够给 x 赋值一个字符串。这是因为 x 的声明类型（即 x 最初的类型）是 `string | number`，而赋值操作总是根据声明类型来检查的。

如果我们给x赋值一个布尔值，就会看到错误，因为这不是声明类型的一部分。