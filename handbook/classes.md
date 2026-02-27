# 类

TypeScript 完全支持 ES2015 中引入的 class 关键字。

与其他 JavaScript 语言特性一样，TypeScript 添加了类型注解和其他语法，使你能够表达类与其他类型之间的关系。

# 类成员

这是一个最基本的类——一个空类：

```js
class Point {}
```

这个类目前还不太实用，所以我们开始添加一些成员吧。

## 字段

字段声明会在类上创建一个公共可写属性：

```js
class Point {
  x: number;
  y: number;
}
 
const pt = new Point();
pt.x = 0;
pt.y = 0;
```

与其他位置一样，类型注解是可选的，但如果未指定，则默认为 `any` 类型。

字段也可以有初始化器；这些初始化器会在类实例化时自动运行：

```js
class Point {
  x = 0;
  y = 0;
}
const pt = new Point();
// Prints 0, 0
console.log(`${pt.x}, ${pt.y}`);
```

与 const、let 和 var 一样，类属性的初始化器将用于推断其类型：

```js
const pt = new Point();
pt.x = "0";
// Type 'string' is not assignable to type 'number'.
```

**--strictPropertyInitialization**

`strictPropertyInitialization` 设置控制类字段是否需要在构造函数中初始化。

```js
class BadGreeter {
  name: string;
  // Property 'name' has no initializer and is not definitely assigned in the constructor.
}
```

```js
class GoodGreeter {
  name: string;

  constructor() {
    this.name = "hello";
  }
}
```

请注意，字段需要在构造函数中初始化。TypeScript 不会分析构造函数中调用的方法来检测初始化，因为派生类可能会重写这些方法，导致成员初始化失败。

如果您打算通过构造函数以外的方式（例如，外部库可能已经为您填充了类的一部分）来明确地初始化字段，则可以使用明确赋值断言运算符 `!`。

```js
class OKGreeter {
  // Not initialized, but no error
  name!: string;
}
```

### readonly

字段可以添加 readonly 修饰符作为前缀。这样可以防止在构造函数之外对字段进行赋值。

```js
class Greeter {
  readonly name: string = "world";
 
  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName;
    }
  }
 
  err() {
    this.name = "not ok";
    // Cannot assign to 'name' because it is a read-only property.
  }
}

const g = new Greeter();
g.name = "also not ok";
// Cannot assign to 'name' because it is a read-only property.
```

## 构造函数

类构造函数与函数非常相似。您可以添加带有类型注解、默认值和重载的参数：

```js
class Point {
  x: number;
  y: number;
 
  // Normal signature with defaults
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

```js
class Point {
  x: number = 0;
  y: number = 0;
 
