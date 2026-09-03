// src/mcp/http.mjs — Transporte MCP sobre HTTP (POST /mcp, JSON-RPC direto).
// Binda apenas em 127.0.0.1: núcleo headless local, sem exposição de rede.
import { createServer } from 'node:http';

export function serveHttp(server, { port = 8787, host = '127.0.0.1', version = '0.1.0' } = {}) {
  return new Promise((resolve, reject) => {
    const srv = createServer(async (req, res) => {
      const send = (code, body) => {
        res.writeHead(code, { 'content-type': 'application/json' });
        res.end(JSON.stringify(body));
      };
      if (req.method === 'GET' && req.url === '/health') {
        return send(200, { ok: true, server: 'nexo-core', version });
      }
      if (req.method === 'POST' && (req.url === '/mcp' || req.url === '/')) {
        let body = '';
        req.on('data', (d) => { body += d; if (body.length > 1e6) req.destroy(); });
        req.on('end', async () => {
          let msgs;
          try {
            const parsed = JSON.parse(body || '{}');
            msgs = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return send(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON inválido' } });
          }
          const isBatch = Array.isArray(JSON.parse(body));
          const responses = [];
          for (const m of msgs) {
            const r = await server.handle(m);
            if (r) responses.push(r);
          }
          if (!responses.length) return send(202, {});
          return send(200, isBatch ? responses : responses[0]);
        });
        return;
      }
      return send(404, { error: `rota desconhecida: ${req.method} ${req.url}` });
    });
    srv.on('error', reject);
    srv.listen(port, host, () => resolve(srv));
  });
}
