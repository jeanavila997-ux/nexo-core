#!/usr/bin/env node
// nexo.mjs — CLI do NEXO Core: núcleo headless MCP-first de agentes locais.
// Comandos: serve-stdio | serve-http | agent | catalog | memory | skills | status
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { convertXlsxToCatalog, saveCatalog, Catalog } from './src/core/catalog.mjs';
import { Policy } from './src/core/permissions.mjs';
import { Memory } from './src/core/memory.mjs';
import { Skills } from './src/core/skills.mjs';
import { Audit } from './src/core/audit.mjs';
import { buildTools } from './src/core/tools.mjs';
import { ReActAgent } from './src/core/agent.mjs';
import { OllamaClient } from './src/llm/ollama.mjs';
import { createMcpServer } from './src/mcp/server.mjs';
import { serveStdio } from './src/mcp/stdio.mjs';
import { serveHttp } from './src/mcp/http.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PATHS = {
  catalog: join(ROOT, 'data', 'catalog', 'commands.json'),
  policy: join(ROOT, 'data', 'policy.json'),
  skills: join(ROOT, 'data', 'skills'),
  memory: join(ROOT, 'data', 'memory'),
  audit: join(ROOT, 'data', 'logs', 'audit.jsonl'),
  xlsxDefault: join(ROOT, '..', '127.xlsx'),
};

function buildCore(opts = {}) {
  const policy = Policy.load(PATHS.policy);
  const catalog = Catalog.load(PATHS.catalog);
  const memory = new Memory(PATHS.memory);
  const skills = new Skills(PATHS.skills);
  const audit = new Audit(PATHS.audit);
  const llm = new OllamaClient({ host: opts.host, model: opts.model });
  // O agente NÃO recebe agent_run (evita recursão infinita).
  const agentTools = buildTools({ catalog, policy, memory, skills, audit });
  const systemExtra =
    'CATEGORIAS do catálogo (busque com termos em português, ex.: "memória", "disco", "limpeza"): ' +
    catalog.categories().map((c) => `${c.name}(${c.count})`).join(', ');
  const agent = new ReActAgent({ tools: agentTools, llm, audit, maxSteps: opts.maxSteps ?? 8, systemExtra });
  const serverTools = buildTools({
    catalog, policy, memory, skills, audit,
    agentRunner: (objective, o) => agent.run(objective, o),
  });
  return { policy, catalog, memory, skills, audit, llm, agent, serverTools };
}

function mcpResources(core) {
  return [
    {
      uri: 'nexo://catalog',
      name: 'Catálogo completo de comandos',
      mimeType: 'application/json',
      read: async () => JSON.stringify(core.catalog.commands),
    },
    {
      uri: 'nexo://policy',
      name: 'Política de permissões vigente',
      mimeType: 'application/json',
      read: async () => JSON.stringify({
        destructive: core.policy.destructive,
        shell_mode: core.policy.shell_mode,
        timeout_ms: core.policy.timeout_ms,
        allow_ids: core.policy.allow_ids,
        deny_ids: core.policy.deny_ids,
      }),
    },
    {
      uri: 'nexo://skills',
      name: 'Skills instaladas (metadados)',
      mimeType: 'application/json',
      read: async () => JSON.stringify(core.skills.list()),
    },
    {
      uri: 'nexo://status',
      name: 'Status do núcleo',
      mimeType: 'application/json',
      read: async () => JSON.stringify({
        catalog_size: core.catalog.size,
        categories: core.catalog.categories().length,
        memory_entries: core.memory.all().length,
        skills: core.skills.list().length,
        destructive_policy: core.policy.destructive,
        shell_mode: core.policy.shell_mode,
      }),
    },
  ];
}

const USAGE = `NEXO Core — núcleo headless MCP-first de agentes locais

Uso:
  node nexo.mjs serve-stdio                    Servidor MCP sobre stdio (p/ Claude Code etc.)
  node nexo.mjs serve-http [--port 8787]       Servidor MCP sobre HTTP (127.0.0.1)
  node nexo.mjs agent "OBJETIVO" [--max-steps N] [--model M]   Loop ReAct via Ollama
  node nexo.mjs catalog convert [--xlsx arq]  Converte 127.xlsx em data/catalog/commands.json
  node nexo.mjs catalog search "termos"       Busca no catálogo
  node nexo.mjs catalog get <id>              Detalhes de um comando
  node nexo.mjs catalog categories            Categorias e contagens
  node nexo.mjs memory add "fato" [--tags a,b] Salva fato persistente
  node nexo.mjs memory search "termos"        Busca na memória
  node nexo.mjs skills list|read <nome>       Skills instaladas
  node nexo.mjs status                        Diagnóstico (Ollama, catálogo, política)
  npm test                                    Testes (node --test test/)

Env:
  NEXO_OLLAMA_HOST  (padrão http://127.0.0.1:11434)
  NEXO_MODEL        (padrão gemma4:e2b-it-qat)
  NEXO_SHELL        (padrão pwsh)
`;

function parseFlags(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { flags[key] = next; i++; }
      else flags[key] = true;
    } else rest.push(a);
  }
  return { flags, rest };
}

