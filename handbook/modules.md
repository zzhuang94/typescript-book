# 模块

JavaScript 在代码模块化方面有着悠久的历史，并衍生出多种不同的方法。
TypeScript 自 2012 年问世以来，已经实现了对许多模块化格式的支持，但随着时间的推移，社区和 JavaScript 规范最终都采用了名为 ES Modules（或 ES6 Modules）的格式。
您可能更熟悉它的 import/export 语法。

ES Modules 于 2015 年被添加到 JavaScript 规范中，到 2020 年，它已在大多数 Web 浏览器和 JavaScript 运行时环境中得到广泛支持。

为了便于理解，本手册将同时介绍 ES Modules 及其流行的前身 CommonJS 的 module.exports= 语法，您可以在“模块”部分的参考章节中找到有关其他模块模式的信息。

# JavaScript 模块

在 TypeScript 中，与 ECMAScript 2015 一样，任何包含顶级 import 或 export 声明的文件都被视为模块。

相反，没有任何顶级 import 或 export 声明的文件则被视为脚本，其内容在全局作用域中可用（因此也对模块可用）。

模块在其自身的作用域内执行，而不是在全局作用域中执行。
这意味着，除非使用 export 语句显式导出，否则在模块外部声明的变量、函数、类等是不可见的。
反之，要使用从其他模块导出的变量、函数、类、接口等，必须使用 import 语句导入。

# 非模块

在开始之前，了解 TypeScript 对模块的定义至关重要。JavaScript 规范声明，任何没有 import 声明、export 或顶层 await 的 JavaScript 文件都应被视为脚本，而非模块。

在脚本文件中，变量和类型声明在共享的全局作用域内。TypeScript 假定你会使用 outFile 编译器选项将多个输入文件合并为一个输出文件，或者在 HTML 中使用多个 `<script>` 标签来加载这些文件（并确保顺序正确！）。

如果你有一个文件当前没有任何 import 或 export 语句，但你希望它被视为模块，请添加以下代码行：

```js
export {};
```

这将把文件更改为不导出任何内容的模块。此语法适用于任何模块目标。

# TypeScript 模块

在 TypeScript 中编写基于模块的代码时，主要需要考虑以下三个方面：
- **语法：** 我希望使用哪种语法来导入和导出模块？
- **模块解析：** 模块名称（或路径）与磁盘上的文件之间是什么关系？
- **模块输出目标：** 生成的 JavaScript 模块应该是什么样子？

## ES 模块语法

一个文件可以通过 `export default` 声明一个主要导出：

```js
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

那么它就可以这样被使用：

```js
import helloWorld from "./hello.js";
helloWorld();
```

除了默认导出 `export default` 之外，您还可以通过省略 `default` 参数来导出多个变量和函数：

```js
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;
 
export class RandomNumberGenerator {}
 
export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
```

这些可以在其它文件中通过 `import` 导入使用：

```js
import { pi, phi, absolute } from "./maths.js";
 
console.log(pi);
const absPhi = absolute(phi);
// const absPhi: number
```

## 附加导入语法

可以使用类似 `import {old as new}` 的格式重命名导入语句：

```js
import { pi as π } from "./maths.js";
console.log(π);
```

您可以将上述语法混合搭配，合并成一个导入语句：

```js
// @filename: maths.ts
export const pi = 3.14;
export default class RandomNumberGenerator {}
 
// @filename: app.ts
import RandomNumberGenerator, { pi as π } from "./maths.js";
```

您可以将所有导出的对象放入一个命名空间中，并使用 * 作为名称：

```js
// @filename: app.ts
import * as math from "./maths.js";
 
console.log(math.pi);
const positivePhi = math.absolute(math.phi);
```

你可以通过导入“./file”将文件导入到当前模块中，而不包含任何变量。

```js
// @filename: app.ts
import "./maths.js";
 
console.log("3.14");
```

在这种情况下，导入操作本身并没有执行任何操作。然而，maths.ts 中的所有代码都被执行了，这可能会触发影响其他对象的副作用。

## TypeScript 特有的 ES 模块语法

类型可以使用与 JavaScript 值相同的语法进行导出和导入：

```js
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
 
export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}
 
// @filename: app.ts
import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

TypeScript 扩展了导入语法，新增了两个用于声明类型导入的概念：

### import type

这个导入语句只能导入类型：

```js
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";
 
// @filename: valid.ts
import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;
 
// @filename: app.ts
import type { createCatName } from "./animal.js";
const name = createCatName();
// 'createCatName' cannot be used as a value because it was imported using 'import type'.
```
### Inline type imports