  // Constructor overloads
  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: string | number, y: number = 0) {
    // Code logic here
  }
}
```

类构造函数签名和函数签名之间只有几点不同：
- 构造函数不能有类型参数 —— 类型参数应该放在外部类声明中，我们稍后会学习。
- 构造函数不能有返回类型注解 —— 返回值始终是类实例的类型。

### super 调用

就像在 JavaScript 中一样，如果你有一个基类，你需要在构造函数体中调用 super(); 才能使用任何 `this.members`：

```js
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    // Prints a wrong value in ES5; throws exception in ES6
    console.log(this.k);
    // 'super' must be called before accessing 'this' in the constructor of a derived class.
    super();
  }
}
```

在 JavaScript 中，忘记调用 super 是一个很容易犯的错误，但 TypeScript 会告诉你何时需要调用它。

## 方法

类上的函数属性称为方法。方法可以使用与函数和构造函数相同的类型注解：

```js
class Point {
  x = 10;
  y = 10;
 
  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

除了标准的类型注解之外，TypeScript 没有为方法添加任何其他新内容。

请注意，在方法体内部，仍然必须通过 `this` 来访问字段和其他方法。方法体中的非限定名称始终指向封闭作用域内的对象。

```js
let x: number = 0;
 
class C {
  x: string = "hello";
 
  m() {
    // This is trying to modify 'x' from line 1, not the class property
    x = "world";
    // Type 'string' is not assignable to type 'number'.
  }
}
```

### Getters / Setters

类也可以有访问器：

```js
class C {
  _length = 0;
  get length() {
    return this._length;
  }
  set length(value) {
    this._length = value;
  }
}
```

> 请注意，在 JavaScript 中，仅使用字段作为 get/set 操作对而不添加任何额外逻辑的情况非常少见。如果您不需要在 get/set 操作期间添加额外的逻辑，那么公开公共字段是可以的。

TypeScript 对访问器有一些特殊的类型推断规则：
- 如果存在 `get` 方法但没有 `set` 方法，则该属性自动设置为只读。
- 如果未指定 `setter` 参数的类型，则会根据 `getter` 的返回值类型进行推断。

自 TypeScript 4.3 起，允许使用类型不同的访问器进行 `get` 和 `set` 操作。

```js
class Thing {
  _size = 0;
 
  get size(): number {
    return this._size;
  }
 
  set size(value: string | number | boolean) {
    let num = Number(value);
 
    // Don't allow NaN, Infinity, etc
 
    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }
 
    this._size = num;
  }
}
```

## 索引签名

类可以声明索引签名；这些签名与其他对象类型的索引签名工作方式相同：

```js
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);
 
  check(s: string) {
    return this[s] as boolean;
  }
}
```

由于索引签名类型还需要捕获方法类型，因此很难有效地使用这些类型。通常，最好将索引数据存储在其他地方，而不是类实例本身。

# 继承

与其他具有面向对象特性的语言一样，JavaScript 中的类可以从基类继承。

## implements

您可以使用 `implements` 子句来检查类是否满足特定 `interface`。如果类未能正确实现该接口，则会发出错误：

```js
interface Pingable {
  ping(): void;
}
 
class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}
 
class Ball implements Pingable {
  // Class 'Ball' incorrectly implements interface 'Pingable'.
  // Property 'ping' is missing in type 'Ball' but required in type 'Pingable'.
  pong() {
    console.log("pong!");
  }
}
```

类也可以实现多个接口，例如 `class C implements A, B {`

**注意**

需要注意的是，`implements` 子句只是检查类是否可以被视为接口类型。它完全不会改变类的类型或其方法的类型。

一个常见的错误是假设 `implements` 子句会改变类的类型——事实并非如此！

```js
interface Checkable {
  check(name: string): boolean;
}
 
class NameChecker implements Checkable {
  check(s) {
    // Parameter 's' implicitly has an 'any' type.
    // Notice no error here
    return s.toLowerCase() === "ok";
  }
}
```

在这个例子中，我们或许会认为 `s` 的类型会受到 `check` 方法的字符串参数 `name: string` 的影响。
但事实并非如此——`implements` 子句并不会改变类体检查的方式或其类型的推断。

同样地，实现一个带有可选属性的接口并不会创建该属性：

```js
interface A {
  x: number;
  y?: number;
}
class C implements A {
  x = 0;
}
const c = new C();
c.y = 10;
// Property 'y' does not exist on type 'C'.
```

## extends

类可以从基类继承。派生类拥有基类的所有属性和方法，并且还可以定义额外的成员。

```js
class Animal {
  move() {
    console.log("Moving along!");
  }
}
 
class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}
 
const d = new Dog();
// Base class method
d.move();
// Derived class method
d.woof(3);
```

### 重写方法

派生类也可以重写基类的字段或属性。您可以使用 `super.` 语法访问基类的方法。请注意，由于 JavaScript 类是一个简单的查找对象，因此不存在“父类字段”的概念。

TypeScript 强制要求派生类始终是其基类的子类型。

例如，以下是重写方法的合法方法：

```js
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
 
class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}
 
const d = new Derived();
d.greet();
d.greet("reader");
```

派生类必须遵循其基类的约定，这一点非常重要。请记住，通过基类引用来引用派生类实例是非常常见（而且始终合法！）的：

```js
// Alias the derived instance through a base class reference
const b: Base = d;
// No problem
b.greet();
```

如果派生类不遵守基类规则会怎么样？

```js
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
 
class Derived extends Base {
  // Make this parameter required
  greet(name: string) {
  // Property 'greet' in type 'Derived' is not assignable to the same property in base type 'Base'.
  // Type '(name: string) => void' is not assignable to type '() => void'.
  // Target signature provides too few arguments. Expected 1 or more, but got 0.
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

如果我们不顾错误编译这段代码，那么这个示例程序就会崩溃：

```js
const b: Base = new Derived();
// Crashes because "name" will be undefined
b.greet();
```

### 字段类型声明

当 target >= ES2022 或 useDefineForClassFields 为 true 时，类字段会在父类构造函数完成后初始化，覆盖父类设置的任何值。

如果您只想为继承的字段重新声明一个更准确的类型，这可能会造成问题。

为了处理这种情况，您可以编写 declare 来告诉 TypeScript 此字段声明不应产生任何运行时影响。

```js
interface Animal {
  dateOfBirth: any;
}
 
interface Dog extends Animal {
  breed: any;
}
 
class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}
 
