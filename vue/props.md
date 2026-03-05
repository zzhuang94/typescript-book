# Props 基础

在 Vue 的 `<script setup>` 里，可以用两种方式声明 props：

1. **运行时声明**：`defineProps({ name: String, count: Number })`，适合不用 TypeScript 或只做简单校验的场景。
2. **类型声明**：`defineProps<{ name: string; count?: number }>()` 或先定义 `interface Props` 再 `defineProps<Props>()`，由 TypeScript 做类型检查，**无运行时 props 校验**（需配合 Vue 的校验选项或运行时逻辑）。

本文档采用 **interface + 类型声明** 的写法，便于在类型层面约束 props、获得更好的 IDE 提示和类型收窄。

# 用 interface 定义 Props

## 必填且无默认值

当所有字段都是必填，或接受“不传就是 undefined”时，可以直接用 `defineProps<Props>()`：

```vue
<!-- sub-name.vue 示例 -->
<script setup lang="ts">
interface Props {
  name: string
}

defineProps<Props>()
</script>
```

- `name` 为必填，调用方必须传 `<SubName :name="xxx" />`。
- 不传时 TypeScript 会报错，运行时 `name` 为 `undefined`（若未做默认值处理）。

## 可选字段

在 interface 里用 `?` 表示“可不传”：

```js
interface Props {
  title: string           // 必填
  name?: string           // 可选
  age?: number
  items?: string[]
  isLoading?: boolean
}
```

- 带 `?` 的字段在类型上为 `T | undefined`。
- 父组件不传时，在子组件里拿到的是 `undefined`，需要自己处理默认逻辑，或配合下面的 `withDefaults` 使用。

# 默认值：withDefaults 

Vue 的 `defineProps<T>()` 只做类型声明，不会自动给默认值。

要给默认值，必须用 `withDefaults(defineProps<Props>(), { ... })`，示例：

```js
interface Props {
  title: string
  name?: string
  age?: number
  items?: string[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  name: 'default name',
  age: 18,
  items: () => [],
  isLoading: false,
})
```

- `title` 无默认值，仍是必填。
- `name`、`age`、`items`、`isLoading` 在父组件未传时，会使用右侧的默认值。

## 类型收窄

- 在 interface 里写了 `name?: string` 时，TypeScript 推断出的类型是 `string | undefined`
- 一旦在 `withDefaults` 里为该字段提供了默认值，Vue 的类型声明会认为： 这个 prop 在运行时一定会有值
- 要么来自父组件，要么来自默认值，因此 类型会从 `string | undefined` 收窄为 `string`。  
- **这样在脚本和模板里使用时，不需要再处理 `undefined`，类型更安全、写法更简洁。**

# 工厂函数

> **引用类型**：默认值要用工厂函数，返回新的数组/对象

- 数组： 空数组 `items: () => []`
- 对象： 空对象 `config: () => ({})`

## 数组

若直接写成 `items: []`, `[]` 在模块加载时只会创建一次，所有组件实例都会共享**同一个数组引用**：

```js
withDefaults(defineProps<Props>(), {
  items: () => [],  // 每个组件实例都会执行一次 () => []，得到新数组
})
```

- `() => []` 会在**每个组件实例**初始化时各执行一次，每个实例得到**新的空数组**。
- 各实例的 `items` 互不影响，符合“默认值”的语义。

## 对象

若直接写成 `config: {}`，`{}` 在模块加载时只会创建一次，所有组件实例会共享**同一个对象引用**：

```js
withDefaults(defineProps<Props>(), {
  config: () => ({}),
})
```

### 空对象

```js
interface Props {
  title: string
  config?: { theme: string; size: number }
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
})
```

- 此时 `config` 的默认值是空对象 `{}`。
- 若 interface 里 `config` 的类型要求必有 `theme`、`size`，则空对象在类型上可能不满足
- 若希望默认就是“有结构”的对象，可以直接在工厂函数里写全属性。

#### 带属性的默认对象

```js
interface Props {
  title: string
  config?: { theme: string; size: number }
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({ theme: 'light', size: 12 }),
})
```

