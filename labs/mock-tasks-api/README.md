# Mock 任务 API（阶段 2 用）

> 一个 5 分钟就能跑起来、数据在内存里的任务 API，专为阶段 2 的 React 练习准备。
> 目的是让**加载态、错误态、空态、乐观更新**都看得见、测得了。

## 启动

```powershell
node labs\mock-tasks-api\server.mjs
# → http://127.0.0.1:3200
```

可选环境变量：
```powershell
$env:LATENCY=0; node labs\mock-tasks-api\server.mjs   # 关掉 300ms 延迟
$env:PORT=3300; node labs\mock-tasks-api\server.mjs   # 换端口
```

> 端口分配：3000 被 qqagent 占用，3100 是 HTTP 实验台，3200 是这里，Vite 默认 5173。
> 数据在内存里，**重启即恢复 25 条种子数据**——放心改。

## 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/tasks?page=1&pageSize=10&q=&done=` | 列表，返回 `{ items, total, page, pageSize }` |
| POST | `/api/tasks` | 创建，`{ title, dueAt?, tags? }`，成功 201 + `Location` |
| GET | `/api/tasks/:id` | 详情，不存在 404 |
| PATCH | `/api/tasks/:id` | 部分更新 `{ title?, done?, dueAt?, tags? }` |
| DELETE | `/api/tasks/:id` | 删除，成功 204 无 body |
| GET | `/api/error?status=500` | 故意失败，用来测错误态 |
| GET | `/api/slow?ms=3000` | 故意慢，用来测加载态与超时 |

**错误格式**（所有失败响应统一）：
```json
{ "code": "TASK_NOT_FOUND", "message": "任务 t_99 不存在", "details": { "id": "t_99" } }
```

| 码 | code | 触发方式 |
|---|---|---|
| 400 | INVALID_BODY | 请求体不是 JSON 对象（例如数组、字符串或 null） |
| 400 | `INVALID_JSON` | 请求体不是合法 JSON |
| 404 | `TASK_NOT_FOUND` | 访问不存在的 id |
| 422 | `TITLE_REQUIRED` / `TITLE_TOO_LONG` | title 为空 / 超 200 字 |

## 怎么制造各种状态

| 想测 | 怎么做 |
|---|---|
| 加载（骨架/转圈） | 默认就有 300ms 延迟；或访问 `/api/slow?ms=3000` |
| 空列表 | `?q=不存在的关键词`（返回 `items: []`） |
| 服务器错误 | 前端临时改成请求 `/api/error?status=500` |
| 网络断开 | DevTools → Network → Offline，再操作 |
| 校验失败 | 提交空 title，看 422 的 `details.field` |
| 并发/取消 | 快速切换筛选条件，观察旧请求是否被 abort |

## 与阶段 2 的关系

- **D57**：用它的 5 个接口写一页《最小接口契约》，替代跳过的 W8 文档
- **D66**：先自己用 `node:http` 写 20 分钟，写不出来再对照 `server.mjs`
- **D67–D69**：`useQuery` / `useMutation` / `invalidateQueries` 全拿它练
- **D81**：测试里 mock `fetch`，用它的响应结构当 fixture

## 注意

- 只绑 `127.0.0.1`，局域网访问不到（故意的）
- 数据不落盘，没有鉴权（阶段 3 才做）
- 生产环境不要用：它没有分页排序、没有事务、没有并发控制——这些都是阶段 3 要学的