class DogHouse extends AnimalHouse {
  // Does not emit JavaScript code,
  // only ensures the types are correct
  declare resident: Dog;
  constructor(dog: Dog) {
    super(dog);
  }
}
```

### 初始化顺序

JavaScript 类初始化的顺序有时可能会让人感到意外。我们来看以下代码：

```js
class Base {
  name = "base";
  constructor() {
    console.log("My name is " + this.name);
  }
}
 
class Derived extends Base {
  name = "derived";
}
 
// Prints "base", not "derived"
const d = new Derived();
```

这里发生了什么？

根据 JavaScript 的定义，类初始化的顺序是：
1. 基类字段初始化
1. 基类构造函数执行
1. 派生类字段初始化
1. 派生类构造函数执行

这意味着，由于派生类字段的初始化尚未执行，基类构造函数在执行自身构造函数时看到的是自身的 name 值。

### 继承内置类型

> 注意：如果您不打算继承内置类型（例如 Array、Error、Map 等），或者您的编译目标已明确设置为 ES6/ES2015 或更高版本，则可以跳过此部分。

略...

# 成员可见性

您可以使用 TypeScript 来控制某些方法或属性是否对类外部的代码可见。

## public

类成员的默认可见性为公开。公开成员可以在任何地方访问：

```js
class Greeter {
  public greet() {
    console.log("hi!");
  }
}
const g = new Greeter();
g.greet();
```

因为 `public` 已经是默认的可见性修饰符，所以你永远不需要在类成员上写它，但出于风格/可读性的考虑，你可能会选择这样做。

## protected

`protected` 的成员仅对其声明的类的子类可见。

```js
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}
 
