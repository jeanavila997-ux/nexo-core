import test from 'node:test';
import assert from 'node:assert/strict';
import { createMcpServer } from '../src/mcp/server.mjs';
import { buildTools } from '../src/core/tools.mjs';
import { Catalog } from '../src/core/catalog.mjs';
import { Policy } from '../src/core/permissions.mjs';
import { Memory } from '../src/core/memory.mjs';
import { Skills } from '../src/core/skills.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';

function tmpDir() {
  const d = join(tmpdir(), 'nexo-test-' + randomUUID().slice(0, 8));
  mkdirSync(d, { recursive: true });
  return d;
}

function makeServer() {
  const catalog = new Catalog('/tmp/x.json');
  catalog.commands = [{ id: 'ver_ram', title: 'Ver RAM', category: 'Memória', cmd: 'Get-RAM', destructive: false }];
  catalog.byId = new Map([['ver_ram', catalog.commands[0]]]);
  const tools = buildTools({
    catalog,
    policy: new Policy(),
    memory: new Memory(tmpDir()),
    skills: new Skills(tmpDir()),
    audit: null,
  });
  const resources = [
    { uri: 'nexo://catalog', name: 'Catálogo', mimeType: 'application/json', read: async () => JSON.stringify(catalog.commands) },
  ];
  return createMcpServer({ tools, resources });
}

test('initialize negocia versão e declara capacidades', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } } });
  assert.equal(r.result.protocolVersion, '2025-06-18');
  assert.equal(r.result.serverInfo.name, 'nexo-core');
  assert.ok(r.result.capabilities.tools);
});

test('initialize com versão desconhecida cai no default suportado', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '1999-01-01' } });
  assert.equal(r.result.protocolVersion, '2025-06-18');
});

test('tools/list expõe nome, descrição e schema', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const names = r.result.tools.map((t) => t.name);
  assert.ok(names.includes('catalog_search'));
  assert.ok(names.includes('catalog_run'));
  assert.ok(!names.includes('shell_run')); // política catalog_only
  const cs = r.result.tools.find((t) => t.name === 'catalog_search');
  assert.ok(cs.inputSchema.properties.q);
});

test('tools/call executa tool e devolve conteúdo texto', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'catalog_search', arguments: { q: 'ram' } } });
  assert.equal(r.result.content[0].type, 'text');
  assert.match(r.result.content[0].text, /ver_ram/);
  assert.equal(r.result.isError, false);
});

test('tools/call com tool desconhecida → erro JSON-RPC -32602', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'nao_existe' } });
  assert.equal(r.error.code, -32602);
});

test('tools/call com parâmetro obrigatório ausente → isError acionável', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'catalog_get', arguments: {} } });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /id/);
});

test('tools/call que falha internamente → isError (não JSON-RPC error)', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'catalog_search', arguments: { q: 'zzz_nada' } } });
  assert.equal(r.result.isError, true);
});

test('notifications não geram resposta', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(r, null);
});

test('método desconhecido → -32601', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 7, method: 'prompts/list' });
  assert.equal(r.error.code, -32601);
});

test('resources/list e resources/read', async () => {
  const s = makeServer();
  const list = await s.handle({ jsonrpc: '2.0', id: 8, method: 'resources/list' });
  assert.equal(list.result.resources[0].uri, 'nexo://catalog');
  const read = await s.handle({ jsonrpc: '2.0', id: 9, method: 'resources/read', params: { uri: 'nexo://catalog' } });
  assert.match(read.result.contents[0].text, /ver_ram/);
  const bad = await s.handle({ jsonrpc: '2.0', id: 10, method: 'resources/read', params: { uri: 'nexo://nao' } });
  assert.equal(bad.error.code, -32602);
});

test('ping responde vazio', async () => {
  const s = makeServer();
  const r = await s.handle({ jsonrpc: '2.0', id: 11, method: 'ping' });
  assert.deepEqual(r.result, {});
});
