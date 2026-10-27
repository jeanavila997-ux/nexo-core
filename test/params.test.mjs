import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveCommand, mergeCatalog, placeholdersOf, Catalog } from '../src/core/catalog.mjs';
import { buildTools } from '../src/core/tools.mjs';
import { Policy } from '../src/core/permissions.mjs';

const pack = JSON.parse(readFileSync(new URL('../data/catalog/packs/rea-dev-pack.json', import.meta.url), 'utf8'));
const templates = pack.commands.filter((c) => c.params);

const VALIDOS = {
  arquivo: 'src/app.py', caminho: 'C:\\Logs\\app.log', pasta: 'C:\\Projetos\\mestre', branch: 'feat/rea-pack',
  imagem: 'nginx:1.27-alpine', container: 'meu-app_1', alvo: 'redis:7', nome: 'rede-lab', pacote: '@types/node',
  pid: '4321', url: 'https://exemplo.com/status', texto: 'erro de conexão', filtro: '*.py', nome_servico: 'Spooler',
  linhas: '200', nome_modelo: 'nomic-embed-text', tag: 'v1.2.0',
};
const ATAQUES = ['x"; Remove-Item C:\\ -Recurse #', 'a$(whoami)', 'a`n calc', 'a | calc', 'a & calc',
  '..\\..\\Windows\\System32\\config', 'https://x.com/?a=1&b=2', 'a;b', "a'b", 'a\nb', ''];

test('pacote: todo comando parametrizado declara exatamente os placeholders que usa', () => {
  assert.ok(templates.length >= 30);
  for (const c of pack.commands) {
    const declared = Object.keys(c.params ?? {}).map((k) => k.toUpperCase()).sort();
    assert.deepEqual(placeholdersOf(c.cmd).sort(), declared, c.id);
  }
});

test('pacote: valores válidos resolvem e não sobra placeholder', () => {
  for (const t of templates) {
    const params = Object.fromEntries(Object.keys(t.params).map((k) => [k, VALIDOS[k]]));
    const r = resolveCommand(t, params);
    assert.equal(r.ok, true, `${t.id}: ${r.error}`);
    assert.equal(placeholdersOf(r.cmd).length, 0);
  }
});

test('pacote: injeção, traversal e metacaracteres são rejeitados em TODO parâmetro', () => {
  for (const t of templates) {
    const ok = Object.fromEntries(Object.keys(t.params).map((k) => [k, VALIDOS[k]]));
    for (const k of Object.keys(t.params)) for (const a of ATAQUES) {
      assert.equal(resolveCommand(t, { ...ok, [k]: a }).ok, false, `${t.id}.${k} aceitou ${JSON.stringify(a)}`);
    }
  }
});

test('modelos :cloud são bloqueados (dado privado não sai da máquina)', () => {
  const t = templates.find((c) => c.id === 'ollama_gerar_embedding');
  assert.equal(resolveCommand(t, { nome_modelo: 'qwen3-coder:cloud', texto: 'oi' }).ok, false);
});

test('comando legado com {{PLACEHOLDER}} sem params NÃO executa literal', () => {
  const r = resolveCommand({ id: 'encerrar_processo', cmd: 'Stop-Process -Name "{{NOME}}"' }, {});
  assert.equal(r.ok, false);
  assert.match(r.error, /sem definição segura/);
});

test('mergeCatalog é idempotente e não sobrescreve outra origem', () => {
  const base = [{ id: 'a', title: 'A', category: 'X', cmd: 'a', source: '127.xlsx' }];
  const r1 = mergeCatalog(base, [{ id: 'b', title: 'B', category: 'X', cmd: 'b' }], 'p');
  const r2 = mergeCatalog(r1.commands, [{ id: 'b', title: 'B', category: 'X', cmd: 'b' }], 'p');
  assert.equal(r2.commands.length, 2);
  assert.equal(r2.updated, 1);
  assert.throws(() => mergeCatalog(base, [{ id: 'a', title: 'A2', category: 'X', cmd: 'z' }], 'p'), /já existe/);
});

test('catalog_run: params no dry-run e gate destrutivo continua exigindo confirm', async () => {
  const catalog = new Catalog('/tmp/x.json');
  catalog.commands = pack.commands;
  catalog.byId = new Map(pack.commands.map((c) => [c.id, c]));
  const tools = buildTools({ catalog, policy: new Policy(), memory: null, skills: null, audit: null });
  const run = tools.get('catalog_run').handler;

  const dry = await run({ id: 'tamanho_de_pasta', params: { pasta: 'C:\\Projetos' }, dry_run: true });
  assert.equal(dry.ok, true);
  assert.match(dry.text, /C:\\Projetos/);

  const sem = await run({ id: 'tamanho_de_pasta', dry_run: true });
  assert.equal(sem.ok, false);
  assert.match(sem.text, /Falta o parâmetro 'pasta'/);

  const ataque = await run({ id: 'tamanho_de_pasta', params: { pasta: 'C:\\x"; calc #' }, dry_run: true });
  assert.equal(ataque.ok, false);

  const destr = await run({ id: 'encerrar_processo_por_pid', params: { pid: '4321' } });
  assert.equal(destr.ok, false);
  assert.match(destr.text, /DESTRUTIVO/);
  assert.match(destr.text, /4321/); // o gate mostra o comando JÁ resolvido
});
