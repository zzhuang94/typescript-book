# type、class、interface 三者对比

TypeScript 中 `type`（类型别名）、`class`（类）和 `interface`（接口）都可用于描述“类型”，但它们在类型系统与运行时中的角色差异很大。本文从本质、能力、扩展与合并、运行时表现及使用场景等方面做详细对比。

# 本质：声明创建了什么

在 TypeScript 的声明合并文档中，声明被分为三类实体：**命名空间**、**类型**、**值**。

| 声明类型   | 创建命名空间 | 创建类型 | 创建值（运行时存在） |
|:-----------|:------------:|:--------:|:---------------------:|
| interface  |              | ✓        |                       |
| type alias |              | ✓        |                       |
| class      |              | ✓        | ✓                     |

- **interface**：只创建**类型**。编译后不会生成任何 JavaScript 代码，仅用于类型检查。
- **type**：只创建**类型**。同样是纯类型层概念，编译后不保留。
- **class**：同时创建**类型**和**值**。既参与类型检查，也会生成构造函数和原型等运行时代码。

因此，**只有 class 会在运行时存在**；interface 和 type 只在编译阶段存在。

# type（类型别名）

## 基本语法与能力

类型别名用于给任意类型起一个名字，语法为 `type Name = ...`。

```js
// 对象类型
type Point = {
  x: number;
  y: number;
};

// 原始类型、联合类型
type ID = number | string;
type Status = "pending" | "success" | "error";

// 函数类型
type Handler = (event: Event) => void;

// 元组
type Pair = [string, number];

// 从已有类型映射、组合（泛型、条件类型等）
type Nullable<T> = T | null;
type ReadonlyPoint = Readonly<Point>;
```

**特点：**

- 可以为**任意类型**命名：对象、原始类型、联合、交叉、函数、元组、字面量类型等。
- 一旦定义完成，**不能重新打开**添加新属性；同一名称不能重复声明。
- 不参与**声明合并**；同名 `type` 会报 “Duplicate identifier” 错误。

## 继承与组合

类型别名通过**交叉类型**（`&`）做“继承”或组合，而不是 `extends`。

```js
type Animal = {
  name: string;
};
type Bear = Animal & {
  honey: boolean;
};
```

# interface（接口）

## 基本语法与能力

接口用于描述**对象形状**（以及可调用/可构造签名），语法为 `interface Name { ... }`。

```js
interface Point {
  x: number;
  y: number;
}

interface User {
  id: number;
  name: string;
  greet(): string;
}

// 可索引签名
interface StringMap {
  [key: string]: string;
}
```

**特点：**

- 主要描述**对象**的结构（属性、方法、索引等），也可描述函数类型、构造函数类型。
- **可扩展**：同一名称的多个 `interface` 会**声明合并**为一个接口。
- **可继承**：通过 `extends` 继承一个或多个接口。

## 扩展与声明合并

接口支持 `extends` 和**声明合并**，这是与 type 最明显的区别。

```js
// 继承
interface Animal {
  name: string;
}
interface Bear extends Animal {
  honey: boolean;
}

// 声明合并：同名接口会合并
interface Window {
  title: string;
}
interface Window {
  ts: SomeAPI;
}
// 使用处：Window 同时拥有 title 和 ts
```

因此，**为已有类型（如内置的 Window、Document）做全局或模块增强时，通常用 interface**，因为可以合并；type 不能重复声明同名类型。

# class（类）

## 双重身份：类型 + 值

class 既在类型层面定义一个“实例类型”，又在值层面提供一个构造函数，因此可以 `new`、继承、实现接口。

```js
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  move(distance: number) {
    console.log(`${this.name} moved ${distance}m`);
  }
}

// 作为类型使用
let a: Animal = new Animal("Cat");

// 作为值使用（构造函数）
function create(ctor: new (name: string) => Animal) {
  return new ctor("Unknown");
}
```

**特点：**

- **类型**：class 名表示其实例类型（不含 static 成员）；类型比较时只看实例成员，且受 private/protected 影响（见类型兼容文档）。
- **值**：class 是构造函数，可以 `new`、`extends`、`implements`，有原型与静态成员。
- 可以有 **private / protected**，会参与类型兼容性检查（同源类才能赋值）。
- **不能**与另一个 class 或变量做声明合并。

