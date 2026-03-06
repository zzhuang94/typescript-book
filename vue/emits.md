# defineEmits 基础

在 Vue 的 `<script setup lang="ts">` 里，事件推荐使用 **类型声明** 的方式来获得完整的 IDE 提示和编译期检查。

常见有两种写法：

1. **函数重载形式**：用多个函数签名描述不同事件的名称和参数。
2. **对象映射形式**：用一个对象类型，键是事件名，值是形参类型列表的元组。

本文只讨论 **TypeScript 写法**，不再介绍运行时 `emits: ['xxx']` 之类的配置。

# 函数重载形式

## 单一事件

最简单的场景：组件只对外发出一个事件：

```vue
<!-- confirm-button.vue -->
<template>
  <button @click="handleClick">
    提交
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'confirm'): void
}>()

function handleClick() {
  emit('confirm')
}
</script>
```

- `defineEmits<{ (e: 'confirm'): void }>` 里写的是一个 **带重载签名的对象类型**。
- `emit('confirm')` 时，如果多传或少传参数，TypeScript 都会报错。
- 在模板中使用 `<ConfirmButton @confirm="onConfirm" />` 时，事件名也会有智能提示。

## 带参数的事件

事件通常会携带一个 payload，例如表单的内容、当前行数据等：

```vue
<!-- user-item.vue -->
<template>
  <div class="user-item">
    <span>{{ name }}</span>
    <button @click="handleEdit">编辑</button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: number
  name: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}>()

function handleEdit() {
  emit('edit', id)   // OK，id 是 number
  // emit('edit')    // ❌ TS 报错：缺少参数
  // emit('edit', '1') // ❌ TS 报错：string 不能赋给 number
}
</script>
```

- 事件名 `'edit'`、`'delete'` 都是 **字面量字符串**，写错时会立即报错。
- 每个事件的参数都可以独立声明类型，调用时会有完整的签名提示。
- 使用 JavaScript 时，这里所有参数都是 `any`，IDE 无法帮你发现写错字段名或类型的问题。

## 多个事件重载

当一个组件对外暴露多个不同事件时，推荐写成多个重载签名：

```js
const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
  (e: 'submit', form: { name: string; age: number }): void
}>()
```

- 这样 `emit('submit', { ... })` 时，IDE 会自动提示 `form` 的结构。
- 若把 `age` 写成字符串 `"18"`，TypeScript 会在编译期报错，避免线上才发现接口类型不匹配。

# 对象映射形式

同样的效果可以用对象映射来写：

```js
const emit = defineEmits<{
  open: []
  close: []
  submit: [{ name: string; age: number }]
}>()
```

- 键名是事件名，值是一个元组类型，表示参数列表。
  - `open: []` 表示没有参数。
  - `submit: [{ ... }]` 表示有一个对象参数。
- 调用方式与前面完全一致：`emit('submit', { name: 'Foo', age: 18 })`。

选择哪种写法主要看个人和团队习惯：

- **函数重载形式** 更接近 `emit('xxx',...)` 的调用形态，可读性好。
- **对象映射形式** 在需要对事件做进一步类型运算（例如提取所有事件名）时更方便。

# 与 v-model 配合使用

`v-model` 在自定义组件里，本质上也是一个“值 + 事件”的组合：

- 值：`modelValue`（或其它 prop 名）
- 事件：`update:modelValue`（或 `update:xxx`）

使用 TypeScript 时，可以通过 `defineProps` + `defineEmits` 精确约束这对“值 + 事件”的类型。

## 单个 v-model

```vue
<!-- input-text.vue -->
<template>
  <input
    :value="modelValue"
    @input="onInput"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
```

父组件使用：

```vue
<InputText v-model="username" />
```

- 当你在 `emit('update:modelValue', ...)` 里传入非 string 类型时，立刻会有编译错误。
- 与 JavaScript 相比，不再需要依赖文档约定“记得传 string”，TypeScript 会帮你兜底。

## 多个 v-model（v-model:xxx）

一个组件可以同时支持多个 v-model，例如：

```vue
<FilterPanel
  v-model:keyword="keyword"
  v-model:activeTags="activeTags"
/>
```

在子组件里可以这样写：

```vue
<!-- filter-panel.vue -->
<script setup lang="ts">
interface Props {
  keyword: string
  activeTags: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'update:activeTags', value: string[]): void
}>()

function updateKeyword(value: string) {
  emit('update:keyword', value)
}

function updateActiveTags(value: string[]) {
  emit('update:activeTags', value)
}
</script>
```

- 与 JavaScript 的差异在于：这里 `keyword` 与 `activeTags` 的类型是**显式且一致的**。
- 如果你不小心写成 `emit('update:activeTags', 'tag')`，TypeScript 会立刻提示错误。

# 事件名的联合类型与复用

在稍大的项目中，事件名往往会在多个组件或工具函数中复用，可以先抽出一个类型：

```js
type DialogEvent = 'open' | 'close' | 'confirm' | 'cancel'

const emit = defineEmits<{
  (e: DialogEvent): void
}>()
```

如果你希望不同事件带不同参数，也可以拆成多个重载：

```js
type DialogOpenPayload = { fromRoute?: string }

const emit = defineEmits<{
  (e: 'open', payload?: DialogOpenPayload): void
  (e: 'close'): void
  (e: 'confirm', id: number): void
  (e: 'cancel'): void
}>()
```

这样做的优势：

- 把“事件名 + 参数”的契约放在类型系统里管理，更容易抽取、复用和重构。
- 任何地方调用事件时，都能在 IDE 里看到真实的参数签名，不再需要翻文档或源码。

# 对照表速查

| 需求                         | 推荐写法示例 |
|------------------------------|--------------|
| 单一无参数事件               | `defineEmits<{ (e: 'confirm'): void }>()` |
| 单一带参数事件               | `defineEmits<{ (e: 'submit', payload: T): void }>()` |
| 多个不同事件                 | 多个重载：`(e: 'open')`, `(e: 'close')`, `(e: 'submit', form: Form)` |
| 使用 v-model（单个）         | `modelValue` + `update:modelValue`，事件参数与 prop 保持同一类型 |
| 使用 v-model（多个）         | `xxx` + `update:xxx`，为每一对值/事件分别声明类型 |
| 方便做类型运算的场景         | 对象映射形式：`{ submit: [Form]; open: [] }` |
| 统一管理事件名和参数结构     | 抽出 `type XxxEvent = 'a' \| 'b'` 等类型，再组合进 `defineEmits` 中 |

整体建议：

- **在所有对外暴露的组件中，坚持为事件写上明确的类型声明**。
- 在 JavaScript 中这些地方都是 `any`，许多“事件名写错”“参数结构不匹配”的问题只能靠手工测试发现；在 TypeScript 下，这些问题会在编译期就被捕获，大幅降低线上风险。

