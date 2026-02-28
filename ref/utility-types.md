# 公共类型

TypeScript 提供了多种实用类型，以简化常见的类型转换。这些实用类型是全局可用的。

# Awaited\<Type\>

这种类型旨在模拟异步函数中的 await 操作，或者 Promises 上的 .then() 方法——具体来说，就是它们递归地解包 Promises 的方式。

```js
type A = Awaited<Promise<string>>;
// type A = string
 
type B = Awaited<Promise<Promise<number>>>; 
// type B = number
 
type C = Awaited<boolean | Promise<number>>;
// type C = number | boolean
```

# Partial\<Type\>

构造一个类型，并将 Type 的所有属性设置为可选。此工具将返回一个表示给定类型的所有子集的类型。

```js
interface Todo {
  title: string;
  description: string;
}
 
function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}
 
const todo1 = {
  title: "organize desk",
  description: "clear clutter",
};
 
const todo2 = updateTodo(todo1, {
  description: "throw out trash",
});
```

# Required\<Type\>

构造一个类型，该类型包含所有设置为必需的类型属性。与 `Partial` 相反。

```js
interface Props {
  a?: number;
  b?: string;
}
 
const obj: Props = { a: 5 };
 
const obj2: Required<Props> = { a: 5 };
// Property 'b' is missing in type '{ a: number; }' but required in type 'Required<Props>'.
```

# Readonly\<Type\>

构造一个类型，并将该类型的所有属性设置为只读，这意味着构造的类型的属性不能重新赋值。

```js
interface Todo {
  title: string;
}
 
const todo: Readonly<Todo> = {
  title: "Delete inactive users",
};
 
todo.title = "Hello";
// Cannot assign to 'title' because it is a read-only property.
```

这个工具可用于表示运行时会失败的赋值表达式（例如，尝试重新分配冻结对象的属性时）。

## Object.freeze

```js
function freeze<Type>(obj: Type): Readonly<Type>;
```

# Record\<Keys, Type\>

对象的键（Keys）的类型。通常是 string、number、symbol 或者它们的联合类型（Union Type）。

```js
// 定义一个记录学生分数的对象
const scores: Record<string, number> = {
  "Alice": 95,
  "Bob": 88,
  "Charlie": 72,
  // "David": "Fail" // 报错：值必须是 number
};
```


构造一个对象类型，其属性键为 Keys，属性值为 Type。此实用程序可用于将一种类型的属性映射到另一种类型。

```js
type CatName = "miffy" | "boris" | "mordred";
 
interface CatInfo {
  age: number;
  breed: string;
}
 
const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: "Persian" },
  boris: { age: 5, breed: "Maine Coon" },
  mordred: { age: 16, breed: "British Shorthair" },
};
 
cats.boris;
// const cats: Record<CatName, CatInfo>
```

# Pick\<Type, Keys\>

通过从 Type 中选择属性 Keys（字符串字面量或字符串字面量的联合）来构造类型。

```js
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}
 
type TodoPreview = Pick<Todo, "title" | "completed">;
 
const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};
 
todo;
```

# Omit\<Type, Keys\>

通过从类型中选择所有属性，然后移除键（字符串字面量或字符串字面量的并集）来构造类型。与 `Pick` 操作相反。

```js
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}
 
type TodoPreview = Omit<Todo, "description">;
 
const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
  createdAt: 1615544252770,
};
 
todo;

type TodoInfo = Omit<Todo, "completed" | "createdAt">;
 
const todoInfo: TodoInfo = {
  title: "Pick up kids",
  description: "Kindergarten closes at 5pm",
};
 
todoInfo;
```

# Exclude\<UnionType, ExcludedMembers\>

通过从 UnionType 中排除所有可分配给 ExcludedMembers 的联合成员来构造类型。

```js
type T0 = Exclude<"a" | "b" | "c", "a">;  
// type T0 = "b" | "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
// type T1 = "c"
type T2 = Exclude<string | number | (() => void), Function>;
// type T2 = string | number
 
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
 
type T3 = Exclude<Shape, { kind: "circle" }>

// type T3 = {
//     kind: "square";
//     x: number;
// } | {
//     kind: "triangle";
//     x: number;
//     y: number;
// }
```

# Extract\<Type, Union\>

通过从 Type 中提取所有可赋值给 Union 的联合成员来构造一个类型。

```js
type T0 = Extract<"a" | "b" | "c", "a" | "f">;
// type T0 = "a"
type T1 = Extract<string | number | (() => void), Function>;
// type T1 = () => void
 
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
 
type T2 = Extract<Shape, { kind: "circle" }>
// type T2 = {
//     kind: "circle";
//     radius: number;
// }
```

# NonNullable\<Type\>

通过从类型中排除 null 和 undefined 来构造类型。

```js
type T0 = NonNullable<string | number | undefined>;
// type T0 = string | number

type T1 = NonNullable<string[] | null | undefined>;
// type T1 = string[]
```

# Parameters\<Type\>

它的作用是：提取一个函数类型（Function Type）的所有参数类型，并把它们作为一个元组（Tuple）返回。

简单来说，就是“把函数的参数列表抠出来，变成一个数组类型”。

Type: 必须是一个函数类型（(...args: any) => any）

- 场景 A：获取函数的参数类型
  假设你使用了一个第三方库，或者引用了别人的代码，你想复用某个函数的参数类型，但对方没有直接导出这个参数的 interface。

```js
// 假设这是第三方库的一个函数
function createStudent(id: number, name: string, config: { grade: number; active: boolean }) {
  console.log(id, name, config);
}

// 我们想定义一个变量，它的类型刚好就是 createStudent 的参数列表
// T1 的类型就是: [id: number, name: string, config: { grade: number; active: boolean }]
type StudentParams = Parameters<typeof createStudent>;

// 使用提取出来的类型
const args: StudentParams = [101, "Alice", { grade: 3, active: true }];

// 可以直接传给原函数 (使用扩展运算符)
createStudent(...args);
```

- 场景 B：获取特定位置的参数类型
  既然 Parameters 返回的是一个元组（Tuple）（本质上是数组），我们就可以通过索引 [0], [1] 来获取第几个参数的类型。

```js
function updateUser(id: string, newProfile: { name: string; age: number; email?: string }) {
  // ...
}

// 提取整个参数列表
type UpdateParams = Parameters<typeof updateUser>;

// 🎯 提取第一个参数的类型 (string)
type UserIdType = UpdateParams[0]; 

// 🎯 提取第二个参数的类型 ({ name: string; age: number; email?: string })
type UserProfileType = UpdateParams[1];

// 实际使用
const myProfile: UserProfileType = {
  name: "Bob",
  age: 30
};
```