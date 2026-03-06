% Slots 与插槽参数类型

# defineSlots 基础

在 Vue 3 的 `<script setup>` 中，可以使用 `defineSlots` 来**为插槽声明类型**。

与 JavaScript 中“插槽参数全是 any”不同，配合 TypeScript 后：

- 插槽是否存在、叫什么名字，都可以在类型层面约束。
- 插槽参数（如列表项、表格行等）的结构可以精确定义，父组件在编写模板时会获得完整的智能提示。

典型的声明方式如下：

```js
const slots = defineSlots<{
  default(props: { item: Item; index: number }): any
  empty?: () => any
}>()
```

- `default` 为必需插槽，且拥有参数 `item` 与 `index`。
- `empty?` 为可选插槽。

# 列表组件示例：类型安全的 item 插槽

## 子组件：声明插槽与参数类型

```vue
<!-- item-list.vue -->
<template>
  <ul>
    <li
      v-for="(item, index) in items"
      :key="item.id"
    >
      <slot
        name="item"
        :item="item"
        :index="index"
      >
        <!-- 默认渲染：当父组件没有提供 #item 插槽时 -->
        {{ item.name }}
      </slot>
    </li>

    <li v-if="items.length === 0">
      <slot name="empty">暂无数据</slot>
    </li>
  </ul>
</template>

<script setup lang="ts">
interface Item {
  id: number
  name: string
  age: number
}

interface Props {
  items: Item[]
}

defineProps<Props>()

defineSlots<{
  item(props: { item: Item; index: number }): any
  empty?(): any
}>()
</script>
```

要点：

- `Item` interface 明确规定了每一项的数据结构。
- `defineSlots` 中的 `item(props: { item: Item; index: number })` 保证：
  - 父组件编写 `v-slot:item="{ item, index }"` 时，`item` 的类型就是 `Item`。
  - 任何访问不存在的字段（例如 `item.xxx`）都会在编译期报错。

## 父组件：使用插槽时的类型提示

```vue
<!-- parent.vue -->
<template>
  <ItemList :items="users">
    <template #item="{ item, index }">
      <span>{{ index + 1 }}.</span>
      <strong>{{ item.name }}</strong>
      <span>（{{ item.age }} 岁）</span>
      <!-- item.xxx ❌ 会被 TS 标红，因为 Item 里没有 xxx -->
    </template>

    <template #empty>
      <em>暂时没有用户~</em>
    </template>
  </ItemList>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  age: number
}

const users = ref<User[]>([])
</script>
```

与 JavaScript 相比：

- 在 JS 中，这里的 `item` 和 `index` 都是 `any`，访问错误字段不会有任何提示。
- 在 TS 中，这些字段的类型由子组件统一定义并暴露给父组件，**调用方不再需要记忆每个插槽参数的具体结构**。

# 表格组件示例：多插槽与复用

更复杂一点的例子是表格组件，通常会有多种插槽：

- `header`：自定义表头。
- `row`：自定义整行。
- `cell-xxx`：针对某一列的自定义渲染。

我们可以通过类型统一声明这些插槽的参数：

```vue
<!-- simple-table.vue -->
<template>
  <table>
    <thead>
      <tr>
        <slot name="header">
          <th v-for="column in columns" :key="column.key">
            {{ column.title }}
          </th>
        </slot>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="row.id">
        <slot
          name="row"
          :row="row"
          :index="rowIndex"
        >
          <td v-for="column in columns" :key="column.key">
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ row[column.key] }}
            </slot>
          </td>
        </slot>
      </tr>
    </tbody>
  </table>
  <slot name="footer" />
</template>

<script setup lang="ts">
interface Column {
  key: string
  title: string
}

interface Row {
  id: number
  [key: string]: unknown
}

interface Props {
  columns: Column[]
  data: Row[]
}

defineProps<Props>()

defineSlots<{
  header?(props: {}): any
  footer?(): any
  row?(props: { row: Row; index: number }): any
  // 为具体单元格预留一个通用插槽类型
  [name: `cell-${string}`]?: (props: { row: Row; value: unknown }) => any
}>()
</script>
```

注意这里我们使用了 TypeScript 的 **模板字面量类型**：

```js
[name: `cell-${string}`]?: (props: { row: Row; value: unknown }) => any
```

- 这表示只要插槽名满足 `cell-xxx` 的形式，就视为一个“单元格插槽”，参数为 `{ row, value }`。
- 尽管目前 Vue 官方的类型声明对 `defineSlots` 的索引签名支持有限，IDE 提示可能略有粗糙，但这种写法在类型上仍然是更安全、更自文档化的。

# 默认插槽与具名插槽

`defineSlots` 中的签名名称与实际模板中的插槽名对应关系：

- `default(props: T)` 对应 `<slot v-bind="...">` 或 `<slot :someProp="...">`。
- `foo(props: T)` 对应 `<slot name="foo" ...>` 与 `#foo` 语法。

示例：

```vue
<script setup lang="ts">
interface Item {
  id: number
  name: string
}

defineSlots<{
  default(props: { item: Item }): any
  footer?(): any
}>()
</script>
```

模板：

```vue
<template>
  <slot :item="item" />
  <slot name="footer" />
</template>
```

- 父组件的 `#default="{ item }"` 插槽会拿到 `Item` 类型。
- `#footer` 插槽无参数。

# 小结：为什么要给插槽写类型

在 JavaScript 中：

- 插槽参数在 IDE 里都是 `any`，靠文档和经验记忆结构。
- 调整子组件插槽参数结构时，调用方模板很可能不会立即暴露错误，容易埋下隐患。

在 TypeScript + `defineSlots` 下：

- 插槽名与参数结构统一写在一个 interface/对象类型里，一眼可以看清组件对外暴露的“插槽 API”。
- 调整插槽参数时，TypeScript 会自动标出所有需要更新的调用点，**重构成本大幅降低**。

整体建议：

- 只要是**在多处页面复用的组件**，建议为其所有对外插槽写上清晰的类型声明。
- 如果只是单页内部的小组件、不会复用，可以酌情简化。

