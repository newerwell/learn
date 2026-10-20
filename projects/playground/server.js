const http = require('node:http');
const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.url === '/api/hello') {
    res.end(JSON.stringify({ msg: '你好，这是我第一个接口' }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found', path: req.url }));
  }
});
server.listen(3002, '127.0.0.1', () => console.log('http://127.0.0.1:3002'));