class SpecialGreeter extends Greeter {
  public howdy() {
    // OK to access protected member here
    console.log("Howdy, " + this.getName());
  }
}
const g = new SpecialGreeter();
g.greet(); // OK
g.getName();
// Property 'getName' is protected and only accessible within class 'Greeter' and its subclasses.
```

### protected 暴露

派生类需要遵循其基类的契约，但可以选择公开具有更多功能的基类子类型。这包括将 `protected` 成员设为 `public` 成员：

```js
class Base {
  protected m = 10;
}
class Derived extends Base {
  // No modifier, so default is 'public'
  m = 15;
}
const d = new Derived();
console.log(d.m); // OK
```

请注意，派生类原本就可以自由读写 m，因此这并不会实质性地改变这种情况的“安全性”。
这里需要注意的是，在派生类中，如果这种暴露并非有意为之，我们需要谨慎地重复使用 `protected` 修饰符。

### 跨层级 protected

TypeScript 不允许访问类层次结构中同级类的受保护成员：

```js
class Base {
  protected x: number = 1;
}
class Derived1 extends Base {
  protected x: number = 5;
}
class Derived2 extends Base {
  f1(other: Derived2) {
    other.x = 10;
  }
  f2(other: Derived1) {
    other.x = 10;
    // Property 'x' is protected and only accessible within class 'Derived1' and its subclasses.
  }
}
```

这是因为只有从 Derived2 的子类访问 x 才是合法的，而 Derived1 并非子类。
此外，如果通过 Derived1 的引用访问 x 是非法的（这当然是应该的！），那么通过基类的引用访问 x 也绝不会改善这种情况。

## private

`private` 类似于 `protected`，但即使是子类也不允许访问成员：

```js
class Base {
  private x = 0;
}
const b = new Base();
// Can't access from outside the class
console.log(b.x);
// Property 'x' is private and only accessible within class 'Base'.
```

```js
class Derived extends Base {
  showX() {
    // Can't access in subclasses
    console.log(this.x);
    // Property 'x' is private and only accessible within class 'Base'.
  }
}
```

由于 `private` 成员对派生类不可见，因此派生类无法提高其可见性：

```js
class Base {
  private x = 0;
}
class Derived extends Base {
  x = 1;
  // Class 'Derived' incorrectly extends base class 'Base'.
  // Property 'x' is private in type 'Base' but not in type 'Derived'
}
```

### 跨实例访问

不同的面向对象编程语言对于同一类的不同实例是否可以访问彼此的私有成员存在分歧。Java、C#、C++、Swift 和 PHP 等语言允许这样做，而 Ruby 则不允许。

TypeScript 允许跨实例访问私有成员：

```js
class A {
  private x = 10;
 
  public sameAs(other: A) {
    // No error
    return other.x === this.x;
  }
}
```

**注意事项**

与 TypeScript 类型系统的其他方面一样，私有 (private) 和受保护 (protected) 属性仅在类型检查期间强制执行。

这意味着 JavaScript 运行时构造（例如 `in` 或简单的属性查找）仍然可以访问私有或受保护的成员：

```js
class MySafe {
  private secretKey = 12345;
}
// In a JavaScript file...
const s = new MySafe();
// Will print 12345
console.log(s.secretKey);
```

private 还允许在类型检查期间使用方括号表示法访问。
这使得声明为 private 的字段在单元测试等场景下更容易访问，但缺点是这些字段属于软私有，并不严格强制执行隐私保护。

```js
class MySafe {
  private secretKey = 12345;
}

const s = new MySafe();
 
// Not allowed during type checking
console.log(s.secretKey);
// Property 'secretKey' is private and only accessible within class 'MySafe'.

// OK
console.log(s["secretKey"]);
```

与 TypeScript 的私有字段不同，JavaScript 的私有字段 (#) 在编译后仍然是私有的，并且不提供前面提到的括号表示法访问等逃生通道，因此它们是硬私有的。

```js
class Dog {
  #barkAmount = 0;
  personality = "happy";
 
