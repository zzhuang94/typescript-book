# 组合式函数（Composables）基础

在 Vue 3 里，**组合式函数（composables）** 是一种用来「复用逻辑」的普通函数：

- 以 `useXxx` 命名，例如 `useListPage`、`useDialog`、`useForm`。
- 函数内部使用 `ref` / `reactive` / `computed` / `watch` / 生命周期等组合式 API。
- 返回一组「响应式数据 + 操作方法」，供组件在 `<script setup>` 中使用。

可以直接理解为：**把 `setup` 里的一块逻辑单独抽出来，放进一个函数里复用**。

---

# 最小示例：useCounter

## 定义 useCounter

```ts
// use-counter.ts
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  function inc() {
    count.value++
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count,
    inc,
    reset,
  }
}
```

- 这是一个**普通的 TypeScript 函数**。
- 内部使用 `ref` 创建响应式变量。
- 返回的 `count` / `inc` / `reset` 可以在任意组件中使用。

## 在组件中使用

```vue
<script setup lang="ts">
import { useCounter } from './use-counter'

const { count, inc, reset } = useCounter(10)
</script>

<template>
  <div>
    <div>Count: {{ count }}</div>
    <button @click="inc">+1</button>
    <button @click="reset">重置</button>
  </div>
</template>
```

- 每个组件调用 `useCounter(10)`，都会得到**自己的** `count`。
- 各组件之间互不影响，符合「每个组件一份状态」的直觉。

---

# 使用规范与调用时机

## 在哪里调用？

!> **组合式函数必须在 `setup` 或 `<script setup>` 中调用**，不要在组件外部或普通函数体外直接调用。

推荐写法：

```ts
// good：在 <script setup> 顶部调用
const { count } = useCounter()
const { visible, open, close } = useDialog()
```

不推荐：

```ts
// bad：在模块顶层直接调用，与组件实例无关
const { count } = useCounter() // ❌
```

原因：

- Vue 需要在「当前组件实例」的上下文中收集依赖（`ref` / `watch` / `onMounted` 等）。
- 在 `setup` 外调用时，不在任何组件实例内，生命周期和响应式逻辑会失效或行为不符合预期。

## 应该返回什么？

推荐返回一个**扁平对象**，包含要给外部用的所有数据和方法：

```ts
return {
  loading,
  data,
  error,
  load,
  reset,
}
```

- 调用方可以直接解构：`const { loading, load } = useXxx()`。
- IDE 能清楚提示每个字段的类型和含义。

---

# 搭配 TypeScript 的写法

## 参数类型

为组合式函数参数定义接口，保持可读性和可维护性：

```ts
interface UseUserListOptions {
  defaultPageSize?: number
}

export function useUserList(options: UseUserListOptions = {}) {
  const pageSize = ref(options.defaultPageSize ?? 10)
  // ...
}
```

- `UseUserListOptions` 描述「这个组合式函数允许外部定制的配置」。
- 参数默认值写在函数签名里，调用方可以省略部分字段。

## 返回值类型（可选，但推荐在复杂场景中使用）

当组合式函数返回内容较多时，可以显式声明返回类型，方便复用：

```ts
import type { Ref } from 'vue'

interface UseUserListReturn {
  loading: Ref<boolean>
  users: Ref<User[]>
  load: () => Promise<void>
}

export function useUserList(): UseUserListReturn {
  // ...
  return {
    loading,
    users,
    load,
  }
}
```

好处：

- 可以在别处使用 `type UserListStore = UseUserListReturn` 来表达「列表页的状态形状」。
- 重构时若少返回/多返回了某个字段，TypeScript 会提示。

---

# 典型场景一：列表页 useListPage（查询 + 表格 + 分页）

很多中后台项目里，列表页的结构非常类似：

1. 顶部查询表单（`query` / `rules` 等）。
2. 中间表格 `tableData`。
3. 底部分页 `page` / `pageSize` / `total`。
4. 重复的 `loading`、`load`、`handleSearch`、`handleReset`、`handlePageChange`。

可以把这一整块逻辑抽成一个组合式函数 `useListPage`。

## 定义 useListPage

