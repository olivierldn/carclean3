const http = require('http');
const fs   = require('fs');
const path = require('path');

const port = parseInt(process.env.PORT || '3457', 10);
const root = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.txt':  'text/plain',
  '.json': 'application/json',
};

http.createServer((req, res) => {
  const url  = req.url.split('?')[0];
  const file = url === '/' ? 'index.html' : url;
  const fp   = path.join(root, file);

  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + file);
      return;
    }
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log('OLI Valet dev server on port ' + port);
});