  constructor() {}
}
```

```js
"use strict";
class Dog {
    #barkAmount = 0;
    personality = "happy";
    constructor() { }
}
```

当编译为 ES2021 或更低版本时，TypeScript 将使用 Wea​​kMaps 代替 #。

```js
"use strict";
var _Dog_barkAmount;
class Dog {
    constructor() {
        _Dog_barkAmount.set(this, 0);
        this.personality = "happy";
    }
}
_Dog_barkAmount = new WeakMap();
```

如果您需要保护类中的值免受恶意攻击，则应使用提供严格运行时隐私的机制，例如闭包、WeakMap 或私有字段。请注意，这些在运行时添加的隐私检查可能会影响性能。

## static

类可以包含静态成员。这些成员不与类的特定实例关联。它们可以通过类构造函数对象本身访问：

```js
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}
console.log(MyClass.x);
MyClass.printX();
```

静态成员也可以使用相同的公开、受保护和私有可见性修饰符：

```js
class MyClass {
  private static x = 0;
}
console.log(MyClass.x);
// Property 'x' is private and only accessible within class 'MyClass'.
```

静态成员也会被继承

```js
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
```

### 特殊静态名

通常情况下，覆盖函数原型中的属性是不安全/不可能的。因为类本身就是函数，可以用 `new` 调用，所以某些静态名称不能使用。

像 `name`、`length` 和 `call` 这样的函数属性不能定义为静态成员：

```js
class S {
  static name = "S!";
  // Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'S'.
}
```

### 为什么没有静态类

TypeScript（以及 JavaScript）不像 C# 那样有静态类这种结构。

这些结构之所以存在，是因为这些语言强制所有数据和函数都必须放在类中；而 TypeScript 没有这种限制，所以也就不需要它们了。在 JavaScript/TypeScript 中，一个只有单个实例的类通常就用一个普通对象来表示。

例如，在 TypeScript 中我们不需要“静态类”语法，因为一个普通对象（甚至一个顶层函数）就能达到同样的效果：

```js
// Unnecessary "static" class
class MyStaticClass {
  static doSomething() {}
}
 
// Preferred (alternative 1)
function doSomething() {}
 
// Preferred (alternative 2)
const MyHelperObject = {
  dosomething() {},
};
```

### 静态代码块

静态代码块允许你编写一系列具有独立作用域的语句，这些语句可以访问包含类中的私有字段。
这意味着我们可以编写初始化代码，并具备编写语句的所有功能，避免变量泄漏，并完全访问类的内部结构。

```js
class Foo {
    static #count = 0;
 
    get count() {
        return Foo.#count;
    }
 
    static {
        try {
            const lastInstances = loadLastInstances();
            Foo.#count += lastInstances.length;
        }
        catch {}
    }
}
```

# 泛性类

与接口类似，类也可以是泛型的。当使用 `new` 实例化一个泛型类时，其类型参数的推断方式与函数调用中的推断方式相同：

```js
class Box<Type> {
  contents: Type;
  constructor(value: Type) {
    this.contents = value;
  }
}
 
const b = new Box("hello!");
// const b: Box<string>
```

类可以像接口一样使用泛型约束和默认值。

静态成员中的类型参数, 这段代码不合法​​，原因可能并不明显：

```js
class Box<Type> {
  static defaultValue: Type;
  // Static members cannot reference class type parameters.
}
```

请记住，类型信息始终会被完全擦除！运行时，Box.defaultValue 属性槽只有一个。
这意味着，如果可以设置 Box<string>.defaultValue，也会同时更改 Box<number>.defaultValue——这可不好。

> 泛型类的静态成员永远不能引用该类的类型参数。

# 运行时 this

需要注意的是，TypeScript 并不会改变 JavaScript 的运行时行为，而 JavaScript 本身就因其一些独特的运行时行为而闻名。

JavaScript 对 `this` 的处理方式确实不同寻常：

```js
class MyClass {
  name = "MyClass";
  getName() {
    return this.name;
  }
}
const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};
 
// Prints "obj", not "MyClass"
console.log(obj.getName());
```

简而言之，默认情况下，函数内部 `this` 的值取决于函数的调用方式。在本例中，由于函数是通过 `obj` 引用调用的，因此 `this` 的值是 `obj` 而不是类实例。

这通常不是我们希望看到的！TypeScript 提供了一些方法来缓解或避免此类错误。

## 箭头函数

如果你有一个函数经常被以一种会丢失其当前上下文的方式调用，那么使用箭头函数属性而不是方法定义就更有意义了：

```js
class MyClass {
  name = "MyClass";
  getName = () => {
    return this.name;
  };
}
const c = new MyClass();
const g = c.getName;
// Prints "MyClass" instead of crashing
console.log(g());
```

这样做有一些权衡：
- 即使对于未经 TypeScript 检查的代码，此值在运行时也保证正确。
- 这将占用更多内存，因为每个类实例都会拥有每个以这种方式定义的函数的副本。
- 您不能在派生类中使用 `super.getName`，因为原型链中没有可以获取基类方法的入口点。

## this 参数

在方法或函数定义中，名为 this 的初始参数在 TypeScript 中具有特殊含义。这些参数在编译期间会被清除：

```js
// TypeScript input with 'this' parameter
function fn(this: SomeType, x: number) {
  /* ... */
}

