# D57–D59 React 任务看板练习项目

## 启动前端

在仓库根目录的 PowerShell 中运行：

~~~powershell
cd projects\task-board\task-board-app
pnpm install
pnpm dev
~~~

Vite 会显示本地地址，通常是 http://localhost:5173。浏览器打开它即可查看当前 D59 组件拆分练习。

## 项目结构

- src/App.tsx 只负责组合组件；D58 的固定任务数据和 D59 的父组件回调也放在这里。
- src/components/TaskList.tsx 负责列表和空状态；TaskItem.tsx 负责单条任务；Toolbar.tsx 负责汇总信息；Panel.tsx 用 children 包住内容。
- src/types/task.ts 定义共享的 Task 类型，各个 props 类型把输入标记为只读。
- TaskItem 点击后调用 onToggle，当前父组件只记录请求；D60 再把它连接到 useState。

tsconfig.app.json 中的 jsx: "react-jsx" 告诉 TypeScript 使用 React 的自动 JSX 转换。入口 src/main.tsx 调用 createRoot(...).render(<App />)。

D57 的最小接口约定见 ../docs/04-最小接口契约.md。
