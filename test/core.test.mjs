import test from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../src/core/memory.mjs';
import { Skills, parseFrontmatter } from '../src/core/skills.mjs';
import { Audit, maskSensitive, sha256 } from '../src/core/audit.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

function tmpDir() {
  const d = join(tmpdir(), 'nexo-test-' + randomUUID().slice(0, 8));
  mkdirSync(d, { recursive: true });
  return d;
}

test('Memory add/search/clear', () => {
  const m = new Memory(tmpDir());
  m.add('O usuário prefere limpeza não-destrutiva', ['preferencia']);
  m.add('Modelo padrão é gemma4', ['ollama']);
  const hits = m.search('limpeza não-destrutiva');
  assert.equal(hits.length, 1);
  assert.match(hits[0].content, /não-destrutiva/);
  assert.equal(m.search('nada_disso_aqui').length, 0);
  assert.equal(m.all().length, 2);
  m.clear();
  assert.equal(m.all().length, 0);
});

test('Memory exige conteúdo', () => {
  const m = new Memory(tmpDir());
  assert.throws(() => m.add('   '));
});

test('parseFrontmatter extrai name/description/corpo', () => {
  const { meta, body } = parseFrontmatter('---\nname: x\nDescription: "Faz Y"\n---\n\n# Corpo\nTexto.');
  assert.equal(meta.name, 'x');
  assert.equal(meta.description, 'Faz Y');
  assert.match(body, /# Corpo/);
});

test('Skills list/read (progressive disclosure)', () => {
  const dir = tmpDir();
  const skillDir = join(dir, 'minha-skill');
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, 'SKILL.md'), '---\nname: minha-skill\ndescription: testa skills\n---\n corpo completo aqui', 'utf8');
  const s = new Skills(dir);
  const list = s.list();
  assert.equal(list.length, 1);
  assert.equal(list[0].name, 'minha-skill');
  assert.equal(list[0].description, 'testa skills');
  const full = s.read('minha-skill');
  assert.match(full.body, /corpo completo aqui/);
  assert.equal(s.read('inexistente'), null);
});

test('maskSensitive mascara e preserva hash sha256', () => {
  const out = maskSensitive({ api_key: 'abc123', password: 's3nh4', nome: 'joao', nested: { authToken: 'zz' } });
  assert.equal(out.api_key.masked, '****');
  assert.equal(out.api_key.sha256, sha256('abc123'));
  assert.equal(out.password.masked, '****');
  assert.equal(out.nome, 'joao');
  assert.equal(out.nested.authToken.masked, '****');
});

test('Audit log/tail com máscara', () => {
  const dir = tmpDir();
  const a = new Audit(join(dir, 'audit.jsonl'));
  a.log({ tool: 'catalog_run', args: { id: 'x', token: 'segredo' }, ok: true, ms: 5, summary: 'ok' });
  const tail = a.tail(10);
  assert.equal(tail.length, 1);
  assert.equal(tail[0].args.token.masked, '****');
  assert.equal(tail[0].args.id, 'x');
});