// JavaScript output
function fn(x) {
  /* ... */
}
```

TypeScript 会检查使用 this 参数调用函数时是否使用了正确的上下文。
除了使用箭头函数之外，我们还可以将 this 参数添加到方法定义中，以静态方式强制方法被正确调用：

```js
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
// OK
c.getName();
 
// Error, would crash
const g = c.getName;
console.log(g());
// The 'this' context of type 'void' is not assignable to method's 'this' of type 'MyClass'.
```

这种方法与箭头函数方法的优缺点截然相反：
- JavaScript 调用者可能仍然会在不知情的情况下错误地使用类方法。
- 每个类定义只分配一个函数，而不是每个类实例分配一个。
- 基类方法定义仍然可以通过 super 调用。

# this 类型

在类中，有一种名为 this 的特殊类型，它会动态地引用当前类的类型。让我们看看它有什么用：

```js
class Box {
  contents: string = "";
  set(value: string) {
  // (method) Box.set(value: string): this
    this.contents = value;
    return this;
  }
}
```

这里，TypeScript 推断 set 的返回类型为 this，而不是 Box。现在让我们创建一个 Box 的子类：

```js
class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}
 
const a = new ClearableBox();
const b = a.set("hello");
// const b: ClearableBox
```

您也可以在参数类型注解中使用 `this`：

```js
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
```

这与编写其他代码不同：Box — 如果您有一个派生类，其 sameAs 方法现在将只接受该派生类的其他实例：

```js
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
 
class DerivedBox extends Box {
  otherContent: string = "?";
}
 
const base = new Box();
const derived = new DerivedBox();
derived.sameAs(base);
// Argument of type 'Box' is not assignable to parameter of type 'DerivedBox'.
// Property 'otherContent' is missing in type 'Box' but required in type 'DerivedBox'.
```

你可以将 `this` 用作类和接口方法的返回值。当与类型缩小（例如 if 语句）结合使用时，目标对象的类型将被缩小为指定的类型。

```js
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}
 
class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}
 
class Directory extends FileSystemObject {
  children: FileSystemObject[];
}
 
interface Networked {
  host: string;
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content; // const fso: FileRep
} else if (fso.isDirectory()) {
  fso.children; // const fso: Directory
} else if (fso.isNetworked()) {
  fso.host; // const fso: Networked & FileSystemObject
}
```

基于 `this` 的类型守卫的一个常见用例是允许对特定字段进行延迟验证。
例如，以下示例会在验证 hasValue 为 true 后，从 box 中保存的值中移除 undefined：

```js
class Box<T> {
  value?: T;
 
  hasValue(): this is { value: T } {
    return this.value !== undefined;
  }
}
 
const box = new Box<string>();
box.value = "Gameboy";
 
box.value; // (property) Box<string>.value?: string
 
if (box.hasValue()) {
  box.value; // (property) value: string
}
```

# 参数属性

TypeScript 提供了一种特殊的语法，可以将构造函数参数转换为同名同值的类属性。
这些属性称为参数属性，创建方法是在构造函数参数前加上 `public`、`private`、`protected` 或 `readonly` 等可见性修饰符。
生成的字段会获得这些修饰符：

```js
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // No body necessary
  }
}
const a = new Params(1, 2, 3);
console.log(a.x); // (property) Params.x: number
console.log(a.z);
// Property 'z' is private and only accessible within class 'Params'.
```

# 类表达式

类表达式与类声明非常相似。唯一的真正区别在于，类表达式不需要名称，但我们可以通过它们最终绑定的任何标识符来引用它们：

```js
const someClass = class<Type> {
  content: Type;
  constructor(value: Type) {
    this.content = value;
  }
};
 
