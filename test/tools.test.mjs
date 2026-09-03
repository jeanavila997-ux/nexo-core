import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools } from '../src/core/tools.mjs';
import { Catalog } from '../src/core/catalog.mjs';
import { Policy } from '../src/core/permissions.mjs';
import { Memory } from '../src/core/memory.mjs';
import { Skills } from '../src/core/skills.mjs';
import { Audit } from '../src/core/audit.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';

function tmpDir() {
  const d = join(tmpdir(), 'nexo-test-' + randomUUID().slice(0, 8));
  mkdirSync(d, { recursive: true });
  return d;
}

function core({ policy = new Policy() } = {}) {
  const catalog = new Catalog('/tmp/x.json');
  catalog.commands = [
    { id: 'ver_ram', title: 'Ver Uso de RAM', category: 'Memória', cmd: 'Get-RAM', destructive: false },
    { id: 'limpar_tudo', title: 'Limpeza Profunda', category: 'Limpeza', cmd: 'rm tudo', destructive: true },
  ];
  catalog.byId = new Map(catalog.commands.map((c) => [c.id, c]));
  const memory = new Memory(tmpDir());
  const skills = new Skills(tmpDir());
  const auditDir = tmpDir();
  const audit = new Audit(join(auditDir, 'audit.jsonl'));
  const tools = buildTools({ catalog, policy, memory, skills, audit });
  return { catalog, policy, memory, skills, audit, tools, auditFile: join(auditDir, 'audit.jsonl') };
}

test('catalog_search devolve resultados ranqueados', async () => {
  const { tools } = core();
  const r = await tools.get('catalog_search').handler({ q: 'ram' });
  assert.equal(r.ok, true);
  assert.match(r.text, /ver_ram/);
});

test('catalog_search sem resultados sugere próximos passos', async () => {
  const { tools } = core();
  const r = await tools.get('catalog_search').handler({ q: 'zzz_inexistente' });
  assert.equal(r.ok, false);
  assert.match(r.text, /catalog_categories/);
});

test('catalog_run destrutivo BLOQUEIA sem confirm e explica como confirmar', async () => {
  const { tools } = core();
  const r = await tools.get('catalog_run').handler({ id: 'limpar_tudo' });
  assert.equal(r.ok, false);
  assert.match(r.text, /DESTRUTIVO/);
  assert.match(r.text, /confirm/);
});

test('catalog_run dry_run NÃO executa e devolve o comando', async () => {
  const { tools } = core();
  const r = await tools.get('catalog_run').handler({ id: 'limpar_tudo', dry_run: true });
  assert.equal(r.ok, true);
  assert.match(r.text, /DRY-RUN/);
  assert.match(r.text, /rm tudo/);
});

test('catalog_run id inexistente orienta busca', async () => {
  const { tools } = core();
  const r = await tools.get('catalog_run').handler({ id: 'nao_existe' });
  assert.equal(r.ok, false);
  assert.match(r.text, /catalog_search/);
});

test('catalog_run não-destrutivo executa de verdade e audita', async () => {
  const { tools, auditFile } = core();
  const r = await tools.get('catalog_run').handler({ id: 'ver_ram' });
  // Get-RAM não existe: o pwsh deve falhar — mas o resultado é estruturado e auditado
  assert.match(r.text, /exit_code/);
  const audit = readFileSync(auditFile, 'utf8');
  assert.match(audit, /catalog_run/);
});

test('memory_save + memory_search redondam', async () => {
  const { tools } = core();
  await tools.get('memory_save').handler({ content: 'prefiro backups diários', tags: ['ops'] });
  const r = await tools.get('memory_search').handler({ q: 'backups' });
  assert.equal(r.ok, true);
  assert.match(r.text, /backups diários/);
});

test('skill_read inexistente lista as disponíveis', async () => {
  const { tools } = core();
  const r = await tools.get('skill_read').handler({ name: 'nada' });
  assert.equal(r.ok, false);
  assert.match(r.text, /nenhuma/);
});

test('shell_run NÃO existe com política catalog_only', () => {
  const { tools } = core();
  assert.equal(tools.has('shell_run'), false);
});

test('shell_run existe com política open', () => {
  const { tools } = core({ policy: new Policy({ shell_mode: 'open' }) });
  assert.equal(tools.has('shell_run'), true);
});

test('agent_run só existe quando agentRunner é injetado', () => {
  const c1 = core();
  assert.equal(c1.tools.has('agent_run'), false);
  const c2 = core();
  const tools2 = buildTools({ ...c2, agentRunner: async () => ({ ok: true, answer: 'x' }) });
  assert.equal(tools2.has('agent_run'), true);
});

test('executor real: dry_run não executa nada', async () => {
  const { tools } = core();
  const r = await tools.get('catalog_run').handler({ id: 'ver_ram', dry_run: true });
  assert.match(r.text, /DRY-RUN/);
});
