'use strict';

/**
 * HTTP 实验台 —— 零依赖，一条命令启动：
 *   node server.js
 * 然后打开 http://127.0.0.1:3000
 *
 * 设计原则：每个接口只演示一个 HTTP 概念，响应头尽量精简，
 * 让你在 DevTools → Network 里一眼看出"少了哪个头、发生了什么"。
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3100);
const HOST = '127.0.0.1';
const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

const CORS_ALL = { 'Access-Control-Allow-Origin': '*' };

function json(res, status, body, headers = {}) {
  const text = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(text);
}

function etagOf(text) {
  return '"' + crypto.createHash('sha1').update(text).digest('hex').slice(0, 16) + '"';
}

function route(req, res, p, u, origin) {
  // ---------- 页面 ----------
  if (p === '/' || p === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(html);
  }

  // ---------- D8 报文：无任何 CORS 头，跨域必被拦 ----------
  if (p === '/api/hello') {
    return json(res, 200, {
      msg: '你好，我是 /api/hello（本接口故意不带 CORS 头）',
      method: req.method,
      origin: origin || '(直连，无 Origin 头)',
      host: req.headers.host,
    });
  }

  // 回显全部请求头，用来观察 Origin / Referer / Cookie 这些"隐式"请求头
  if (p === '/api/headers') {
    return json(res, 200, { headers: req.headers });
  }

  // ---------- D10 CORS ----------
  if (p === '/api/cors') {
    return json(res, 200, { msg: '这个接口允许任意来源读取', yourOrigin: origin || '(无)' }, CORS_ALL);
  }

  if (p === '/api/cors-cred') {
    // 带凭据时 ACAO 必须是具体 origin，不能是 *
    const allowOrigin = origin || `http://${HOST}:${PORT}`;
    return json(
      res,
      200,
      { msg: '允许带 Cookie 的跨域请求（注意 ACAO 回显了你的 origin）', yourOrigin: origin || '(无)' },
      {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Expose-Headers': 'X-Demo-Exposed',
        'X-Demo-Exposed': '这个头默认 JS 读不到，除非 Expose-Headers 声明',
      }
    );
  }

  // 预检：浏览器在"非简单请求"前先发 OPTIONS，必须单独回复
  if (p === '/api/preflight') {
    const allow = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Demo',
      'Access-Control-Max-Age': '600',
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, allow);
      return res.end();
    }
    return json(res, 200, { msg: '带自定义头 X-Demo 的真实请求通过了', gotXDemo: req.headers['x-demo'] || null }, allow);
  }

  // ---------- D9 状态码与缓存 ----------
  if (p === '/api/redirect') {
    res.writeHead(302, { Location: '/api/hello', 'Cache-Control': 'no-store' });
    return res.end();
  }

  // 强缓存：60 秒内浏览器直接用本地副本，不发请求
  if (p === '/api/cache60') {
    return json(
      res,
      200,
      { msg: '我带了 Cache-Control: max-age=60', servedAt: new Date().toISOString() },
      { 'Cache-Control': 'public, max-age=60' }
    );
  }

  // 协商缓存（ETag）：每次都问服务器，内容没变就回 304
  if (p === '/api/etag') {
    const body = JSON.stringify({ msg: '我带了 ETag，内容不变就回 304', payload: 'v1' });
    const tag = etagOf(body);
    if (req.headers['if-none-match'] === tag) {
      res.writeHead(304, { ETag: tag, 'Cache-Control': 'no-cache' });
      return res.end();
    }
    return json(res, 200, JSON.parse(body), { ETag: tag, 'Cache-Control': 'no-cache' });
  }

  // 协商缓存（Last-Modified）：时间没变就回 304
  if (p === '/api/lastmod') {
    const lastModified = 'Wed, 01 Jan 2025 00:00:00 GMT';
    const since = req.headers['if-modified-since'];
    if (since && new Date(since) >= new Date(lastModified)) {
      res.writeHead(304, { 'Last-Modified': lastModified });
      return res.end();
    }
    return json(res, 200, { msg: '我带了 Last-Modified（固定时间）' }, { 'Last-Modified': lastModified });
  }

  // ---------- D9 Cookie ----------
  if (p === '/api/cookie') {
    return json(
      res,
      200,
      { msg: '已尝试种一个 HttpOnly Cookie（JS 的 document.cookie 读不到它）' },
      { 'Set-Cookie': ['sid=abc123; HttpOnly; SameSite=Lax; Path=/'] }
    );
  }

  // ---------- D7 瀑布 / 慢请求 ----------
  if (p === '/api/slow') {
    const ms = Number(u.searchParams.get('ms') || 2000);
    return setTimeout(() => json(res, 200, { msg: `我故意慢 ${ms}ms，看瀑布图里那根长条` }), ms);
  }

  // ---------- D8 报文：回显请求体 ----------
  if (p === '/api/echo') {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch { /* 非 JSON 就留 null */ }
      json(res, 200, { method: req.method, contentType: req.headers['content-type'] || null, raw, parsed });
    });
    return;
  }

  // ---------- 404 ----------
  return json(res, 404, { error: 'Not Found', path: p, tip: '试试 /api/hello、/api/etag、/api/cors' });
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://${req.headers.host || HOST}`);
  const origin = req.headers.origin || '';
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${u.pathname}  origin=${origin || '-'}`);
  try {
    route(req, res, u.pathname, u, origin);
  } catch (err) {
    console.error(err);
    json(res, 500, { error: String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n实验台已启动：http://${HOST}:${PORT}`);
  console.log(`跨域对照源： http://localhost:${PORT}  （主机名不同 = 不同 origin）`);
  console.log('按 Ctrl+C 停止。\n');
});
