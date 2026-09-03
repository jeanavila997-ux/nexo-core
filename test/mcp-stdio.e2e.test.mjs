// test/mcp-stdio.e2e.test.mjs — Teste de integração: um cliente MCP real
// conversa com `node nexo.mjs serve-stdio` pelo protocolo (newline-delimited JSON-RPC).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('MCP stdio end-to-end: initialize → tools/list → tools/call (busca + dry-run de destrutivo)', async () => {
  const child = spawn(process.execPath, [join(ROOT, 'nexo.mjs'), 'serve-stdio'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const responses = [];
  let buf = '';
  const collector = new Promise((resolve) => {
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (line) {
          try { responses.push(JSON.parse(line)); } catch { /* ignora */ }
        }
      }
    });
    child.on('close', resolve);
    child.on('error', resolve);
  });
  child.stderr.resume();

  const send = (m) => child.stdin.write(JSON.stringify(m) + '\n');
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'e2e', version: '0' } } });
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'catalog_search', arguments: { q: 'limpar temp', limit: 3 } } });
  send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'catalog_run', arguments: { id: 'limpeza_profunda_tudo', dry_run: true } } });
  send({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'catalog_run', arguments: { id: 'limpeza_profunda_tudo' } } });

  const deadline = Date.now() + 30000;
  const withId = () => responses.filter((r) => r && (r.id !== null && r.id !== undefined));
  while (withId().length < 5 && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 150));
  }
  child.kill();
  await Promise.race([collector, new Promise((r) => setTimeout(r, 2000))]);

  const byId = new Map(withId().map((r) => [r.id, r]));
  const init = byId.get(1);
  assert.ok(init?.result?.serverInfo, 'initialize deve responder serverInfo');
  assert.equal(init.result.serverInfo.name, 'nexo-core');

  const tools = byId.get(2)?.result?.tools ?? [];
  assert.ok(tools.some((t) => t.name === 'catalog_search'), 'tools/list deve expor catalog_search');
  assert.ok(tools.some((t) => t.name === 'agent_run'), 'tools/list deve expor agent_run');
  assert.ok(!tools.some((t) => t.name === 'shell_run'), 'shell_run não deve existir com política catalog_only');

  const search = byId.get(3)?.result;
  assert.ok(search, 'tools/call catalog_search deve responder');
  assert.equal(search.isError, false);
  assert.match(search.content[0].text, /limpar_temp_usuario/);

  const dry = byId.get(4)?.result;
  assert.ok(dry, 'tools/call dry_run deve responder');
  assert.match(dry.content[0].text, /DRY-RUN/);
  assert.match(dry.content[0].text, /Prefetch/);

  const blocked = byId.get(5)?.result;
  assert.ok(blocked, 'tools/call destrutivo sem confirm deve responder');
  assert.equal(blocked.isError, true);
  assert.match(blocked.content[0].text, /DESTRUTIVO/);
});
