% 组合函数与 TypeScript 泛型

# 为什么组合函数特别适合配合 TypeScript

在 Vue 3 中，我们常用“组合函数”（composable）来抽离可复用逻辑，例如：

- 数据请求：`useFetch`、`useUser`。
- 列表管理：`useList`、`useTable`。
- 表单状态：`useForm`、`useField`。

这些函数本质上都是普通的 TypeScript 函数，返回若干 `ref` / `reactive` / `computed` 等响应式对象。

配合 **泛型** 后：

- 组合函数不再局限于某种数据结构，可以在不同场景下复用。
- 调用者可以通过显式传入类型参数来获得精确的类型提示。
- 相比纯 JavaScript，只能靠注释约定“这里返回什么字段”，TypeScript 可以在编译期帮助你检查使用是否正确。

# 基础示例：useFetch<T>()

## 组合函数定义

```js
// use-fetch.ts
import { ref } from 'vue'

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }
      const json = (await res.json()) as T
      data.value = json
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // 约定：创建时自动请求一次
  execute()

  return {
    data,
    loading,
    error,
    execute,
  }
}
```

## 在组件中使用：显式传入类型参数

```vue
<!-- user-view.vue -->
<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">出错了：{{ error.message }}</div>
  <div v-else-if="user">
    {{ user.name }}（{{ user.age }} 岁）
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from './use-fetch'

interface User {
  id: number
  name: string
  age: number
}

// 显式指定 T = User
const { data, loading, error } = useFetch<User>('/api/user/1')

const user = computed(() => data.value)
</script>
```

优势：

- `data.value` 的类型自动为 `User | null`。
- 在模板和脚本中使用 `user.name` / `user.age` 等字段会有完整提示。
- 如果返回的实际数据结构不符合 `User`，在请求结果转换时就能被发现并处理。

在 JavaScript 中：

- `data.value` 的类型是 `any`，你可能在多个地方误写字段名，只有运行到那一步才会报错。

# 列表组合函数：useList<T>()

## 组合函数定义

```js
// use-list.ts
import { ref } from 'vue'

export interface UseListOptions<T> {
  fetcher: () => Promise<T[]>
}

export function useList<T>(options: UseListOptions<T>) {
  const items = ref<T[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function reload() {
    loading.value = true
    error.value = null
    try {
      items.value = await options.fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // 默认加载一次
  reload()

  return {
    items,
    loading,
    error,
    reload,
  }
}
```

## 在组件中使用：传入特定类型

```vue
<!-- product-list.vue -->
<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">出错了：{{ error.message }}</div>
  <ul v-else>
    <li v-for="item in items" :key="item.id">
      {{ item.name }} - ￥{{ item.price }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useList } from './use-list'

interface Product {
  id: number
  name: string
  price: number
}

const { items, loading, error } = useList<Product>({
  async fetcher() {
    const res = await fetch('/api/products')
    const json = await res.json()
    return json as Product[]
  },
})
</script>
```

优势：

- `items.value` 的类型为 `Product[]`，`item.name` / `item.price` 全程有类型提示。
- 当你修改 `Product` 结构时，所有使用 `useList<Product>` 的地方都会自动感知并提示需要更新。

# 组合函数返回类型的显式声明

有时希望组合函数的返回类型能被其它地方复用，可以显式写出返回类型：

```js
// use-toggle.ts
import { ref } from 'vue'

export interface UseToggleReturn {
  value: Ref<boolean>
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
}

export function useToggle(initial = false): UseToggleReturn {
  const value = ref(initial)

  const toggle = () => {
    value.value = !value.value
  }

  const setTrue = () => {
    value.value = true
  }

  const setFalse = () => {
    value.value = false
  }

  return {
    value,
    toggle,
    setTrue,
    setFalse,
  }
}
```

在组件中使用时：

```js
import type { UseToggleReturn } from './use-toggle'

const state: UseToggleReturn = useToggle()
```

这样可以：

- 在多个组合函数之间共享同一套“返回值接口”。
- 为测试、mock 等场景提供统一类型。

# 提升类型推导质量的小技巧

## 使用 as const 保持字面量类型

在组合函数中返回一些常量配置时，可能希望保留其字面量类型：

```js
export function useStatus() {
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

  const STATUSES = {
    idle: '空闲',
    loading: '加载中',
    success: '成功',
    error: '失败',
  } as const

  return {
    status,
    STATUSES,
  }
}
```

- `STATUSES` 的键和值都会被推断为精确的字面量类型，而非一般的 `string`。
- 在调用方使用 `STATUSES[status.value]` 时，TypeScript 能保证 `status.value` 只能取 `'idle' | 'loading' | 'success' | 'error'` 中的值。

## 利用泛型约束参数类型

可以给组合函数增加一些约束，例如要求传入的参数必须包含某些字段：

```js
interface WithId {
  id: string | number
}

export function useSelection<T extends WithId>() {
  const selectedIds = ref<Array<T['id']>>([])

  function isSelected(item: T) {
    return selectedIds.value.includes(item.id)
  }

  function toggle(item: T) {
    if (isSelected(item)) {
      selectedIds.value = selectedIds.value.filter(id => id !== item.id)
    } else {
      selectedIds.value.push(item.id)
    }
  }

  return {
    selectedIds,
    isSelected,
    toggle,
  }
}
```

使用时：

```js
interface Row {
  id: number
  name: string
}

const { selectedIds, isSelected, toggle } = useSelection<Row>()
```

- 若传入的类型没有 `id` 字段（或类型不兼容），会在调用 `useSelection<T>()` 时被编译器拦下。
- 这种“结构型约束”在列表、表格、树等场景中非常有用。

# 小结

- 组合函数本质上是 TypeScript 函数，配合 **泛型** 能将一套逻辑复用到多种数据结构上。
- 显式的 **泛型参数**（如 `useFetch<User>()`、`useList<Product>()`）可以让调用方清晰表达“我期望的数据类型是什么”，并获得完整的提示。
- 相比 JavaScript 只能“相信返回值长什么样”，TypeScript 能在编译阶段帮助你发现：路径写错、字段名写错、类型不匹配等问题，大幅提升工程可靠性。

