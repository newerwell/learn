# D57–D62 React 任务看板练习项目

## 启动 mock API

在仓库根目录开一个 PowerShell 窗口并保持运行：

~~~powershell
node labs\mock-tasks-api\server.mjs
~~~

服务地址是 http://127.0.0.1:3200，默认每个请求延迟约 300ms。

## 启动前端

再开一个 PowerShell 窗口，在仓库根目录运行：

~~~powershell
cd projects\task-board\task-board-app
pnpm install
pnpm dev
~~~

浏览器打开 Vite 显示的本地地址，通常是 http://localhost:5173。

## D62 练习

- `src/App.tsx` 用 `useEffect` 请求任务分页 API，并以 `loading`、`error`、`success` 三态显示页面。
- 请求用 `AbortController` 取消；快速切换页码，查看 Network 中旧请求变成 `Cancelled`。
- “演示场景”可切换正常列表、空列表、404 和 500；断网后点“重新请求当前页”可观察网络错误和重试。
- `fetch` 收到 404/500 仍会给出 `Response`，所以代码必须检查 `response.ok`；网络断开才会进入请求异常分支。
- API 响应先按 `unknown` 处理并检查分页结构，避免把 TypeScript 类型断言当成运行时校验。

mock API 的完整契约见 `../docs/04-最小接口契约.md`；API 的演示错误和延迟端点见 `../../../labs/mock-tasks-api/README.md`。
