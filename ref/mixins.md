# Mixins

除了传统的面向对象层级结构之外，另一种从可重用组件构建类的常用方法是通过组合更简单的分部类来实现。
你可能熟悉 Scala 等语言中的 mixin 或 traits 的概念，这种模式在 JavaScript 社区也颇受欢迎。

# 

这种模式依赖于使用泛型和类继承来扩展基类。TypeScript 对 mixin 的最佳支持是通过类表达式模式实现的。您可以点击此处阅读更多关于 JavaScript 中这种模式的工作原理。

首先需要一个类：

```js
class Sprite {
  name = "";
  x = 0;
  y = 0;
 
  constructor(name: string) {
    this.name = name;
  }
}
```

然后需要一个类型和一个工厂函数，该函数返回一个扩展基类的类表达式。

```js
// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.
 
type Constructor = new (...args: any[]) => {};
 
// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:
 
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixins may not declare private/protected properties
    // however, you can use ES2020 private fields
    _scale = 1;
 
    setScale(scale: number) {
      this._scale = scale;
    }
 
    get scale(): number {
      return this._scale;
    }
  };
}
```

完成这些设置后，就可以创建一个类来表示应用了 mixin 的基类：

```js
// Compose a new class from the Sprite class,
// with the Mixin Scale applier:
const EightBitSprite = Scale(Sprite);
 
const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);
```

略...