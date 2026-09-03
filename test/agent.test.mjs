import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReAct, buildSystemPrompt } from '../src/core/agent.mjs';
import { ReActAgent } from '../src/core/agent.mjs';
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

function fakeCatalog() {
  const cat = new Catalog('/tmp/x.json');
  cat.commands = [
    { id: 'ver_ram', title: 'Ver Uso de RAM', category: 'Memória', cmd: 'Get-RAM', destructive: false },
    { id: 'limpar_tudo', title: 'Limpeza Profunda', category: 'Limpeza', cmd: 'rm tudo', destructive: true },
  ];
  cat.byId = new Map(cat.commands.map((c) => [c.id, c]));
  return cat;
}

function core() {
  const catalog = fakeCatalog();
  const policy = new Policy();
  const memory = new Memory(tmpDir());
  const skills = new Skills(tmpDir());
  const tools = buildTools({ catalog, policy, memory, skills, audit: null });
  return { catalog, policy, memory, skills, tools };
}

test('parseReAct: formato básico', () => {
  const p = parseReAct('Thought: vou buscar\nAction: catalog_search\nAction Input: {"q": "ram"}');
  assert.equal(p.action, 'catalog_search');
  assert.deepEqual(p.input, { q: 'ram' });
});

test('parseReAct: tolera cercas de código e ruído', () => {
  const text = 'Aqui vai:\n```json\nThought: penso\nAction: catalog_get\nAction Input: {"id": "ver_ram"}\n```';
  const p = parseReAct(text);
  assert.equal(p.action, 'catalog_get');
  assert.deepEqual(p.input, { id: 'ver_ram' });
});

test('parseReAct: sem Action devolve null', () => {
  assert.equal(parseReAct('Só um pensamento sem ação.'), null);
});

test('parseReAct: JSON inválido vira {value}', () => {
  const p = parseReAct('Action: final_answer\nAction Input: resposta sem json');
  assert.equal(p.action, 'final_answer');
  assert.ok(p.input);
});

test('buildSystemPrompt lista ações e regras', () => {
  const s = buildSystemPrompt(['catalog_search', 'catalog_run']);
  assert.match(s, /catalog_search/);
  assert.match(s, /confirm/);
  assert.match(s, /final_answer/);
});

test('ReActAgent: loop completo com LLM falso (2 passos)', async () => {
  const { tools } = core();
  const fakeLlm = {
    chat: async (messages) => {
      const last = messages[messages.length - 1].content;
      if (last.includes('OBJETIVO')) {
        return { ok: true, content: 'Thought: buscar na memória\nAction: memory_save\nAction Input: {"content": "teste"}' };
      }
      return { ok: true, content: 'Thought: concluí\nAction: final_answer\nAction Input: {"answer": "salvei com sucesso"}' };
    },
  };
  const agent = new ReActAgent({ tools, llm: fakeLlm, maxSteps: 5 });
  const r = await agent.run('salvar um fato de teste');
  assert.equal(r.ok, true);
  assert.equal(r.answer, 'salvei com sucesso');
  assert.equal(r.steps.length, 2);
});

test('ReActAgent: ação inexistente gera observação de erro e o agente se recupera', async () => {
  const { tools } = core();
  let calls = 0;
  const fakeLlm = {
    chat: async () => {
      calls++;
      if (calls === 1) return { ok: true, content: 'Action: acao_inexistente\nAction Input: {}' };
      return { ok: true, content: 'Action: final_answer\nAction Input: {"answer": "recuperei"}' };
    },
  };
  const agent = new ReActAgent({ tools, llm: fakeLlm, maxSteps: 4 });
  const r = await agent.run('teste');
  assert.equal(r.ok, true);
  assert.equal(r.steps[0].ok, false);
  assert.match(r.steps[0].observation, /não existe/);
});

test('ReActAgent: falha de LLM propaga erro', async () => {
  const { tools } = core();
  const agent = new ReActAgent({ tools, llm: { chat: async () => ({ ok: false, error: 'ollama fora' }) }, maxSteps: 3 });
  const r = await agent.run('qualquer');
  assert.equal(r.ok, false);
  assert.match(r.error, /ollama fora/);
});

test('ReActAgent: formato inválido recebe nudge e continua', async () => {
  const { tools } = core();
  let calls = 0;
  const fakeLlm = {
    chat: async () => {
      calls++;
      if (calls === 1) return { ok: true, content: 'acho que vou fazer assim... sem formato' };
      return { ok: true, content: 'Action: final_answer\nAction Input: {"answer": "ok"}' };
    },
  };
  const agent = new ReActAgent({ tools, llm: fakeLlm, maxSteps: 4 });
  const r = await agent.run('x');
  assert.equal(r.ok, true);
  assert.equal(r.steps[0].action, null);
});
