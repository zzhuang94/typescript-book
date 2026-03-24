# `?`、`??`、`!` 等符号详解

在 TypeScript/JavaScript 中，`?`、`??`、`!` 这类符号非常高频，但它们分属不同层面：有的是**语法运算符**，有的是 **TypeScript 类型系统语法**。本文从语义、用法、边界和常见误区出发，系统说明这些符号的作用与区别。

# 总览

| 符号 | 名称 | 主要作用 | 所属层面 |
|:-----|:-----|:---------|:---------|
| `?` | 可选/条件相关符号 | 可选属性、可选参数、可选链、三元表达式一部分 | JS + TS |
| `??` | 空值合并运算符 | 仅在左侧为 `null/undefined` 时使用右侧默认值 | JS |
| `!` | 逻辑非、非空断言、确定赋值断言 | 取反；告诉 TS “这里不是 null/undefined”；声明属性稍后赋值 | JS + TS |
| `&` | 按位与 / 交叉类型符号 | JS 中做位运算；TS 中组合多个类型 | JS + TS |
| `&&` | 逻辑与运算符 | 左侧为真才继续返回右侧，具备短路特性 | JS |
| `?.` | 可选链运算符 | 安全访问深层属性/方法，避免空值时报错 | JS |
| `?:` | 条件（三元）运算符 | 根据条件返回两个分支之一 | JS |
| `??=` | 空值合并赋值 | 仅当变量是 `null/undefined` 时才赋值 | JS |

---

# `?` 的用法

## 可选属性

在类型声明中，`prop?: T` 表示该属性**可以不存在**。

```js
type User = {
  id: number;
  nickname?: string; // 可选属性
};

const a: User = { id: 1 }; // OK，不提供 nickname
const b: User = { id: 2, nickname: "neo" }; // OK
```

这里的重点不是“值一定是 string 或 undefined”，而是“这个键本身可以缺失”。

## 可选参数

函数参数 `x?: T` 表示调用时可以不传。

```js
function greet(name?: string) {
  return `hi, ${name ?? "guest"}`;
}

greet();        // hi, guest
greet("Alice"); // hi, Alice
```

`name?: string` 在函数体里通常表现为 `string | undefined`，因此常与 `??` 搭配。

## 可选链

可选链用于“如果左侧是 `null/undefined`，就短路返回 `undefined`”。

```js
const city = user?.profile?.address?.city;
const upper = user?.getName?.().toUpperCase();
```

它解决的是“访问链路中断导致报错”的问题，常替代早期大量的 `&&` 判空写法。

## 三元表达式

这是 `condition ? a : b` 的一部分。

```js
const label = isAdmin ? "admin" : "user";
```

这个 `?` 与可选属性/可选参数不是一个概念：它是表达式运算符的一部分。

# `??` 的用法

`a ?? b` 的语义是：

- 当 `a` 是 `null` 或 `undefined` 时，结果为 `b`
- 否则结果为 `a`

```js
const port = config.port ?? 3000;
```

## 与 `||` 的关键区别

`||` 会把所有假值（`0`、`""`、`false`、`NaN`）都当成“需要默认值”，而 `??` 只处理空值（`null/undefined`）。

```js
const a = 0 || 10;   // 10
const b = 0 ?? 10;   // 0

const c = "" || "x"; // "x"
const d = "" ?? "x"; // ""
```

因此当 `0`、空字符串、`false` 都是有效业务值时，优先使用 `??`。

## `??=` 空值合并赋值

```js
let timeout: number | undefined;
timeout ??= 5000; // 仅当 timeout 是 null/undefined 才赋值
```

适合“惰性初始化默认值”场景。

# `!` 的用法

## 逻辑非

`!value` 会先转布尔再取反，`!!value` 常用于显式布尔化。

```js
!0;      // true
!!"abc"; // true
```

## 非空断言

在表达式后写 `!`，表示“我确信这里不是 `null/undefined`”，让 TS 不再报空值错误。

```js
function printLen(s?: string) {
  return s!.length; // 告诉 TS: s 一定有值
}
```

这只是**类型层断言**，不会生成运行时判空代码；如果判断错了，运行时仍可能报错。

## 确定赋值断言

在类属性名后写 `!`，表示“该属性会在构造流程之外被赋值”。

```js
class Service {
  repo!: { find(): void }; // 告诉 TS：稍后会初始化

  start() {
    this.repo.find();
  }
}
```

常见于依赖注入框架或生命周期回调初始化场景。

