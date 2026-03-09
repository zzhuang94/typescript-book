# 响应式数据在父子组件间同步

先看示例代码：

```vue
<!-- 父组件 -->
<template>
  <div>
    Name: {{ name }}
    Age: {{ age }}
    <hr />
    <SubComp v-model:name="name" v-model:age="age" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SubComp from './sub-comp.vue'

const name = ref<string>('John')
const age = ref<number>(20)
</script>


<!-- 子组件 sub-comp.vue -->
<template>
  <div>
    Sub-Name: {{ name }}
    Sub-Age: {{ age }}
    <input v-model="name" />
    <input type="number" v-model="age" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  age: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:name': [value: string]
  'update:age': [value: number]
}>()

const name = computed({
  get: () => props.name,
  set: (v) => emit('update:name', v),
})

const age = computed({
  get: () => props.age,
  set: (v) => emit('update:age', v),
})
</script>
```


# 用法解释

## v-model

在自定义组件上，`v-model` 是「一个 prop + 一个事件」的语法糖：

- **默认**：prop 名为 `modelValue`，事件名为 `update:modelValue`。
- **具名 v-model**：prop 名为 `xxx`，事件名为 `update:xxx`。

父组件写：

```vue
<SubComp v-model:name="name" v-model:age="age" />
```

等价于：

```vue
<SubComp :name="name" @update:name="name = $event" :age="age" @update:age="age = $event"/>
```

- 父组件把「当前值」通过 props 传给子组件
- 子组件在需要更新时通过 `emit('update:xxx', newValue)` 把新值回传，由父组件更新自己的状态。
- 数据的所有权在父组件，子组件只负责展示和触发更新。

> 个人更推荐具名写法，可读性更强

## Props / Emits

子组件要声明自己接收的 props 和发出的事件，并与 `v-model` 约定一致：

```js
interface Props {
  name: string
  age: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:name': [value: string]
  'update:age': [value: number]
}>()
```

- `defineProps`：声明接收的 `props` 参数
- `defineEmits`：声明两个事件，参数类型与对应 `prop` 一致

采用 **interface + 类型声明** 的写法和 [Props 基础](props.md)、[defineEmits 基础](emits.md) 一致

## computed

- 子组件里不能直接修改 props（**违反单向数据流**）
- 若希望模板里能用 `v-model="name"` 这种写法，就需要一个**既可读又可写**的本地引用
- 带 getter/setter 的 `computed` 正好满足：

```js
const name = computed({
  get: () => props.name,
  set: (v) => emit('update:name', v),
})

const age = computed({
  get: () => props.age,
  set: (v) => emit('update:age', v),
})
```

- **get**：返回当前 prop，保证展示与父组件一致
- **set**：把新值通过对应事件发给父组件，*由父组件更新后，再通过 prop 流回子组件*

# 优点说明

## 遵守单向数据流

!> Vue 强调 **单向数据流**：父 → 子通过 props，子 → 父通过事件。示例里：

- 父组件持有 `ref` 状态，子组件只通过 props 接收、通过 emit 上报。
- 子组件不直接改 props，而是通过 `emit('update:xxx', v)` 让父组件改，再通过 props 下传。

这样数据来源唯一、变更可追踪，避免「子组件改 prop、父组件不知道」导致的状态不一致和难以调试。

## v-model 约定一致

`v-model:name`、`v-model:age` 是 Vue 3 的标准用法，约定是：

- prop：`name` / `age`
- 事件：`update:name` / `update:age`，且 payload 类型与 prop 一致

示例中子组件的 props 与 emit 命名、类型完全符合该约定，任何熟悉 Vue 的开发者都能一眼看出「这是可双向绑定的受控组件」，也便于和官方文档、生态组件保持一致。

## 类型安全

- Props 和事件参数都做了类型声明，父子之间「传什么、收什么」在编译期就能检查。  
- `computed` 的 set 里若写错事件名或传错类型，会立刻报错，避免运行时才发现问题。

相比纯 JavaScript 下靠注释或文档约定，TypeScript 把契约落在类型上，重构和协作更安全。

# 注意事项

## 不能直接修改 props

- 在子组件中**不要**对 props 做赋值（如 `props.name = xxx`）。
- Props 是只读的，直接修改在严格模式下会报错，且会破坏单向数据流，父组件无法感知变更。
- 始终通过 `emit('update:xxx', value)` 由父组件更新，再通过 props 下传。

## 引用类型

当 prop 是对象或数组时，类型和约定不变，但要注意：

- 若子组件只是**整体替换**，用 `emit('update:xxx', newValue)` 即可，父组件用新引用替换原状态。
- 若子组件需要**修改内部属性/元素**（例如 `obj.foo = 1` 或 `arr.push(item)`），本质上是在改父组件传下来的引用。若父组件希望「所有变更都通过事件」可追踪，有两种常见做法：
  - **做法一**：子组件先拷贝一份（如 `{ ...props.obj }` 或 `[...props.arr]`），在副本上改，再 `emit('update:xxx', 副本)`。
  - **做法二**：父组件传下来的就是「可被子组件直接改」的共享引用，此时不再通过 emit 同步该对象/数组本身，仅在有需要时 emit 其它业务事件（如 `change`）。两种方式要在设计时想清楚，避免混用导致数据流混乱。

## computed get/set

- `get`：每次访问（如模板渲染）都会执行，返回当前 `props.xxx`，props 变化会触发重新计算和视图更新
- `set`：仅在用户或逻辑对「可写 computed」赋值时执行，用于 emit，不会造成额外的响应式依赖

> - 只要不在 get 里做昂贵计算，这种写法性能上没有问题。
> - 若某个字段需要复杂校验或格式化，建议把逻辑放在 computed 的 `get/set` 中，保持模板简洁。

## 单个 v-model

若只需一个双向绑定，可用默认的 `modelValue` + `update:modelValue`：

```js
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
```

父组件使用：`<SubComp v-model="text" />`。
多字段时再用 `v-model:name`、`v-model:age` 等具名形式，与示例一致。

## 事件名的对象映射写法

`defineEmits` 除对象映射形式外，也可用函数重载形式：

```js
defineEmits<{
  'update:name': [value: string]
  'update:age': [value: number]
}>()
```

与下面的写法等价：

```js
defineEmits<{
  (e: 'update:name', value: string): void
  (e: 'update:age', value: number): void
}>()
```

> 两种写法在类型检查和运行时行为上一致，按团队习惯选用即可。