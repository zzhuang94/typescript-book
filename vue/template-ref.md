% 模板 ref 与组件实例类型

# DOM 模板 ref

在 `<script setup lang="ts">` 中使用模板 ref，配合 TypeScript 后可以更精确地限制 DOM 类型。

最常见的方式是为 `ref` 显式指定类型，并考虑初始值为 `null` 的情况：

```vue
<!-- focus-input.vue -->
<template>
  <input ref="inputRef" />
  <button @click="focus">聚焦</button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)

function focus() {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

onMounted(() => {
  // 这里 TypeScript 知道 inputRef.value 是 HTMLInputElement | null
})
</script>
```

要点：

- 模板里写 `ref="inputRef"`，脚本里用 `const inputRef = ref<HTMLElement | null>(null)` 来声明。
- 类型中包含 `null`，是因为在组件挂载之前，`inputRef.value` 为 `null`。
- 访问 DOM API 前加一次空值判断，可以避免运行时报错。

与 JavaScript 相比：

- JS 中 `inputRef.value` 默认为 `any`，容易把 `focus()` 写在未挂载阶段或写错属性名而不自知。
- TS 中强制你处理 `null`，让“什么时候可以访问 DOM”这件事变得明确。

# 常见 DOM 元素类型

可以根据实际元素使用更具体的 DOM 类型：

```js
const divRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
```

好处：

- IDE 能为 `inputRef.value` 提示 `.value`、`.focus()` 等专有 API。
- 在 canvas 等复杂元素上，能享受更准确的 API 自动完成。

# 组件实例 ref

除了 DOM 以外，更常用的是**获取子组件实例**，以调用其对外暴露的方法。

在 `<script setup>` 中，推荐配合 `defineExpose` 一起使用，让子组件只暴露需要的 API。

## 子组件：使用 defineExpose 暴露方法

```vue
<!-- child-counter.vue -->
<template>
  <div>当前计数：{{ count }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

function reset() {
  count.value = 0
}

defineExpose({
  increment,
  reset,
})
</script>
```

## 父组件：获取组件实例并调用方法

```vue
<!-- parent.vue -->
<template>
  <ChildCounter ref="counterRef" />
  <button @click="add">+1</button>
  <button @click="reset">清零</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChildCounter from './child-counter.vue'

// 关键：使用 InstanceType<typeof 子组件> 作为 ref 类型
const counterRef = ref<InstanceType<typeof ChildCounter> | null>(null)

function add() {
  counterRef.value?.increment()
}

function reset() {
  counterRef.value?.reset()
}
</script>
```

要点：

- `InstanceType<typeof ChildCounter>` 表示“`ChildCounter` 组件实例的类型”。
- 由于子组件用了 `defineExpose({ increment, reset })`，因此在父组件里：
  - `counterRef.value?.increment` 和 `counterRef.value?.reset` 都会被正确提示。
  - 若尝试访问 `counterRef.value?.count`（未暴露的内部状态），TypeScript 会报错。

与 JavaScript 相比：

- JS 中 `counterRef.value` 是 `any`，可以随便访问任何属性，重构时极其脆弱。
- TS 中强制你只访问 `defineExpose` 暴露出的 API，有利于维护组件边界。

# 使用类型别名简化组件实例类型

在某些团队代码风格中，会把实例类型抽成一个类型别名以便复用：

```js
// child-counter.vue 内部
export type ChildCounterInstance = {
  increment: () => void
  reset: () => void
}

defineExpose<ChildCounterInstance>({
  increment,
  reset,
})
```

然后在父组件中：

```js
import type { ChildCounterInstance } from './child-counter.vue'

const counterRef = ref<ChildCounterInstance | null>(null)
```

适用于：

- `child-counter.vue` 会被多个父组件引用。
- 希望在不直接依赖组件实现细节的情况下，单独复用“实例 API 类型”。

# 避免 any：明确 ref 的类型

在 TS 中如果不为 `ref` 指定类型，大多情况下会被推断为 `Ref<HTMLElement | null>` 或 `Ref<unknown>`，或者因为初始值为 `null` 而变成 `Ref<null>`：

```js
const el = ref(null) // 类型为 Ref<null>，无法直接调用 DOM API
```

推荐的做法是：

- 对 DOM：总是显式写成 `ref<HTMLElement | null>(null)` 或更具体的元素类型。
- 对组件实例：使用 `ref<InstanceType<typeof Child> | null>(null)` 或显式的实例类型。

这样可以避免：

- 在调用 `el.value.focus()` 之类的方法时，需要额外写类型断言。
- 某些场景下类型被默认为 `any` / `unknown`，导致提示缺失。

# 小结

- **DOM ref**：用 `ref<具体元素类型 | null>(null)` 声明，访问前处理 `null`，避免运行时错误。
- **组件 ref**：配合 `defineExpose` 暴露必要 API，父组件使用 `ref<InstanceType<typeof Child> | null>` 获取实例方法的类型提示。
- 相比 JavaScript，TypeScript 能在“访问不存在的属性”“在未挂载前操作 DOM”这类问题上提前给出警告，使跨组件调用更安全、更可维护。

