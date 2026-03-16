import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.json': 'application/json',
};

createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const file = join(__dirname, url);
  if (existsSync(file)) {
    const ext = extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(readFileSync(file));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + url);
  }
}).listen(PORT, () => {
  console.log(`\n  ✦ Homis dev server\n  → http://localhost:${PORT}\n`);
});
