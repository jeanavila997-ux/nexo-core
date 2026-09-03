// src/core/tools.mjs — Registro central de ferramentas do NEXO.
// Mesma implementação serve para: (1) tools MCP expostas via protocolo,
// (2) ações do loop ReAct do agente. Uma única fonte de verdade.
import { runPowerShell } from './executor.mjs';

// Cada tool: name → { description, inputSchema, handler(args) → { ok, text } }
// Regra do harness: mensagens de erro dizem o que fazer a seguir.
export function buildTools({ catalog, policy, memory, skills, audit, agentRunner = null }) {
  const tools = new Map();

  const clip = (s, n = 6000) =>
    s.length > n ? s.slice(0, n) + `…[truncado em ${n} caracteres]` : s;

  tools.set('catalog_search', {
    description:
      'Busca comandos no catálogo de manutenção do Windows (452 comandos PowerShell). ' +
      'Use ANTES de catalog_run para descobrir o id exato. Termos em português funcionam melhor.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Termos de busca (ex.: "limpar temp")' },
        category: { type: 'string', description: 'Filtro exato de categoria (ex.: "Limpeza")' },
        limit: { type: 'integer', description: 'Máximo de resultados (padrão 20)', default: 20 },
      },
    },
    async handler(args = {}) {
      // Sinônimos aceitos: modelos locais pequenos às vezes chutam o nome do campo.
      const q = String(args.q ?? args.query ?? args.busca ?? args.termos ?? '');
      const items = catalog.search({
        q,
        category: args.category ?? '',
        limit: Math.min(Number(args.limit) || 20, 50),
      });
      if (!items.length) {
        return {
          ok: false,
          text: 'Nenhum comando encontrado. Tente termos mais amplos (ex.: "limpar", "memória", "atualizar") ou veja categorias com catalog_categories.',
        };
      }
      const lines = items.map(
        (c) =>
          `- [${c.category}] ${c.id} — ${c.title}${c.destructive ? ' ⚠️DESTRUTIVO' : ''}\n  cmd: ${c.cmd}`,
      );
      return { ok: true, text: `${items.length} resultado(s):\n${lines.join('\n')}` };
    },
  });

  tools.set('catalog_get', {
    description: 'Devolve os detalhes completos de um comando do catálogo pelo id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'id exato do comando (ex.: "limpar_temp_usuario")' } },
      required: ['id'],
    },
    async handler(args = {}) {
      const c = catalog.get(String(args.id ?? ''));
      if (!c) {
        return { ok: false, text: `Comando '${args.id}' não existe. Use catalog_search para achar o id correto.` };
      }
      return {
        ok: true,
        text: `id: ${c.id}\ntítulo: ${c.title}\ncategoria: ${c.category}\ndestrutivo: ${c.destructive ? 'SIM ⚠️' : 'não'}\ncmd: ${c.cmd}`,
      };
    },
  });

  tools.set('catalog_categories', {
    description: 'Lista as categorias do catálogo com a contagem de comandos em cada uma.',
    inputSchema: { type: 'object', properties: {} },
    async handler() {
      const cats = catalog.categories();
      return { ok: true, text: cats.map((c) => `${c.name}: ${c.count}`).join('\n') };
    },
  });

  tools.set('catalog_run', {
    description:
      'Executa um comando do catálogo pelo id. Comandos destrutivos exigem {"confirm": true}. ' +
      'Use {"dry_run": true} para pré-visualizar o que será executado sem rodar.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'id do comando (descubra com catalog_search)' },
        confirm: { type: 'boolean', description: 'true para autorizar comando destrutivo' },
        dry_run: { type: 'boolean', description: 'true para pré-visualizar sem executar' },
      },
      required: ['id'],
    },
    async handler(args = {}) {
      const id = String(args.id ?? '');
      const cmd = catalog.get(id);
      if (!cmd) {
        return { ok: false, text: `Comando '${id}' não existe. Use catalog_search para achar o id correto.` };
      }
      // dry-run vem ANTES do gate: pré-visualizar não executa nada e
      // ajuda o agente (e o humano) a decidir antes de confirmar.
      if (args.dry_run) {
        const r = await runPowerShell({ cmd: cmd.cmd, dryRun: true });
        return { ok: true, text: `DRY-RUN (nada executado):\n${r.cmd}` };
      }
      const gate = policy.checkRun(cmd, args);
      if (!gate.allowed) {
        return { ok: false, text: `BLOQUEADO pelo gate de permissão: ${gate.reason}` };
      }
      const t0 = Date.now();
      const r = await runPowerShell({
        cmd: cmd.cmd,
        timeoutMs: policy.timeout_ms,
        maxOutputChars: policy.max_output_chars,
      });
      const parts = [`exit_code: ${r.exitCode}${r.timedOut ? ' (TIMEOUT)' : ''}`, `tempo: ${r.ms} ms`];
      if (r.stdout.trim()) parts.push(`stdout:\n${r.stdout.trim()}`);
      if (r.stderr.trim()) parts.push(`stderr:\n${r.stderr.trim()}`);
      const summary = `${id} → exit ${r.exitCode} (${r.ms} ms)`;
      audit?.log({ tool: 'catalog_run', args: { id, confirm: args.confirm ?? false }, ok: r.ok, ms: Date.now() - t0, summary });
      if (!r.ok) {
        parts.push('DICA: rode {"dry_run": true} para rever o comando; verifique o stderr acima para corrigir.');
      }
      return { ok: r.ok, text: clip(parts.join('\n')) };
    },
  });

  tools.set('memory_save', {
    description: 'Salva um fato/lembrete persistente na memória local (sobrevive entre sessões).',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'O fato a lembrar, curto e específico' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags opcionais de contexto' },
      },
      required: ['content'],
    },
    async handler(args = {}) {
      if (!String(args.content ?? '').trim()) {
        return { ok: false, text: 'Conteúdo vazio. Informe o que deve ser lembrado.' };
      }
      const e = memory.add(String(args.content), args.tags ?? []);
      return { ok: true, text: `Salvo na memória (id ${e.id}).` };
    },
  });

  tools.set('memory_search', {
    description: 'Busca fatos salvos na memória local por termos.',
    inputSchema: {
      type: 'object',
      properties: { q: { type: 'string' }, limit: { type: 'integer', default: 10 } },
      required: ['q'],
    },
    async handler(args = {}) {
      const q = String(args.q ?? args.query ?? args.busca ?? args.termos ?? '');
      const hits = memory.search(q, Math.min(Number(args.limit) || 10, 50));
      if (!hits.length) return { ok: false, text: 'Nada encontrado na memória com esses termos.' };
      return {
        ok: true,
        text: hits.map((e) => `[${e.ts}] ${e.content}${e.tags.length ? ` (tags: ${e.tags.join(', ')})` : ''}`).join('\n'),
      };
    },
  });

  tools.set('skills_list', {
    description: 'Lista as skills instaladas (apenas nome e descrição — discovery).',
    inputSchema: { type: 'object', properties: {} },
    async handler() {
      const list = skills.list();
      if (!list.length) return { ok: false, text: 'Nenhuma skill instalada em data/skills/.' };
      return { ok: true, text: list.map((s) => `- ${s.name}: ${s.description}`).join('\n') };
    },
  });

  tools.set('skill_read', {
    description: 'Carrega o corpo completo de uma skill (ativação — progressive disclosure).',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    },
    async handler(args = {}) {
      const s = skills.read(String(args.name ?? ''));
      if (!s) {
        const names = skills.list().map((x) => x.name).join(', ') || '(nenhuma)';
        return { ok: false, text: `Skill '${args.name}' não encontrada. Disponíveis: ${names}` };
      }
      return { ok: true, text: clip(`# ${s.name}\n${s.body}`, 12000) };
    },
  });

  if (agentRunner) {
    tools.set('agent_run', {
      description:
        'Roda o loop de agente headless (ReAct) com um objetivo: o agente planeja e executa ' +
        'passos usando as ferramentas do NEXO localmente via Ollama. Reserve para objetivos de múltiplos passos.',
      inputSchema: {
        type: 'object',
        properties: {
          objective: { type: 'string', description: 'Objetivo claro e verificável' },
          max_steps: { type: 'integer', default: 6, description: 'Limite de passos (1-15)' },
        },
        required: ['objective'],
      },
      async handler(args = {}) {
        const objective = String(args.objective ?? args.objetivo ?? '').trim();
        if (!objective) return { ok: false, text: 'Objetivo vazio.' };
        const r = await agentRunner(objective, {
          maxSteps: Math.max(1, Math.min(Number(args.max_steps) || 6, 15)),
        });
        return { ok: r.ok, text: clip(r.answer || r.error || '(sem resposta)') };
      },
    });
  }

  if (policy.canShell()) {
    tools.set('shell_run', {
      description:
        'Executa um comando PowerShell arbitrário (modo open da política). Prefira catalog_run.',
      inputSchema: {
        type: 'object',
        properties: { command: { type: 'string' } },
        required: ['command'],
      },
      async handler(args = {}) {
        const r = await runPowerShell({
          cmd: String(args.command ?? ''),
          timeoutMs: policy.timeout_ms,
          maxOutputChars: policy.max_output_chars,
        });
        audit?.log({ tool: 'shell_run', args: { command: String(args.command).slice(0, 200) }, ok: r.ok, ms: r.ms, summary: `exit ${r.exitCode}` });
        return { ok: r.ok, text: clip(`exit_code: ${r.exitCode}\n${r.stdout}\n${r.stderr}`) };
      },
    });
  }

  return tools;
}