## 与 interface / type 的配合

class 可以实现（implements）接口或类型别名描述的对象类型：

```js
interface IAnimal {
  name: string;
  move(distance: number): void;
}

type TAnimal = {
  name: string;
  move(distance: number): void;
};

class Dog implements IAnimal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  move(distance: number) {
    console.log(`${this.name} ran ${distance}m`);
  }
}

// 也可以 implements 多个接口
class Bird implements IAnimal, SomeOther {
  // ...
}
```

# 三者对比小结

## 能力对比表

| 维度           | type                    | interface                 | class                          |
|:---------------|:------------------------|:--------------------------|:-------------------------------|
| 是否产生运行时代码 | 否                      | 否                        | 是（构造函数、原型等）           |
| 描述对象形状   | ✓                       | ✓                         | ✓（实例成员）                   |
| 描述原始/联合/元组等 | ✓                       | 否（仅对象相关）           | 否                             |
| 可继承/扩展    | 通过 `&` 交叉           | 通过 `extends` 和合并     | 通过 `extends`                 |
| 声明合并       | 否（同名报错）          | 是                        | 否                             |
| 可实现（implements） | 可被 class 实现         | 可被 class 实现            | 可 implements 多个 interface/type |
| 私有/受保护成员 | 无                      | 无                        | 有，且影响类型兼容              |
| 静态成员       | 无                      | 无                        | 有（仅值层面，不进入实例类型）   |

## 类型层面的兼容与区别

在 TypeScript 的结构类型系统中，只要**形状兼容**，不同类型可以互相赋值。因此用 interface 和 type 描述的相同形状，在类型检查时是兼容的：

```js
interface IPoint {
  x: number;
  y: number;
}
type TPoint = {
  x: number;
  y: number;
};
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

let i: IPoint = { x: 0, y: 0 };
let t: TPoint = i;   // OK
let c: Point = i;    // OK（结构兼容）
```

但若 class 带有 **private** 或 **protected** 成员，则只有“同源”的实例才能互相赋值，结构相同但来自不同类声明的实例不兼容（参见《类型兼容》中“类中的私有成员和受保护成员”）。

## 错误信息与性能

- **错误信息**：interface 名称在错误信息中通常更稳定地以“接口名”形式出现；类型别名有时会展开为底层结构。现代 TS 版本中差异已缩小。
- **编译性能**：使用 `extends` 的 interface 继承，一般比用交叉类型（`&`）组合的 type 更易被编译器优化；对大型项目可能有轻微差异。

# 使用场景与选择建议

## 何时用 type

- 需要为**非对象类型**命名：联合、交叉、原始类型、元组、函数类型、映射类型等。
- 需要**泛型工具类型**：`Nullable<T>`、`Pick<T, K>` 等。
- 需要**条件类型**、**infer** 等高级类型运算。
- 不希望该类型被**再次打开**或参与声明合并，希望“一次定义、不可扩展”。

## 何时用 interface

- 主要描述**对象/类的形状**，且可能被**多次扩展**或**声明合并**（如为 Window、Document 等做增强）。
- 希望类型在错误信息中始终以**接口名**出现。
- 团队约定“能用 interface 就用 interface”，以利用扩展与合并能力及潜在性能优势。

## 何时用 class

- 需要**运行时实体**：要 `new`、要继承、要维护实例状态与原型链。
- 需要 **private / protected** 或 **static** 成员。
- 既要类型约束，又要对应实现（逻辑与数据）——即“既有类型又有代码”。

## 组合使用

常见模式是：**用 interface（或 type）描述契约，用 class 做实现**。

```js
interface Serializable {
  serialize(): string;
}

class Document implements Serializable {
  serialize() {
    return "...";
  }
}
```

对“纯数据形状”且不需合并时，type 与 interface 可互换；一旦涉及扩展、合并或非对象类型，按上表选择 type 或 interface，再根据需要决定是否用 class 提供运行时实现。
