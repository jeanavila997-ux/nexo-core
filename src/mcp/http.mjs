// src/mcp/http.mjs — Transporte MCP sobre HTTP (POST /mcp, JSON-RPC direto).
//
// Padrão: 127.0.0.1 (núcleo local). Fora do loopback é OBRIGATÓRIO um token
// (NEXO_MCP_TOKEN, 16+ caracteres) — o servidor recusa subir sem ele.
// Guardas em toda rota: Host (anti DNS rebinding), Origin (anti CSRF de
// navegador), content-type JSON em POST e Authorization: Bearer quando há token.
import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1']);

function tokenMatches(given, expected) {
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function serveHttp(
  server,
  {
    port = 8787,
    host = '127.0.0.1',
    version = '0.1.0',
    token = process.env.NEXO_MCP_TOKEN || '',
  } = {},
) {
  const loopback = LOOPBACK.has(host);
  if (!loopback && token.length < 16) {
    return Promise.reject(
      new Error('bind fora do loopback exige NEXO_MCP_TOKEN com 16+ caracteres (ou use host 127.0.0.1)'),
    );
  }
  const wildcard = host === '0.0.0.0' || host === '::';

  return new Promise((resolve, reject) => {
    const srv = createServer(async (req, res) => {
      const send = (code, body) => {
        res.writeHead(code, { 'content-type': 'application/json' });
        res.end(JSON.stringify(body));
      };

      // health: sem token, sem dados sensíveis
      if (req.method === 'GET' && req.url === '/health') {
        return send(200, { ok: true, server: 'nexo-core', version });
      }

      // ---- guardas ----
      const p = srv.address()?.port ?? port;
      const allowedHosts = new Set([`localhost:${p}`, `127.0.0.1:${p}`, `[::1]:${p}`]);
      if (!loopback && !wildcard) allowedHosts.add(`${host}:${p}`);
      // bind amplo + token: o Host é o IP da LAN; o token é o portão
      const hostOk = allowedHosts.has(req.headers.host ?? '') || (wildcard && token);
      if (!hostOk) return send(403, { error: 'host não permitido' });

      if (req.headers.origin) {
        let origin = '';
        try { origin = new URL(req.headers.origin).host; } catch { origin = ''; }
        if (origin !== req.headers.host) return send(403, { error: 'origem não permitida' });
      }

      if (token) {
        const auth = String(req.headers.authorization ?? '');
        const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!tokenMatches(given, token)) {
          res.setHeader('www-authenticate', 'Bearer');
          return send(401, { error: 'token ausente ou inválido (Authorization: Bearer)' });
        }
      }

      if (req.method === 'POST' && (req.url === '/mcp' || req.url === '/')) {
        if (!String(req.headers['content-type'] ?? '').includes('application/json')) {
          return send(415, { error: 'use content-type: application/json' });
        }
        let body = '';
        req.on('data', (d) => { body += d; if (body.length > 1e6) req.destroy(); });
        req.on('end', async () => {
          let parsed;
          try {
            parsed = JSON.parse(body || '{}');
          } catch {
            return send(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON inválido' } });
          }
          const isBatch = Array.isArray(parsed);
          const msgs = isBatch ? parsed : [parsed];
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
