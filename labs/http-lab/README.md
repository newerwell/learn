# HTTP 实验台 · D6–D10 回炉

> 目标：把 D6–D10 那些"看文字没感觉"的概念，变成**你亲手触发、亲眼看到**的现象。
> 这些知识点纯看是学不会的，因为它们的证据都在 DevTools 里，不在文档里。

## 启动

```powershell
cd labs\http-lab
node server.js
```
浏览器打开 <http://127.0.0.1:3100>，按 F12 打开 DevTools，切到 **Network** 面板，勾上 **Preserve log**。

> 服务用的是 3100 端口（3000 已被本机另一个项目占用），冲突就换：`$env:PORT=3200; node server.js`
> 页面里按钮对应的日志在下方黑色面板，**每次都要同时看日志和 Network**：日志是"JS 看到了什么"，Network 是"网络上到底发生了什么"，两者经常不一致——这正是理解 HTTP 的关键。

---

## 实验 1 · 同源与跨域：只差一个主机名（D8 / D10）

**做**
1. 点「同源 fetch('/api/hello')」→ 日志有正常 JSON
2. 点「跨域 fetch(其它源 + '/api/hello')」→ 日志只有一个 `TypeError: Failed to fetch`
3. 打开 **Console**，把红色那整段抄进笔记
4. 点「看我的请求头」→ 观察 `Origin` 和 `Referer`

**预期**
- 同源：200，body 正常
- 跨域：JS 抛 TypeError，Console 里是 `Access to fetch at 'http://localhost:3100/api/hello' from origin 'http://127.0.0.1:3100' has been blocked by CORS policy`
- Network 里被拦的那条请求：Status 显示 `(blocked: CORS error)`，**但服务器其实已经返回了 200**

**为什么**
`127.0.0.1:3100` 和 `localhost:3100` 是两个不同的 **origin**（同源要求协议+主机+端口三者全同），所以浏览器按跨域处理。

**结论（抄进笔记）**
> CORS 是浏览器在**读取响应前**做的检查；服务器端一切正常，请求也确实到达了。所以 curl / Postman 永远不会有 CORS 问题——它们不是浏览器。

---

## 实验 2 · 有 ACAO 和没有 ACAO 的区别（D10）

**做**
1. 点「跨域 /api/cors（有 ACAO:*）」→ 成功
2. 点「跨域 /api/hello（无 ACAO）」→ 失败
3. 点「跨域带凭据 /api/cors-cred」→ 成功，注意响应头里 `Access-Control-Allow-Origin` 是**你的具体 origin**，不是 `*`

**为什么**
浏览器看到响应后检查 `Access-Control-Allow-Origin` 是否允许当前 origin；允许才把 body 交给 JS。

**结论**
> 跨域失败时先看响应头有没有 ACAO，而不是先怀疑服务器没收到请求。
> 带 Cookie（`credentials: 'include'`）时 ACAO 不能是 `*`，且必须同时有 `Access-Control-Allow-Credentials: true`。

---

## 实验 3 · 预检请求什么时候触发（D10）

**做**
1. 点「不带自定义头」→ Network 里**只有 1 条**请求
2. 点「带 X-Demo」→ Network 里**有 2 条**：先 `OPTIONS`（204），再 `GET`（200）
3. 点开 OPTIONS 那条，看 Request Headers：`Access-Control-Request-Method`、`Access-Control-Request-Headers`

**为什么**
"简单请求"（GET/HEAD/POST + 只能有 Content-Type 等少数头）才免预检。加了 `X-Demo` 就变成非简单请求，浏览器必须先问一句"我能发吗"。

**动手改代码验证**
把 `server.js` 里 `/api/preflight` 的 `if (req.method === 'OPTIONS')` 整段注释掉，重启服务，再点「带 X-Demo」：
→ OPTIONS 返回 404 → 预检失败 → 浏览器报 CORS 错误，**而真实 GET 根本没发出去**。

**结论**
> 后端必须显式处理 OPTIONS，否则前端怎么改都没用。
> 预检失败在 Console 里也显示为 CORS 错误，这是最容易误判的地方。

---

## 实验 4 · 强缓存 vs 协商缓存（D9）

**做**
1. 点「/api/cache60」**两次**，看 Network 第二次的 Size 列 → `(memory cache)` 或 `(disk cache)`，Time ≈ 0
2. 点「/api/etag」**两次** → 第二次 Status 是 **304**，Size 列是 `304` 或很小
3. 点「/api/lastmod」两次 → 同样 304
4. 点「对照：no-store」两次 → 两次都是真实 200