```ts
// use-list-page.ts
import { ref, onMounted } from 'vue'

export interface ListQuery {
  page: number
  pageSize: number
}

export interface UseListPageOptions<Q extends object, R> {
  /** 默认查询参数（含 page/pageSize） */
  defaultQuery: Q & ListQuery
  /** 列表接口：返回 { list, total } */
  fetchApi: (query: Q & ListQuery) => Promise<{ list: R[]; total: number }>
}

export function useListPage<Q extends object, R>(
  options: UseListPageOptions<Q, R>,
) {
  const query = ref({ ...options.defaultQuery })
  const loading = ref(false)
  const tableData = ref<R[]>([])
  const total = ref(0)

  async function load() {
    loading.value = true
    try {
      const { list, total: t } = await options.fetchApi(query.value)
      tableData.value = list
      total.value = t
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    query.value.page = 1
    load()
  }

  function handleReset() {
    query.value = { ...options.defaultQuery }
    load()
  }

  function handlePageChange(page: number) {
    query.value.page = page
    load()
  }

  onMounted(load)

  return {
    query,
    loading,
    tableData,
    total,
    handleSearch,
    handleReset,
    handlePageChange,
    reload: load,
  }
}
```

要点：

- 使用**泛型 `Q`、`R`** 表示「查询参数类型」和「列表项数据类型」，不同业务页面可以传入不同类型。
- 通过 `fetchApi` 参数把「跟业务强相关的接口」注入进来。
- 生命周期 `onMounted(load)` 放在组合式函数内部，调用它的组件挂载时就会自动加载数据。

## 在具体页面中使用

```ts
// user-list.vue <script setup>
import { useListPage } from '@/composables/use-list-page'
import { fetchUserList } from '@/api/user'
import type { User } from '@/types'

const {
  query,
  loading,
  tableData,
  total,
  handleSearch,
  handleReset,
  handlePageChange,
  reload,
} = useListPage<{ name: string; status: string }, User>({
  defaultQuery: {
    page: 1,
    pageSize: 10,
    name: '',
    status: '',
  },
  fetchApi: fetchUserList,
})
```

模板中：

```vue
<template>
  <ListLayout :loading="loading">
    <template #search>
      <!-- 使用 query 绑定搜索表单 -->
    </template>

    <template #table>
      <el-table :data="tableData">
        <!-- 列定义略 -->
      </el-table>
    </template>

    <template #pagination>
      <el-pagination
        :current-page="query.page"
        :page-size="query.pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </template>
  </ListLayout>
</template>
```

另一个订单列表页，只需更换 `defaultQuery` 和 `fetchApi`：

```ts
// order-list.vue <script setup>
import { useListPage } from '@/composables/use-list-page'
import { fetchOrderList } from '@/api/order'
import type { Order } from '@/types'

const {
  query,
  loading,
  tableData,
  total,
  handleSearch,
  handlePageChange,
} = useListPage<{ orderNo: string; customer: string }, Order>({
  defaultQuery: {
    page: 1,
    pageSize: 20,
    orderNo: '',
    customer: '',
  },
  fetchApi: fetchOrderList,
})
```

> 这样，每一个新的列表页都只需要：
> - 定义自己的查询字段类型 `Q`；
> - 提供自己的 `fetchApi`；
> 其余逻辑全部由 `useListPage` 复用，**极大减少重复代码**。

---

# 典型场景二：弹窗控制 useDialog / useRowDialog

弹窗通常也有相似逻辑：

- `visible`：控制显示/隐藏。
- `open()` / `close()`：操作方法。
- 某些场景还需要「当前行」：`currentRow`。

可以把这部分逻辑抽成通用的 `useDialog`、`useRowDialog`。

## 基础版：useDialog

```ts
// use-dialog.ts
import { ref } from 'vue'

export function useDialog() {
  const visible = ref(false)

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return {
    visible,
    open,
    close,
  }
}
```

使用：

```ts
// user-list.vue <script setup>
import { useDialog } from '@/composables/use-dialog'

const {
  visible: editVisible,
  open: openEdit,
  close: closeEdit,
} = useDialog()
```

## 带「当前行」的版本：useRowDialog

