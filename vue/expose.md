# defineExpose 与跨组件访问

## 基础知识

- 子组件内部的变量、函数默认是 *不会暴露给父组件的*
- 如果想让父组件访问子组件的变量或方法，子组件就需要用 `defineExpose` 明确声明：*这就是我愿意暴露给外部的 API*。

# 基础用法

## 子组件：暴露方法与状态

```vue
<!-- dialog-panel.vue -->
<template>
  <div v-if="visible" class="dialog">
    <header>{{ title }}</header>
    <section>
      <slot />
    </section>
    <footer>
      <button @click="hide">关闭</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
}

defineProps<Props>()

const visible = ref(false)

function show() {
  visible.value = true
}

function hide() {
  visible.value = false
}

defineExpose({
  show,
  hide,
})
</script>
```

## 父组件：通过 ref 使用暴露的 API

```vue
<!-- parent.vue -->
<template>
  <button @click="open">打开弹窗</button>

  <DialogPanel
    ref="dialogRef"
    title="示例弹窗"
  >
    弹窗内容...
  </DialogPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DialogPanel from './dialog-panel.vue'

const dialogRef = ref<InstanceType<typeof DialogPanel> | null>(null)

function open() {
  dialogRef.value?.show()
}
</script>
```

- 子组件只暴露 `show`、`hide` 两个方法。
- 父组件通过 `InstanceType<typeof DialogPanel>` 获取实例类型后：
  - 能享受对 `show` / `hide` 的自动补全和参数提示。
  - 若尝试访问 `dialogRef.value?.visible` 等未暴露的内部变量，TypeScript 会报错。

与 JavaScript 相比：

- JS 中 `dialogRef.value` 是 `any`，可以访问任何属性，重构时容易出现“内部实现改了，外面还在用旧字段”的问题。
- TS + `defineExpose` 将跨组件访问的 API 限定在一个明确的声明里，减少耦合。

# 使用类型参数或类型别名精确定义暴露接口

有时我们希望更明确地控制 `defineExpose` 的类型，可以在其中使用泛型或类型别名。

## 在子组件内定义接口类型

```vue
<!-- form-panel.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface FormData {
  name: string
  age: number
}

const form = ref<FormData>({
  name: '',
  age: 18,
})

function submit() {
  // 提交逻辑...
}

function reset() {
  form.value = {
    name: '',
    age: 18,
  }
}

type FormPanelExposed = {
  submit: () => void
  reset: () => void
  getValue: () => FormData
}

defineExpose<FormPanelExposed>({
  submit,
  reset,
  getValue: () => form.value,
})
</script>
```

在父组件中使用：

```js
import type { FormPanelExposed } from './form-panel.vue'

const formRef = ref<FormPanelExposed | null>(null)
```

这样做的优势：

- `FormPanelExposed` 明确描述了“这个组件对外的接口”，可以在多个地方复用。
- 调整暴露 API 时，所有引用 `FormPanelExposed` 的地方会得到同步更新提示。

# 与模板 ref 的配合

`defineExpose` 通常与模板 ref 一起使用，完整流程为：

1. 在子组件中用 `defineExpose` 声明对外 API。
2. 在父组件模板中用 `ref="xxx"` 获取实例。
3. 在父组件脚本中将 `ref` 的类型写成 `InstanceType<typeof Child> | null` 或显式接口类型。

示例总结：

```vue
<!-- child.vue -->
<script setup lang="ts">
const foo = () => {}
const bar = () => {}

defineExpose({
  foo,
  bar,
})
</script>
```

```vue
<!-- parent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const childRef = ref<InstanceType<typeof Child> | null>(null)

function handleClick() {
  childRef.value?.foo()
}
</script>
```

# 何时应当使用 defineExpose

建议在以下场景中使用：

- **弹窗、抽屉、通知等 UI 容器组件**：需要给父组件一个 `open()` / `close()` 之类的控制方法。
- **复杂表单组件**：提供 `submit()`、`reset()`、`validate()`、`getValue()` 等方法给父组件调用。
- **地图、图表等第三方库封装组件**：对外暴露 `resize()`、`setCenter()`、`exportImage()` 等方法。

不建议在以下场景滥用：

- 普通展示型组件（例如简单的 `UserCard`）通常不需要任何对外方法，数据流经由 props/emit 即可。
- 将大量内部实现细节暴露给外部，会使组件边界模糊，降低可维护性。

# 小结

- `defineExpose` 是 `<script setup>` 中用来**显式声明组件对外 API** 的工具。
- 配合 `ref<InstanceType<typeof Child> | null>` 或显式接口类型，可以在 TypeScript 中获得完整的跨组件调用提示。
- 合理使用 `defineExpose` 能将复杂的 UI/业务封装成一组清晰的“方法接口”，在重构和多人协作时显著提升可靠性；而在 JavaScript 中，这些接口往往以“约定俗成”的形式存在，缺乏编译期保障。

# gin-vue-web 对照示例

如果你想看“父组件控制子组件”的工程化落地，建议在 `gin-vue-web` 里按下面方式找案例：

- 优先查看 `frontend/src/components/` 中的弹窗/编辑类组件，关注是否对外暴露 `open/close/reset/submit` 这类方法。
- 再查看 `frontend/src/modules/` 中的页面组件，观察父组件如何通过 `ref` 调用子组件对外 API。
- 结合 `frontend/src/templates/index.vue`，理解页面层如何统一组织组件交互。

可以把本文的检查清单直接套进去：是否只暴露必要 API、是否有清晰类型、是否避免把内部状态全部暴露出去。