**为什么**
- 强缓存（`max-age=60`）：浏览器直接断定"60 秒内不用问"，**请求都不发**
- 协商缓存（`ETag` / `Last-Modified`）：请求照发，服务器比对后回 304，**不传 body**
- `no-store`：连缓存都不许存

**关键观察**
日志里 JS 两次都拿到 `status: 200` 和同样的 body——因为 304 之后浏览器用本地副本"补"成 200 交给 JS。**304 只在 Network 里看得到**。

**结论**
> 判断命中哪种缓存，看 Network 的 Status 和 Size 列，不要看 JS 里的 status。
> ETag 比 Last-Modified 精确（内容指纹 vs 时间戳），生产环境优先用 ETag。

---

## 实验 5 · 重定向与瀑布（D9 / D7）

**做**
1. 点「/api/redirect」→ 日志里 `redirected: true`，`finalUrl` 变成 `/api/hello`
2. Network 里是两条：302 + 200，且 302 的响应头有 `Location`
3. 点「redirect:'manual'」→ JS 拿到 `status: 0`、读不到 body（opaque redirect）
4. 点「/api/slow」→ 看瀑布里占满 2 秒的那根条，Time 列就是它

**结论**
> `fetch` 默认跟随重定向，所以 JS 看不到 302；要看重定向过程必须看 Network。
> 瀑布图里"等待时间（Waiting/TTFB）"和"内容下载（Content Download）"是两段，卡住的地方不同，优化手段也不同。

---

## 实验 6 · Cookie 与 HttpOnly（D9）

**做**
1. 点「种 Cookie」→ 日志里 `document.cookie` 是空字符串
2. DevTools → **Application → Cookies → http://127.0.0.1:3100** → 能看到 `sid`
3. 看 Network 里那条响应的 `Set-Cookie` 头
4. 再点「再读一次」→ 还是空

**为什么**
`HttpOnly` 的含义是"这个 Cookie 只走 HTTP，JS 不可读"。它防的是 XSS 偷 token。

**结论**
> `document.cookie` 读不到 ≠ 没种上。判断 Cookie 是否生效去 Application 面板。
> 三个属性记牢：`HttpOnly`（JS 读不到）、`Secure`（只走 HTTPS）、`SameSite`（防 CSRF）。

---

## 实验 7 · 用 curl 做同样的观察（D8 补）

服务开着的时候，另开一个终端：

```powershell
# 1. 完整报文：起始行 + 响应头 + body
curl.exe -i http://127.0.0.1:3100/api/hello

# 2. 只看响应头（HEAD 的效果）
curl.exe -I http://127.0.0.1:3100/api/etag

# 3. 手动带 If-None-Match 验证 304（先拿到 ETag 再回填）
curl.exe -s -D - -o NUL http://127.0.0.1:3100/api/etag
curl.exe -i -H "If-None-Match: \"刚才那个ETag值\"" http://127.0.0.1:3100/api/etag

# 4. 手动触发预检
curl.exe -i -X OPTIONS http://127.0.0.1:3100/api/preflight -H "Origin: http://localhost:3100" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: X-Demo"

# 5. 看跨域请求为什么不影响 curl
curl.exe -i -H "Origin: http://localhost:3100" http://127.0.0.1:3100/api/hello
```

**关键观察**：第 5 条你会看到 **200 且有 body**——curl 不带浏览器那套 CORS 检查，所以"服务器没做错，是浏览器在拦"这句话在这里有了实证。

---

## 回炉验收（能脱稿说出这些才算过关）

1. 为什么 `localhost` 和 `127.0.0.1` 算跨域？
2. CORS 拦截发生在浏览器还是服务器？证据是什么？
3. 预检什么时候触发？预检失败时真实请求发出去了吗？
4. 强缓存命中时请求发不发？304 时 body 从哪来？
5. 为什么 JS 里看不出 304？
6. `HttpOnly` 防的是什么攻击？怎么验证它生效？
7. 302 和 301 的区别？307 又是干什么的？
8. 瀑布图里 TTFB 大 vs Content Download 大，分别说明什么？

---

## 环境说明

- 只用 `node:http`，零依赖，不用 `pnpm install`
- 端口默认 3100，可用 `$env:PORT=3200` 覆盖（3000 已被其他项目占用，别用）
- Cookie 是会话级、非 Secure，仅用于本地观察
- 所有接口都带 `Cache-Control: no-store`（除刻意演示缓存的几个），避免互相干扰