async function main() {
  const [cmd, ...restArgv] = process.argv.slice(2);
  const { flags, rest } = parseFlags(restArgv);

  switch (cmd) {
    case 'serve-stdio': {
      const core = buildCore({ model: flags.model });
      const server = createMcpServer({ tools: core.serverTools, resources: mcpResources(core) });
      return serveStdio(server);
    }
    case 'serve-http': {
      const core = buildCore({ model: flags.model });
      const server = createMcpServer({ tools: core.serverTools, resources: mcpResources(core) });
      const port = Number(flags.port) || 8787;
      await serveHttp(server, { port });
      console.error(`NEXO MCP HTTP em http://127.0.0.1:${port}/mcp (POST JSON-RPC; GET /health)`);
      return new Promise(() => {});
    }
    case 'agent': {
      const objective = rest.join(' ');
      if (!objective) { console.error('Uso: node nexo.mjs agent "OBJETIVO"'); process.exitCode = 2; return; }
      const core = buildCore({ model: flags.model });
      const up = await core.llm.isUp();
      if (!up) {
        console.error(`Ollama não responde em ${core.llm.host}. Rode "ollama serve" e verifique NEXO_OLLAMA_HOST.`);
        process.exitCode = 1;
        return;
      }
      const r = await core.agent.run(objective, {
        maxSteps: Math.max(1, Math.min(Number(flags['max-steps']) || 8, 15)),
        onStep: (s) => {
          const icon = s.action ? (s.ok ? '·' : '!') : '?';
          console.error(`  [passo ${s.step}] ${icon} ${s.action ?? '—'} ${JSON.stringify(s.input ?? {}).slice(0, 120)}`);
        },
      });
      for (const s of r.steps ?? []) {
        if (s.thought) console.error(`    thought: ${s.thought.slice(0, 160)}`);
      }
      if (r.ok) console.log(r.answer);
      else { console.error('FALHOU: ' + (r.error ?? r.answer ?? 'sem resposta')); process.exitCode = 1; }
      return;
    }
    case 'catalog': {
      const sub = rest[0];
      if (sub === 'convert') {
        const xlsxPath = flags.xlsx ? resolve(flags.xlsx) : PATHS.xlsxDefault;
        if (!existsSync(xlsxPath)) {
          console.error(`XLSX não encontrado: ${xlsxPath} (use --xlsx <caminho>)`);
          process.exitCode = 1;
          return;
        }
        const commands = convertXlsxToCatalog(readFileSync(xlsxPath), '127.xlsx');
        saveCatalog(commands, PATHS.catalog);
        const destr = commands.filter((c) => c.destructive).length;
        console.log(`Catálogo convertido: ${commands.length} comandos (${destr} destrutivos) → ${PATHS.catalog}`);
        return;
      }
      const catalog = Catalog.load(PATHS.catalog);
      if (sub === 'search') {
        const q = rest.slice(1).join(' ');
        const cat = flags.category ? String(flags.category) : '';
        const items = catalog.search({ q, category: cat, limit: Math.min(Number(flags.limit) || 20, 50) });
        if (!items.length) { console.log('Nada encontrado.'); return; }
        for (const c of items) console.log(`[${c.category}] ${c.id}${c.destructive ? ' ⚠️' : ''} — ${c.title}\n    ${c.cmd}`);
        return;
      }
      if (sub === 'get') {
        const c = catalog.get(rest[1] ?? '');
        if (!c) { console.error('id não encontrado'); process.exitCode = 1; return; }
        console.log(JSON.stringify(c, null, 2));
        return;
      }
      if (sub === 'categories') {
        for (const c of catalog.categories()) console.log(`${c.name}: ${c.count}`);
        return;
      }
      console.error('Uso: catalog convert|search|get|categories');
      process.exitCode = 2;
      return;
    }
    case 'memory': {
      const memory = new Memory(PATHS.memory);
      const sub = rest[0];
      if (sub === 'add') {
        const content = rest.slice(1).join(' ');
        if (!content) { console.error('Uso: memory add "fato"'); process.exitCode = 2; return; }
        const tags = typeof flags.tags === 'string' ? flags.tags.split(',').map((t) => t.trim()) : [];
        const e = memory.add(content, tags);
        console.log(`salvo id=${e.id}`);
        return;
      }
      if (sub === 'search') {
        const hits = memory.search(rest.slice(1).join(' '), 20);
        for (const e of hits) console.log(`[${e.ts}] ${e.content} ${e.tags.length ? `(${e.tags.join(',')})` : ''}`);
        return;
      }
      console.error('Uso: memory add|search');
      process.exitCode = 2;
      return;
    }
    case 'skills': {
      const skills = new Skills(PATHS.skills);
      if (rest[0] === 'list') {
        for (const s of skills.list()) console.log(`${s.name}: ${s.description}`);
        return;
      }
      if (rest[0] === 'read') {
        const s = skills.read(rest[1] ?? '');
        if (!s) { console.error('skill não encontrada'); process.exitCode = 1; return; }
        console.log(s.body);
        return;
      }
      console.error('Uso: skills list|read <nome>');
      process.exitCode = 2;
      return;
    }
    case 'status': {
      const policy = Policy.load(PATHS.policy);
      const catalog = Catalog.load(PATHS.catalog);
      const llm = new OllamaClient({ model: flags.model });
      const up = await llm.isUp();
      console.log(`catálogo: ${catalog.size} comandos, ${catalog.categories().length} categorias`);
      console.log(`política: destructive=${policy.destructive} shell_mode=${policy.shell_mode} timeout=${policy.timeout_ms}ms`);
      console.log(`ollama: ${up ? 'ON' : 'OFF'} em ${llm.host} (modelo ${llm.model})`);
      if (up) {
        const models = await llm.listModels();
        console.log(`modelos disponíveis: ${models.map((m) => m.name).join(', ')}`);
      }
      return;
    }
    default:
      console.log(USAGE);
      if (cmd && cmd !== 'help' && cmd !== '--help') process.exitCode = 2;
      return;
  }
}

main().catch((e) => {
  console.error('Erro fatal:', e?.stack ?? e);
  process.exit(1);
});