**多字段、嵌套一层：**

```js
interface Props {
  options?: {
    theme: 'light' | 'dark'
    layout: { columns: number; gap: number }
  }
}

withDefaults(defineProps<Props>(), {
  options: () => ({
    theme: 'light',
    layout: { columns: 2, gap: 8 },
  }),
})
```

每个实例都会得到新的 `{ theme, layout }`，且 `layout` 也是新对象，不会跨实例共享。

**显式标注返回类型**

有时你希望默认值 **严格符合** interface, 可以用 **显式返回类型** 的工厂函数：

```js
interface Props {
  config?: { theme: string; size: number }
}

withDefaults(defineProps<Props>(), {
  config: (): NonNullable<Props['config']> => ({
    theme: 'light',
    size: 12,
  }),
})
// 若写成 size: '12'（字符串），TS 会报错
```

或使用 `Props['config']`（若确定有默认值时该字段在类型上会被收窄，用 `NonNullable` 更准确表示“默认值不为 undefined”）：

```js
config: (): Props['config'] => ({ theme: 'light', size: 12 }),
```

这样既保证“每个实例一份新对象”，又保证默认值类型正确。

**用常量或函数生成默认对象**

默认值可以来自常量或函数，只要 **返回的是新对象** 即可：

```js
const DEFAULT_CONFIG = { theme: 'light' as const, size: 12 }

withDefaults(defineProps<Props>(), {
  config: () => ({ ...DEFAULT_CONFIG }),
})
```

或：

```js
function createDefaultConfig() {
  return { theme: 'light', size: 12 }
}

withDefaults(defineProps<Props>(), {
  config: () => createDefaultConfig(),
})
```

注意：这里用的是 `() => createDefaultConfig()`，每次调用都会得到新对象。若写成 `config: createDefaultConfig()`，则只会在定义时执行一次，所有实例共享同一引用，不符合预期。


# 对照表速查

| 需求               | 写法 |
|--------------------|------|
| 必填、无默认值     | interface 中不加 `?`，不放在 withDefaults 里 |
| 可选、无默认值     | interface 中加 `?`，不放在 withDefaults 里（类型为 `T \| undefined`） |
| 可选、有默认值     | interface 中加 `?`，在 withDefaults 里写默认值（类型收窄为 `T`） |
| 值类型默认值       | 直接写 `key: value`，如 `age: 18` |
| 数组默认值         | `key: () => []` 或 `key: () => ['a','b']` |
| 对象默认值         | `key: () => ({})` 或 `key: () => ({ a: 1 })` |
| 避免共享引用       | 所有数组、对象默认值都用工厂函数 `() => value` |

# 默认值：解构赋值

示例：

```js
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
```

- **本质：** 这是 JavaScript 的解构赋值语法，在解构 props 对象时，如果对应属性为 undefined，则使用提供的默认值。
- **特点：**
  - `响应性丢失`：解构出的 msg 和 labels 是普通变量，不再是响应式数据。当父组件传入新的 prop 值时，这些变量不会自动更新，导致模板或逻辑中使用的数据过时。
  - `默认值创建时机`：每次组件实例化时，都会执行解构赋值并创建新的数组/对象字面量（['one', 'two']），因此每个实例拥有独立的数组副本，不会出现意外共享。
  - `类型推导`：TypeScript 能正确推断解构后变量的类型（如 string 和 string[]），但原始的 props 对象类型仍然是 Props，不包含默认值的信息。如果需要完整的 props 类型（含默认值），需额外定义。
  - `适用场景`：仅当明确不需要响应式更新（例如只在 setup 初始化时使用一次），或者配合 toRefs 恢复响应性时使用。直接解构并用于模板是不安全的。

!> 强烈推荐使用第一种 `withDefaults` 写法，它不仅保持了 props 的响应性，还通过规范化的默认值处理（尤其是对象/数组）和增强的类型推导，使代码更健壮、更可维护。解构赋值的写法虽简洁，但因其破坏响应性，应谨慎使用，仅限于明确不需要响应式更新的场景