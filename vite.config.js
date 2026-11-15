import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function ensurePwaIcons() {
  const dir = path.resolve('public/icons');
  fs.mkdirSync(dir, { recursive: true });

  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };

  const buildPng = (size) => {
    const raw = Buffer.alloc(size * (1 + size * 4));
    const cx = size / 2;
    for (let y = 0; y < size; y++) {
      const row = y * (1 + size * 4);
      raw[row] = 0;
      for (let x = 0; x < size; x++) {
        const px = row + 1 + x * 4;
        const d = Math.hypot(x - cx, y - cx);
        let r = 9, g = 14, b = 26;
        if (d <= size * 0.42 && d >= size * 0.30) { r = 6; g = 182; b = 212; }
        else if (d <= size * 0.14) { r = 56; g = 189; b = 248; }
        raw[px] = r; raw[px + 1] = g; raw[px + 2] = b; raw[px + 3] = 255;
      }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    return Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw)),
      chunk('IEND', Buffer.alloc(0))
    ]);
  };

  fs.writeFileSync(path.join(dir, 'icon-192.png'), buildPng(192));
  fs.writeFileSync(path.join(dir, 'icon-512.png'), buildPng(512));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  if (env.GEMINI_MODEL && !process.env.GEMINI_MODEL) {
    process.env.GEMINI_MODEL = env.GEMINI_MODEL;
  }

  return {
    plugins: [
      react(),
      {
        name: 'said-ai-plugin',
        configResolved() {
          ensurePwaIcons();
        },
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            const chunks = [];
            for await (const ch of req) chunks.push(ch);
            try {
              req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
            } catch {
              req.body = {};
            }
            const { default: handler } = await import('./api/chat.js');
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            await handler(req, res);
          });
        }
      }
    ]
  };
});