```ts
// use-row-dialog.ts
import { ref } from 'vue'

export function useRowDialog<T>() {
  const visible = ref(false)
  const current = ref<T | null>(null)

  function open(row: T) {
    current.value = row
    visible.value = true
  }

  function close() {
    visible.value = false
    current.value = null
  }

  return {
    visible,
    current,
    open,
    close,
  }
}
```

使用：

```ts
import { useRowDialog } from '@/composables/use-row-dialog'
import type { User } from '@/types'

const {
  visible: editVisible,
  current: editingUser,
  open: openEdit,
  close: closeEdit,
} = useRowDialog<User>()

function handleEdit(row: User) {
  openEdit(row)
}
```

- 弹窗的「显隐控制 + 当前行管理」只写一遍。
- 所有弹窗统一使用 `useDialog` / `useRowDialog`，**可读性非常一致**。

---

# 与 mixins 的对比（为什么推荐用组合式函数）

在 Vue 2 时代，常用 **mixins** 做逻辑复用，例如「列表页 mixin」、「表单 mixin」。  
在 Vue 3 中，官方更推荐使用组合式函数。

## 组合式函数的优点

- **来源清晰**  
  在 `<script setup>` 顶部，看见 `const list = useListPage()`，就知道「列表逻辑来自这里」，而不是某个看不见的 mixin。
- **命名冲突更少**  
  组合式函数只是返回一个对象，调用方可以自己起变量名（例如 `visible: editVisible`），不会像 mixins 那样把 data/method 全注入到实例上导致重名。
- **类型更友好**  
  组合式函数是普通 TS 函数，参数和返回值类型好写、好推断；mixins 的类型合并规则更复杂。
- **按需组合**  
  一个组件可以按需组合多个 `useXxx`，各自职责清晰，拆分/重构都更容易。

## 推荐实践

!> **新代码中优先使用组合式函数，不再新写 mixins。**  
老项目若已有大量 mixins，可逐步将其中的逻辑迁移为多个 `useXxx` 函数。

---

# 目录与命名建议

在中大型项目中，通常会单独放一个 `composables` 目录：

- `src/composables/use-list-page.ts`：列表页查询 + 分页。
- `src/composables/use-dialog.ts`：简单弹窗控制。
- `src/composables/use-row-dialog.ts`：带当前行的弹窗控制。
- `src/composables/use-permission.ts`：按钮/菜单权限。
- `src/composables/use-form.ts`：表单初始化 + 校验。

命名约定：

- 文件名/函数名统一使用 `useXxx`。
- 每个组合式函数做到**单一职责**，便于在不同组件中自由组合。

---

# 对照表速查

| 需求                     | 推荐手段                         |
|--------------------------|----------------------------------|
| 多组件间复用「数据逻辑」 | 抽成组合式函数 `useXxx`         |
| 多页面结构类似（布局）   | 抽成布局组件 + 插槽             |
| 旧项目里的 mixins        | 逐步迁移为多个 `useXxx` 函数    |
| 需要类型约束复用逻辑     | 组合式函数 + TS 泛型 + 接口声明 |
| 弹窗显隐与当前行控制     | `useDialog` / `useRowDialog`    |
| 列表查询 + 分页通用逻辑  | `useListPage`                   |

整体推荐：

- **模板结构复用** → 用组件 + 插槽。
- **逻辑/状态复用** → 用组合式函数。
- 尽量避免新增 mixins，把复用逻辑显式抽成 `useXxx`。

# gin-vue-web 对照示例

在 `gin-vue-web` 中，虽然代码组织不一定都以 `useXxx` 文件命名，但你仍可以按“组合式函数思路”去识别可复用逻辑：

- `frontend/src/libs/lib.ts`：看请求封装、通用工具等“跨页面复用逻辑”。
- `frontend/src/templates/index.vue`：看列表页共性逻辑如何被模板层统一承载。
- `frontend/src/components/`：看组件级状态与行为如何沉淀为可复用单元。
- `frontend/src/modules/`：看业务页面如何消费这些公共能力。

建议你边读边做一次“抽取练习”：把某个页面重复出现的查询/弹窗逻辑抽成 `useXxx`，再回填到页面中验证可读性和复用收益。