TypeScript 4.5 还允许在单个导入语句前加上 type 前缀，以表明导入的引用是一个类型：

```js
// @filename: app.ts
import { createCatName, type Cat, type Dog } from "./animal.js";
 
export type Animals = Cat | Dog;
const name = createCatName();
```

这些功能结合起来，可以让 Babel、swc 或 esbuild 等非 TypeScript 转译器知道哪些导入可以安全地删除。

## ES 模块语法与 CommonJS 行为

TypeScript 具有 ES 模块语法，它与 CommonJS 和 AMD 的 require 语句直接对应。
在大多数情况下，使用 ES 模块导入与在这些环境中使用 require 导入相同，但这种语法确保 TypeScript 文件中的内容与 CommonJS 的输出一一对应：

```js
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

# CommonJS 语法

CommonJS 是 npm 上大多数模块所使用的格式。即使您使用的是上面提到的 ES 模块语法，对 CommonJS 语法的简要了解也能帮助您更轻松地进行调试。

## 导出

标识符是通过设置名为 module 的全局模块的 exports 属性来导出的。

```js
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
 
module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
```

然后可以使用 `require` 语法导入：

```js
const maths = require("./maths");
maths.pi; // any 类型
```

或者，您可以使用 JavaScript 中的解构赋值特性来简化操作：

```js
const { squareTwo } = require("./maths");
squareTwo; // any 类型
```

## CommonJS 和 ES Modules 的互操作性

CommonJS 和 ES Modules 在默认导入和模块命名空间对象导入之间的特性存在差异。
TypeScript 提供了一个编译器标志，可以通过 `esModuleInterop` 来减少这两种不同约束之间的冲突。

# TypeScript 的模块导入

模块解析是指从 import 或 require 语句中获取字符串，并确定该字符串指向哪个文件的过程。

TypeScript 包含两种解析策略：Classic 和 Node。Classic 是默认策略，当编译器选项 module 不是 commonjs 时使用，它是为了向后兼容而保留的。
Node 策略模拟了 Node.js 在 CommonJS 模式下的工作方式，并额外检查了 .ts 和 .d.ts 文件。

TypeScript 中有许多 TSConfig 标志会影响模块解析策略：moduleResolution、baseUrl、paths 和 rootDirs。

有关这些策略的完整详细信息，请参阅模块解析参考页面。

# TypeScript 的模块导出

有两个选项会影响生成的 JavaScript 输出：

- `target` 决定哪些 JS 特性会被降级（转换为在旧版 JavaScript 运行时环境中运行），哪些特性保持不变。
- `module` 决定模块之间交互使用哪些代码。

你使用哪个 `target` 取决于你预期运行 TypeScript 代码的 JavaScript 运行时环境中可用的特性。
例如：你支持的最早版本的 Web 浏览器、你预期运行的最低 Node.js 版本，或者来自你的运行时环境的特殊限制——例如 Electron。

模块之间的所有通信都通过模块加载器进行，编译器选项 `module` 决定使用哪个加载器。在运行时，模块加载器负责在执行模块之前查找并执行该模块的所有依赖项。

例如，以下是一个使用 ES Modules 语法的 TypeScript 文件，展示了 `module` 的几个不同选项：

```js
import { valueOfPi } from "./constants.js";
export const twoPi = valueOfPi * 2;
```

## ES2020

```js
import { valueOfPi } from "./constants.js";
export const twoPi = valueOfPi * 2;
```

## CommonJS

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoPi = void 0;
const constants_js_1 = require("./constants.js");
exports.twoPi = constants_js_1.valueOfPi * 2;
```

## UMD

```js
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./constants.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.twoPi = void 0;
    const constants_js_1 = require("./constants.js");
    exports.twoPi = constants_js_1.valueOfPi * 2;
});
```

!> 请注意，ES2020 实际上与原始 index.ts 相同。

您可以在模块的 TSConfig 参考中查看所有可用选项及其生成的 JavaScript 代码。

# TypeScript 命名空间

TypeScript 拥有自己的模块格式，称为命名空间（namespaces），它早于 ES Modules 标准。
这种语法提供了许多用于创建复杂定义文件的实用功能，并且在 DefinitelyTyped 中仍然被广泛使用。
虽然命名空间并未被弃用，但其中的大部分功能在 ES Modules 中已经存在，我们建议您使用 ES Modules 以与 JavaScript 的发展方向保持一致。
您可以在命名空间参考页面中了解更多关于命名空间的信息。
