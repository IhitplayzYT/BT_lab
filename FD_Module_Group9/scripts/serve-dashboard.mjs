import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../artifacts/dashboard');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  if (!['GET', 'POST', 'PUT'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const route = new URL(req.url, 'http://localhost');
  if (route.pathname.startsWith('/api/')) {
    const port = route.pathname.startsWith('/api/admin/') ? Number(process.env.BATCH_API_PORT || 8081) : route.pathname.startsWith('/api/statements/') ? Number(process.env.STATEMENT_API_PORT || 8082) : Number(process.env.FD_API_PORT || 8080);
    const upstream = http.request({ hostname: '127.0.0.1', port, path: req.url, method: req.method, headers: { ...req.headers, host: `127.0.0.1:${port}` } }, response => {
      res.writeHead(response.statusCode, response.headers); response.pipe(res);
    });
    upstream.setTimeout(15000, () => upstream.destroy(new Error('Backend timeout')));
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' }); res.end('{"message":"Backend unavailable"}'); });
    req.pipe(upstream); return;
  }
  if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
  let requested;
  try { requested = decodeURIComponent(route.pathname); } catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(4200, '127.0.0.1', () => console.log('Dashboard: http://localhost:4200. Ctrl+C stops this local server.'));
