// Guardas do transporte HTTP: bind, Host, Origin, content-type e token.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { serveHttp } from '../src/mcp/http.mjs';

const fakeServer = {
  handle: async (m) => ({ jsonrpc: '2.0', id: m.id, result: { ok: true } }),
};

// usa node:http (permite fixar Host e Origin, o que o fetch não deixa)
function call(port, { headers = {}, body = '{"jsonrpc":"2.0","id":1,"method":"ping"}', path = '/mcp', method = 'POST' } = {}) {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: '127.0.0.1', port, path, method, headers: { host: `127.0.0.1:${port}`, 'content-type': 'application/json', ...headers } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      },
    );
    req.on('error', reject);
    if (method === 'POST') req.end(body);
    else req.end();
  });
}

test('bind fora do loopback sem token é recusado', async () => {
  await assert.rejects(serveHttp(fakeServer, { port: 0, host: '0.0.0.0', token: '' }), /NEXO_MCP_TOKEN/);
});

test('loopback sem token: JSON ok; text/plain 415; Host hostil 403; Origin hostil 403', async () => {
  const srv = await serveHttp(fakeServer, { port: 0, host: '127.0.0.1', token: '' });
  const port = srv.address().port;
  try {
    assert.equal((await call(port)).status, 200);
    assert.equal((await call(port, { headers: { 'content-type': 'text/plain' } })).status, 415);
    assert.equal((await call(port, { headers: { host: 'evil.com' } })).status, 403);
    assert.equal((await call(port, { headers: { origin: 'http://evil.com' } })).status, 403);
    // origem igual ao host é aceita
    assert.equal((await call(port, { headers: { origin: `http://127.0.0.1:${port}` } })).status, 200);
    // health continua aberto
    assert.equal((await call(port, { method: 'GET', path: '/health' })).status, 200);
  } finally {
    srv.close();
  }
});

test('com token: sem Bearer 401; Bearer errado 401; Bearer certo 200', async () => {
  const token = 'token-de-teste-0123456789';
  const srv = await serveHttp(fakeServer, { port: 0, host: '127.0.0.1', token });
  const port = srv.address().port;
  try {
    assert.equal((await call(port)).status, 401);
    assert.equal((await call(port, { headers: { authorization: 'Bearer errado' } })).status, 401);
    assert.equal((await call(port, { headers: { authorization: `Bearer ${token}` } })).status, 200);
  } finally {
    srv.close();
  }
});