const m = new someClass("Hello, world");
// const m: someClass<string>
```

# 构造函数签名

JavaScript 类使用 `new` 运算符进行实例化。给定类本身的类型，`InstanceType` 工具类型对这种操作进行建模。

```js
class Point {
  createdAt: number;
  x: number;
  y: number
  constructor(x: number, y: number) {
    this.createdAt = Date.now()
    this.x = x;
    this.y = y;
  }
}
type PointInstance = InstanceType<typeof Point>
 
function moveRight(point: PointInstance) {
  point.x += 5;
}
 
const point = new Point(3, 4);
moveRight(point);
point.x; // => 8
```

# 抽象类

在 TypeScript 中，类、方法和字段可以是抽象的。

抽象方法或抽象字段是指尚未提供实现的成员。这些成员必须存在于抽象类中，而抽象类不能被直接实例化。

抽象类的作用是作为子类的基类，子类需要实现所有抽象成员。当一个类没有任何抽象成员时，它被称为具体类。

让我们来看一个例子：

```js
abstract class Base {
  abstract getName(): string;
 
  printName() {
    console.log("Hello, " + this.getName());
  }
}
 
const b = new Base();
// Cannot create an instance of an abstract class.
```

我们不能用 new 来实例化 Base，因为它是一个抽象类。相反，我们需要创建一个派生类并实现抽象成员：

```js
class Derived extends Base {
  getName() {
    return "world";
  }
}
 
const d = new Derived();
d.printName();
```

请注意，如果我们忘记实现基类的抽象成员，就会出现错误：

```js
class Derived extends Base {
  // Non-abstract class 'Derived' does not implement inherited abstract member getName from class 'Base'.
  // forgot to do anything
}
```

## 构造函数

有时，您需要接受一个类构造函数，该函数会生成一个继承自某个抽象类的类的实例。

例如，您可能需要编写以下代码：

```js
function greet(ctor: typeof Base) {
  const instance = new ctor();
  // Cannot create an instance of an abstract class.
  instance.printName();
}
```

TypeScript 正确地提示你正在尝试实例化一个抽象类。毕竟，根据 greet 的定义，编写这段代码是完全合法的，它最终会创建一个抽象类：

```js
// Bad!
greet(Base);
```

相反，你需要编写一个接受具有特定构造签名的参数的函数：

```js
function greet(ctor: new () => Base) {
  const instance = new ctor();
  instance.printName();
}
greet(Derived);
greet(Base);
// Argument of type 'typeof Base' is not assignable to parameter of type 'new () => Base'.
//  Cannot assign an abstract constructor type to a non-abstract constructor type.
```

现在 TypeScript 可以正确地告诉你哪些类构造函数可以被调用——派生类可以，因为它是具体的，但基类不能。

# 类间关系

大多数情况下，TypeScript 中的类是按结构进行比较的，与其他类型一样。

例如，以下两个类可以互相替代使用，因为它们完全相同：

```js
class Point1 {
  x = 0;
  y = 0;
}
 
class Point2 {
  x = 0;
  y = 0;
}
 
// OK
const p: Point1 = new Point2();
```

同样，即使没有显式的继承关系，类之间也存在子类型关系：

```js
class Person {
  name: string;
  age: number;
}
 
class Employee {
  name: string;
  age: number;
  salary: number;
}
 
// OK
const p: Person = new Employee();
```

这听起来很简单，但有些情况却比其他情况更奇怪。

空类没有任何成员。在结构化类型系统中，没有成员的类型通常是其他任何类型的超类型。因此，如果你写了一个空类（千万别这么做！），任何类型都可以代替它：

```js
class Empty {}
 
function fn(x: Empty) {
  // can't do anything with 'x', so I won't
}
 
// All OK!
fn(window);
fn({});
fn(fn);
```