# `&` 的用法

## 交叉类型

在 TypeScript 类型层，`A & B` 表示同时满足 `A` 和 `B`。

```js
type Animal = { name: string };
type CanRun = { run(): void };

type Dog = Animal & CanRun;

const dog: Dog = {
  name: "Lucky",
  run() {
    console.log("running");
  }
};
```

它常用于把多个类型约束“叠加”到一个对象上。

## 接口能力组合

```js
type WithId = { id: number };
type WithTime = { createdAt: Date };
type Entity = WithId & WithTime;
```

这和接口的 `extends` 类似，都是在做类型扩展；区别是 `&` 更偏“表达式式组合”。

## 按位与

在 JavaScript 运行时，`a & b` 是按位与运算，会把操作数转成 32 位整数后逐位计算。

```js
5 & 3; // 1 (0101 & 0011 => 0001)
```

业务代码中不如 `&&` 常见，更多见于底层位标记处理。

# `&&` 的用法

## 逻辑与与短路

`a && b` 的语义：

- 若 `a` 为假值，直接返回 `a`（右侧不执行）
- 若 `a` 为真值，返回 `b`

```js
const result1 = 0 && "next";      // 0
const result2 = "ok" && "next";   // "next"
```

这就是“短路”行为，常用于条件执行：

```js
isReady && doSomething();
```

## 与 `if` 的取舍

```js
// 简写
isReady && doSomething();

// 可读性更强
if (isReady) {
  doSomething();
}
```

当逻辑较复杂时，优先 `if`，可读性通常更好。

## `&&=` 逻辑与赋值

`x &&= y` 等价于“当 `x` 为真值时，才把 `y` 赋给 `x`”。

```js
let enabled = true;
enabled &&= false; // enabled 变为 false
```

## 与 `??` 的区别

- `&&` 关注“真/假值”
- `??` 只关注 `null/undefined`

```js
const a = "" && "fallback"; // ""
const b = "" ?? "fallback"; // ""
```

两者都可能“返回左侧”，但判断标准完全不同。

# 高频组合与实践写法

## `?.` + `??`：安全读取 + 默认值

```js
const theme = settings?.ui?.theme ?? "light";
```

这是最常见组合：链路可中断，但最终总有默认值。

## 函数参数默认值 与 `??`

```js
function createLogger(level?: string) {
  const realLevel = level ?? "info";
  // ...
}
```

如果只希望“没传或传了 undefined 时用默认值”，也可直接写参数默认值：

```js
function createLogger(level = "info") {
  // ...
}
```

两者都常见；当默认逻辑要依赖多个值时，`??` 在函数体内更灵活。

## 避免滥用非空断言 `!`

```js
// 不推荐：掩盖真实空值问题
const len = maybeName!.length;

// 推荐：先缩小类型再使用
if (maybeName != null) {
  const len2 = maybeName.length;
}
```

`!` 适合你非常确定的边界点，不应替代正常判空。

# 容易混淆的点

## `prop?: T` 与 `prop: T | undefined` 不完全等价

```js
type A = { x?: number };
type B = { x: number | undefined };
```

- `A`：`x` 可以缺失
- `B`：`x` 必须存在，只是值可为 `undefined`

在对象合并、序列化、`in` 操作符判断时，这个差异很重要。

## `??` 不能随意和 `||`、`&&` 混写

在不加括号时，`??` 与 `||`/`&&` 混用会触发语法限制。应明确加括号提升可读性：

```js
const result = (a ?? b) || c;
```

## 非空断言不会产生运行时保护

`value!` 只影响 TS 类型检查，不会注入判空代码。运行时安全仍需你自己保证。

# 选择建议（速查）

- 需要“属性/参数可不传” -> 用 `?`（可选属性/可选参数）
- 需要“深层安全访问” -> 用 `?.`
- 需要“仅 null/undefined 才给默认值” -> 用 `??`
- 需要“同时满足多个类型约束” -> 用类型层 `&`
- 需要“按条件短路执行” -> 用 `&&`
- 需要“通用真假判断默认值” -> 用 `||`（明确接受 `0`/`""`/`false` 被替换）
- 需要“告诉 TS 此处非空” -> 用表达式后缀 `!`（谨慎）
- 类属性延后初始化 -> 用属性名后缀 `!`

掌握这几个符号的边界，核心是区分三件事：**空值（nullish）**、**假值（falsy）**、**类型断言（仅编译期）**。区分清楚后，代码可读性与稳定性会明显提升。
