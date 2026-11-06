import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Catalog } from '../src/core/catalog.mjs';
import { Skills } from '../src/core/skills.mjs';

const root = join(import.meta.dirname, '..');
const indexPath = join(root, 'NEXO_LIBRARY.md');
const index = readFileSync(indexPath, 'utf8');

function cmp(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function parseIndex(text) {
  const cats = [];
  let current = null;
  for (const line of text.split(/\n/)) {
    const cat = line.match(/^## Categoria (\d+) — (.+)$/);
    if (cat) {
      current = { n: Number(cat[1]), label: cat[2], items: [] };
      cats.push(current);
      continue;
    }
    const item = line.match(/^### (\d+)\.(\d+) (.+)$/);
    if (item) {
      assert.ok(current, `item sem categoria: ${line}`);
      current.items.push({
        cat: Number(item[1]),
        sub: Number(item[2]),
        title: item[3],
      });
    }
  }
  return cats;
}

const expected = [
  ['Cloudflare', 7],
  ['Comandos', 24],
  ['Engenharia reversa', 1],
  ['Hyperframes', 8],
  ['LLMs', 4],
  ['Obsidian', 9],
  ['Plugins', 6],
  ['Prompts', 23],
  ['Referências', 17],
  ['Repositórios traders', 3],
  ['Segurança', 8],
  ['Skills', 31],
  ['Terminais', 9],
];

test('índice categorizado: ordem, numeração e contagem', () => {
  const cats = parseIndex(index);
  assert.deepEqual(cats.map((c) => [c.label, c.items.length]), expected);
  assert.deepEqual(
    cats.map((c) => c.label),
    [...cats.map((c) => c.label)].sort(cmp),
  );
  cats.forEach((cat, i) => {
    assert.equal(cat.n, i + 1);
    const titles = cat.items.map((it) => it.title);
    assert.deepEqual(titles, [...titles].sort(cmp));
    cat.items.forEach((it, j) => {
      assert.equal(it.cat, cat.n);
      assert.equal(it.sub, j + 1);
    });
  });
  const table = [...index.matchAll(/^\| (\d+) \| ([^|]+?) \| (\d+) \|$/gm)]
    .filter((m) => m[2] !== 'Categoria')
    .map((m) => [Number(m[1]), m[2], Number(m[3])]);
  assert.deepEqual(table, expected.map(([label, n], i) => [i + 1, label, n]));
});

test('rótulos pedidos continuam distintos', () => {
  const labels = parseIndex(index).map((c) => c.label);
  for (const label of ['Skills', 'Repositórios traders', 'Engenharia reversa']) {
    assert.equal(labels.filter((l) => l === label).length, 1);
  }
});

test('estado lido, sem instalação e sem URLs repetidas no índice', () => {
  const estados = [...index.matchAll(/^- Estado: (.+)$/gm)].map((m) => m[1]);
  const items = parseIndex(index).reduce((n, c) => n + c.items.length, 0);
  assert.equal(estados.length, items);
  assert.deepEqual([...new Set(estados)], ['documentação lida']);
  assert.equal(index.includes('pip install'), false);
  assert.equal(index.includes('git clone'), false);
  assert.equal(index.includes('Ghidra'), false);
  assert.equal(index.includes('disassembly'), false);
  const urls = [...index.matchAll(/https?:\/\/[^\s)]+/g)].map((m) => m[0].replace(/[.,;:]+$/, ''));
  const dup = urls.filter((u, i) => urls.indexOf(u) !== i);
  assert.deepEqual([...new Set(dup)], []);
});

test('links internos do índice existem e a biblioteca antiga permanece', () => {
  const links = [...index.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1]);
  const local = links.filter((href) => !/^https?:\/\//.test(href));
  assert.ok(local.length > 0);
  for (const href of local) {
    assert.equal(existsSync(join(root, href)), true, href);
  }
  const fontes = [
    'prompts/analise-tendencias.md',
    'prompts/attacking-ai.md',
    'prompts/blue-team.md',
    'prompts/hackbots-agentes.md',
    'prompts/pesquisa-hacking.md',
    'prompts/red-team-recon.md',
    'comandos/blue-team.md',
    'comandos/kali-ferramentas.md',
    'comandos/linux.md',
    'comandos/recon-kali.md',
    'comandos/ubuntu.md',
    'skills/claude-skills.md',
    'skills/kimi-habilidades.md',
    'llms/claude-code.md',
    'llms/gemini.md',
    'terminais/agenticos-tui.md',
    'obsidian/comandos.md',
    'cloudflare/comandos.md',
    'seguranca/studio-de-seguranca.md',
    'referencias/sites.md',
    'hyperframes/hyper-setup.md',
    'SECURITY_LIBRARY.md',
    '.deploy/ideias-referencias.md',
    'data/skills/manutencao-windows/SKILL.md',
    'data/skills/relatorio-sistema/SKILL.md',
  ];
  for (const fonte of fontes) {
    assert.equal(index.includes(fonte), true, fonte);
    assert.equal(existsSync(join(root, fonte)), true, fonte);
  }
  assert.equal(existsSync(join(root, 'plugins')), false);
});

test('URLs que já existiam continuam nos arquivos de origem', () => {
  const sites = readFileSync(join(root, 'referencias/sites.md'), 'utf8');
  const anteriores = [
    'https://arcanum-sec.com',
    'https://github.com/trimstray/the-book-of-secret-knowledge',
    'https://portswigger.net/web-security',
    'https://github.com/alirezarezvani/claude-skills',
    'https://github.com/avila2026/MULT-CHAT-HUB',
    'https://github.com/jeanavila997-ux/nexo-core',
    'https://github.com/jeanavila997-ux/Mestre-do-PC-V10',
    'https://github.com/jeanavila997-ux/materia-medica',
    'https://tenor.com/pt-BR/explore/internet',
    'https://fliphtml5.com',
    'https://hackthebox.com',
    'https://tryhackme.com',
    'https://picoctf.org',
    'https://ollama.com',
    'https://huggingface.co',
  ];
  for (const url of anteriores) {
    assert.equal(sites.includes(url), true, url);
    assert.equal(index.includes(url), true, url);
  }
  assert.equal(readFileSync(join(root, 'SECURITY_LIBRARY.md'), 'utf8').includes('https://arcanum-sec.com'), true);
  assert.equal(readFileSync(join(root, 'skills/claude-skills.md'), 'utf8').includes('https://github.com/alirezarezvani/claude-skills'), true);
  assert.equal(readFileSync(join(root, 'cloudflare/comandos.md'), 'utf8').includes('https://api.cloudflare.com/client/v4/zones'), true);
  const linux = readFileSync(join(root, 'comandos/linux.md'), 'utf8');
  const recon = readFileSync(join(root, 'comandos/recon-kali.md'), 'utf8');
  assert.equal(linux.includes('https://alvo.com'), true);
  assert.equal(recon.includes('https://crt.sh/'), true);
  assert.equal(index.includes('https://alvo.com'), false);
  assert.equal(index.includes('crt.sh'), false);
});

test('o índice não entra no catálogo MCP nem nas skills instaladas', () => {
  const catalog = Catalog.load(join(root, 'data/catalog/commands.json'));
  const nomes = catalog.categories().map((c) => c.name);
  for (const label of ['Skills', 'Repositórios traders', 'Engenharia reversa']) {
    assert.equal(nomes.includes(label), false);
  }
  assert.equal(catalog.commands.some((c) => /trader-scanner|Craft Anything|day-trader-skill/.test(JSON.stringify(c))), false);
  const instaladas = new Skills(join(root, 'data/skills')).list().map((s) => s.name).sort(cmp);
  assert.deepEqual(instaladas, ['manutencao-windows', 'relatorio-sistema']);
});
