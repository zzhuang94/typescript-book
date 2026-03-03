# 迭代器和生成器

# 可迭代对象

如果一个对象实现了 `Symbol.iterator` 属性，则该对象被视为可迭代对象。
一些内置类型，例如 `Array`、`Map`、`Set`、`String`、`Int32Array`、`Uint32Array` 等，都已实现了 `Symbol.iterator` 属性。
对象的 `Symbol.iterator` 函数负责返回要迭代的值列表。

## 可迭代接口

接口
如果我们想要接收上面列出的可迭代类型，可以使用 `Iterable` 类型。以下是一个示例：

```js
function toArray<X>(xs: Iterable<X>): X[] {
  return [...xs]
}
```

## for..of 语句

`for...of` 循环遍历一个可迭代对象，并调用该对象的 `Symbol.iterator` 属性。以下是一个简单的数组 `for...of` 循环示例：

```js
let someArray = [1, "string", false];
for (let entry of someArray) {
  console.log(entry); // 1, "string", false
}
```

## for..of vs. for..in

`for..of` 和 `for..in` 语句都遍历列表；但它们遍历的对象不同。`for..in` 返回被遍历对象的键的列表，而 `for..of` 返回被遍历对象的数值属性的值的列表。

以下示例演示了这种区别：

```js
let list = [4, 5, 6];
for (let i in list) {
  console.log(i); // "0", "1", "2",
}
for (let i of list) {
  console.log(i); // 4, 5, 6
}
```

另一个区别在于，`for..in` 可以操作任何对象；它用于检查该对象的属性。
而 `for..of` 则主要关注可迭代对象的值。像 `Map` 和 `Set` 这样的内置对象实现了 `Symbol.iterator` 属性，允许访问存储的值。

```js
let pets = new Set(["Cat", "Dog", "Hamster"]);
pets["species"] = "mammals";
for (let pet in pets) {
  console.log(pet); // "species"
}
for (let pet of pets) {
  console.log(pet); // "Cat", "Dog", "Hamster"
}
```

# 代码生成

## 面向 ES5

当目标引擎支持 ES5 时，迭代器仅允许用于数组类型的值。即使非数组值实现了 `Symbol.iterator` 属性，对非数组值使用 `for...of` 循环也是错误的。

编译器会将 `for...of` 循环转换为简单的 for 循环，例如：

```js
let numbers = [1, 2, 3];
for (let num of numbers) {
  console.log(num);
}
```

将被生成为：

```js
var numbers = [1, 2, 3];
for (var _i = 0; _i < numbers.length; _i++) {
  var num = numbers[_i];
  console.log(num);
}
```

## 目标版本为 ECMAScript 2015 及更高版本

当目标引擎符合 ECMAScript 2015 标准时，编译器将生成 for..of 循环，以匹配引擎中内置的迭代器实现。