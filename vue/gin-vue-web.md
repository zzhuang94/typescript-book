# Vue 开源项目推荐：gin-vue-web

如果你希望找一个偏中后台、可直接落地的 Vue 3 全栈项目做实战参考，推荐这个仓库：

- 项目地址：<https://github.com/zzhuang94/gin-vue-web>
- 技术栈：Gin + Vue 3 + Ant Design Vue + Vite
- 适合场景：管理后台、CRUD 系统、权限/菜单/日志等企业常见模块

## 为什么推荐

- 前后端分离结构清晰，前端在 `frontend`，后端在 `backend`
- Vue 3 + TypeScript 实战代码多，适合对照学习组件通信与页面组织
- 中后台常见能力比较完整（列表、弹窗、权限、操作日志）
- 框架约定明确，便于从“怎么组织代码”这个角度建立工程化认知

## 在这个项目里看什么

结合本目录文档，推荐优先看这些位置：

- `frontend/src/app.vue`：应用入口与页面加载流程
- `frontend/src/libs/lib.ts`：请求封装与通用工具方法
- `frontend/src/templates/index.vue`：通用列表页模板（搜索、表格、分页）
- `frontend/src/components/`：通用组件目录（搜索器、表格、分页、编辑表单等）
- `frontend/src/modules/`：业务页面目录（按模块划分页面）

## 对照阅读建议

- 看 `props.md` 时，优先关注组件间的 `props` 输入和默认值处理方式
- 看 `sync.md` 时，优先关注组件间的 `v-model` 双向同步约定（`prop + update:*`）
- 看 `expose.md` 时，优先关注弹窗/表单这类组件如何向父组件暴露方法
- 看 `composables.md` 时，优先关注通用逻辑是否被抽离到可复用函数

## 学习路径（建议）

1. 先通读项目 README，明确整体模块和启动方式  
2. 再从 `frontend/src/templates/index.vue` 和 `frontend/src/components/` 入手看页面骨架  
3. 最后按业务页面反查 `frontend/src/modules/`，理解“模板 + 组件 + 业务”的组合方式

---

参考链接：

- [gin-vue-web（GitHub）](https://github.com/zzhuang94/gin-vue-web)
