# D57–D61 React 任务看板练习项目

## 启动前端

在仓库根目录的 PowerShell 中运行：

~~~powershell
cd projects\task-board\task-board-app
pnpm install
pnpm dev
~~~

Vite 会显示本地地址，通常是 http://localhost:5173。浏览器打开它即可查看当前 D61 useEffect 依赖与清理练习。

## 项目结构

- src/App.tsx 组合组件并持有 tasks、title、query、showTimer state；新增、勾选、删除都通过函数式更新生成新数组或新对象。
- src/components/TaskList.tsx 负责列表和空状态；TaskItem.tsx 负责单条任务；Toolbar.tsx 负责汇总信息；Panel.tsx 用 children 包住内容。
- src/types/task.ts 定义共享的 Task 类型，各个 props 类型把输入标记为只读。
- 输入框以 value 和 onChange 连接 title state。TaskItem 通过 onToggle 和 onDelete 请求父组件更新。
- `useEffect([])`、`useEffect([query])` 和定时器清理示例都在 `src/App.tsx`；搜索结果直接从任务 state 计算。
- 开发环境的 StrictMode 会在首次挂载时额外执行一次 effect 的 setup → cleanup → setup，用于检查清理逻辑。

tsconfig.app.json 中的 jsx: "react-jsx" 告诉 TypeScript 使用 React 的自动 JSX 转换。入口 src/main.tsx 调用 createRoot(...).render(<App />)。

D57 的最小接口约定见 ../docs/04-最小接口契约.md。
