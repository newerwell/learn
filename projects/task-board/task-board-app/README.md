# D57–D63 React 任务看板练习项目

## 启动

在仓库根目录的 PowerShell 中运行：

~~~powershell
cd projects\task-board\task-board-app
pnpm install
pnpm dev
~~~

浏览器打开 Vite 显示的本地地址，通常是 http://localhost:5173。本日使用本地 state，不需要启动 mock API；刷新页面会恢复示例任务。

## D63 周复盘

- `src/App.tsx` 用 `useState` 保存任务、输入框文字和当前筛选条件。
- 新增、勾选和删除使用新数组/新对象更新，不直接修改 state。
- 全部、未完成、已完成三种筛选都能使用；完成数、完成率和筛选结果从任务数组直接计算。
- `TaskList` / `TaskItem` 负责任务展示和事件回调，`Toolbar` 汇总总数与完成数，`App` 持有共享 state。
- 页面下方列出五行复盘提示；请结合自己最难拆的组件写进学习笔记。

D58–D63 每日判据见 `../../../notes/W9-W12-任务.md`；D62 的 API 契约和服务启动说明见 `../docs/04-最小接口契约.md` 与 `../../../labs/mock-tasks-api/README.md`。
