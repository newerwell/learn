/**
 * 任务 API 的 mock 服务 —— 阶段 2（React）用
 *
 * 启动：node labs/mock-tasks-api/server.mjs
 * 端口：3200（3000 被本机 qqagent 占用，3100 是 HTTP 实验台）
 *
 * 设计目标：
 *  - 数据存在内存里，重启即重置（不用担心"数据改坏了"）
 *  - 默认每个请求延迟 300ms，让 loading 态真的看得见
 *  - 提供 /api/error 和 /api/slow，方便测错误态与超时
 *  - 带 CORS 头与 OPTIONS 处理，Vite（5173/5174）能直接跨域调用
 */

import http from 'node:http';

const PORT = Number(process.env.PORT || 3200);
const LATENCY = Number(process.env.LATENCY ?? 300);
const HOST = '127.0.0.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

let seq = 1;
const now = () => new Date().toISOString();

const db = Array.from({ length: 25 }, (_, i) => ({
  id: `t_${seq++}`,
  title: `任务 ${String(i + 1).padStart(2, '0')}`,
  done: i % 3 === 0,
  dueAt: i % 4 === 0 ? new Date(Date.now() + i * 86_400_000).toISOString() : null,
  tags: i % 2 ? ['work'] : ['life', 'urgent'],
  createdAt: now(),
}));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function send(res, status, body, extra = {}) {
  const text = body === undefined ? '' : JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    ...CORS,
    ...extra,
  });
  res.end(text);
}

function fail(res, status, code, message, details = {}) {
  send(res, status, { code, message, details });
}

function isJsonObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizedTitle(res, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(res, 422, 'TITLE_REQUIRED', 'title 不能为空', { field: 'title' });
    return null;
  }
  if (value.length > 200) {
    fail(res, 422, 'TITLE_TOO_LONG', 'title 不能超过 200 字', { field: 'title' });
    return null;
  }
  return value.trim();
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return undefined; // 解析失败
  }
}

function findTask(id) {
  return db.find((t) => t.id === id);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? HOST}`);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${url.pathname}${url.search}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  await sleep(LATENCY);

  // ---------- 任务集合 ----------
  if (pathname === '/api/tasks' && req.method === 'GET') {
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? 10)));
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const doneParam = url.searchParams.get('done'); // 'true' | 'false' | null

    let rows = db;
    if (q) rows = rows.filter((t) => t.title.toLowerCase().includes(q));
    if (doneParam === 'true') rows = rows.filter((t) => t.done);
    if (doneParam === 'false') rows = rows.filter((t) => !t.done);

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    return send(res, 200, { items, total, page, pageSize });
  }

  if (pathname === '/api/tasks' && req.method === 'POST') {
    const body = await readJson(req);
    if (body === undefined) return fail(res, 400, 'INVALID_JSON', '请求体不是合法 JSON');
    if (!isJsonObject(body)) return fail(res, 400, 'INVALID_BODY', '请求体必须是 JSON 对象');
    const title = normalizedTitle(res, body.title);
    if (title === null) return;

    const task = {
      id: `t_${seq++}`,
      title,
      done: Boolean(body.done),
      dueAt: body.dueAt ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: now(),
    };
    db.unshift(task);
    return send(res, 201, task, { Location: `/api/tasks/${task.id}` });
  }

  // ---------- 单个任务 ----------
  const match = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    const task = findTask(id);

    if (!task) return fail(res, 404, 'TASK_NOT_FOUND', `任务 ${id} 不存在`, { id });

    if (req.method === 'GET') return send(res, 200, task);

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      if (body === undefined) return fail(res, 400, 'INVALID_JSON', '请求体不是合法 JSON');
      if (!isJsonObject(body)) return fail(res, 400, 'INVALID_BODY', '请求体必须是 JSON 对象');
      if ('title' in body) {
        const title = normalizedTitle(res, body.title);
        if (title === null) return;
        task.title = title;
      }
      if ('done' in body) task.done = Boolean(body.done);
      if ('dueAt' in body) task.dueAt = body.dueAt ?? null;
      if ('tags' in body) task.tags = Array.isArray(body.tags) ? body.tags : [];
      return send(res, 200, task);
    }

    if (req.method === 'DELETE') {
      const i = db.indexOf(task);
      db.splice(i, 1);
      res.writeHead(204, CORS);
      return res.end();
    }

    return fail(res, 405, 'METHOD_NOT_ALLOWED', `不支持 ${req.method}`);
  }

  // ---------- 故意失败 / 故意慢 ----------
  if (pathname === '/api/error') {
    const status = Number(url.searchParams.get('status') ?? 500);
    return fail(res, status, 'DEMO_ERROR', `这是我故意返回的 ${status}`);
  }

  if (pathname === '/api/slow') {
    const ms = Number(url.searchParams.get('ms') ?? 3000);
    await sleep(ms);
    return send(res, 200, { msg: `慢响应 ${ms}ms 结束`, at: now() });
  }

  return fail(res, 404, 'NOT_FOUND', `没有这个接口：${pathname}`);
});

server.listen(PORT, HOST, () => {
  console.log(`\nmock API 已启动：http://${HOST}:${PORT}`);
  console.log(`数据量 ${db.length} 条，延迟 ${LATENCY}ms（可用 LATENCY=0 关闭）`);
  console.log('试试：http://127.0.0.1:3200/api/tasks?page=1&pageSize=5\n');
});
