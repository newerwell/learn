# D57 React 任务看板起步项目

## 启动前端

在仓库根目录的 PowerShell 中运行：

~~~powershell
cd projects\task-board\task-board-app
pnpm install
pnpm dev
~~~

Vite 会显示本地地址，通常是 http://localhost:5173。浏览器打开它即可查看 D57 起步页。

## JSX 与组件

- src/App.tsx 只保留一个函数组件 App。
- tsconfig.app.json 中的 jsx: "react-jsx" 告诉 TypeScript 使用 React 的自动 JSX 转换；构建后的调用来自 react/jsx-runtime。
- 入口 src/main.tsx 调用 createRoot(...).render(<App />)，React 随后调用组件并渲染它返回的 UI 描述。

接口约定见 ../docs/04-最小接口契约.md。D58 再往 App 加固定数组和列表渲染。
