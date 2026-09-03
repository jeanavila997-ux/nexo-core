// src/core/agent.mjs — Loop de agente headless no padrão ReAct (Thought/Action/Observation).
// Escolha deliberada: ReAct em texto puro funciona com QUALQUER modelo local via Ollama,
// inclusive os pequenos — sem depender de tool-calling nativo do modelo.
import { sha256 } from './audit.mjs';

export function buildSystemPrompt(toolNames, extra = '') {
  return [
    'Você é o NEXO, um agente headless local que opera a manutenção de um Windows via catálogo de comandos.',
    'Trabalhe EXCLUSIVAMENTE com as ferramentas disponíveis. Nunca invente ids de comandos.',
    '',
    'Responda SEMPRE, em cada passo, EXATAMENTE neste formato (sem markdown, sem cercas de código):',
    'Thought: <raciocínio em NO MÁXIMO 2 frases curtas — seja extremamente conciso>',
    'Action: <nome_da_acao>',
    'Action Input: <JSON com os argumentos da ação>',
    '',
    'Ações disponíveis: ' + toolNames.join(', ') + ', final_answer',
    'Para final_answer use: Action Input: {"answer": "<resumo do que foi feito e resultados>"}.',
    '',
    'ARGUMENTOS por ação (Action Input JSON) — use EXATAMENTE estes nomes de campos:',
    '- catalog_search: {"q": "<termos de busca em português>"}',
    '- catalog_get: {"id": "<id exato do comando>"}',
    '- catalog_categories: {}',
    '- catalog_run: {"id": "<id>", "confirm": true (só p/ destrutivos), "dry_run": true (opcional p/ pré-visualizar)}',
    '- memory_save: {"content": "<fato curto>"}',
    '- memory_search: {"q": "<termos>"}',
    '- skills_list: {}',
    '- skill_read: {"name": "<nome da skill>"}',
    '- final_answer: {"answer": "<resumo final>"}',
    '',
    'REGRAS:',
    '1. Antes de executar qualquer comando, procure o id exato com catalog_search.',
    '2. Comandos destrutivos (⚠️) só executam com {"confirm": true}. Se não tiver certeza, use {"dry_run": true} primeiro.',
    '3. Prefira ações não-destrutivas e reversíveis. Explique riscos no Thought.',
    '4. Fatos úteis para o futuro vão para memory_save. Fatos relevantes antigos saem de memory_search.',
    '5. Consulte skills_list/skill_read quando o objetivo parecer coberto por uma skill.',
    '6. Ao concluir (ou ao não poder prosseguir), use final_answer com um resumo honesto.',
    extra,
  ].filter(Boolean).join('\n');
}

// Parser tolerante: aceita cercas de código, maiúsculas e ruído ao redor.
export function parseReAct(text) {
  const cleaned = String(text).replace(/```[a-zA-Z]*\n?/g, '').trim();
  const actions = [...cleaned.matchAll(/Action:\s*["']?([a-zA-Z_][\w]*)["']?/g)];
  if (!actions.length) return null;
  const last = actions[actions.length - 1];
  const action = last[1];
  const after = cleaned.slice(last.index);
  const inputM = after.match(/Action\s*Input:\s*([\s\S]*?)(?:\n\n|$(?![\r]))/m);
  let input = {};
  if (inputM) {
    const raw = inputM[1].trim();
    try {
      input = JSON.parse(raw);
    } catch {
      const jm = raw.match(/\{[\s\S]*\}/);
      if (jm) {
        try { input = JSON.parse(jm[0]); } catch { input = { value: raw }; }
      } else {
        input = { value: raw };
      }
    }
  }
  const thoughtM = cleaned.match(/Thought:\s*([\s\S]*?)(?=\nAction:|$)/);
  return { thought: thoughtM ? thoughtM[1].trim() : '', action, input };
}

export class ReActAgent {
  constructor({ tools, llm, audit = null, maxSteps = 8, systemExtra = '' }) {
    this.tools = tools;
    this.llm = llm;
    this.audit = audit;
    this.maxSteps = maxSteps;
    this.systemExtra = systemExtra;
  }

  async run(objective, { maxSteps = this.maxSteps, onStep = null } = {}) {
    const toolNames = [...this.tools.keys()];
    const system = buildSystemPrompt(toolNames, this.systemExtra);
    const messages = [
      { role: 'system', content: system },
      {
        role: 'user',
        content:
          `OBJETIVO: ${objective}\n\nData atual: ${new Date().toISOString().slice(0, 10)}. ` +
          'Comece planejando o primeiro passo.',
      },
    ];
    const steps = [];
    for (let step = 1; step <= maxSteps; step++) {
      const res = await this.llm.chat(messages);
      if (!res.ok) {
        return { ok: false, error: res.error, answer: '', steps };
      }
      const parsed = parseReAct(res.content);
      if (!parsed) {
        const nudge =
          'FORMATO INVÁLIDO. Você DEVE responder apenas com Thought/Action/Action Input. ' +
          `Ações permitidas: ${[...toolNames, 'final_answer'].join(', ')}. Tente novamente.`;
        messages.push({ role: 'assistant', content: res.content });
        messages.push({ role: 'user', content: nudge });
        steps.push({ step, thought: '(formato inválido)', action: null, ok: false, observation: nudge });
        continue;
      }
      const s = { step, thought: parsed.thought, action: parsed.action, input: parsed.input, ok: true, observation: '' };
      if (parsed.action === 'final_answer') {
        const answer =
          (parsed.input && typeof parsed.input === 'object' && (parsed.input.answer ?? parsed.input.value)) ??
          JSON.stringify(parsed.input);
        s.observation = '(concluído)';
        steps.push(s);
        onStep?.(s);
        return { ok: true, answer: String(answer), steps };
      }
      const tool = this.tools.get(parsed.action);
      let observation;
      if (!tool) {
        observation =
          `ERRO: ação '${parsed.action}' não existe. Use uma destas: ${[...toolNames, 'final_answer'].join(', ')}.`;
        s.ok = false;
      } else {
        const t0 = Date.now();
        const r = await tool.handler(parsed.input ?? {});
        s.ok = r.ok;
        observation = r.text.length > 2500 ? r.text.slice(0, 2500) + '…[truncado]' : r.text;
        this.audit?.log({
          tool: `agent:${parsed.action}`,
          args: parsed.input ?? {},
          ok: r.ok,
          ms: Date.now() - t0,
          summary: observation.slice(0, 200),
        });
      }
      s.observation = observation;
      steps.push(s);
      onStep?.(s);
      messages.push({ role: 'assistant', content: res.content });
      messages.push({ role: 'user', content: `Observation: ${observation}` });
    }
    return {
      ok: false,
      answer: '',
      error: 'Limite de passos atingido sem final_answer.',
      steps,
    };
  }
}

export { sha256 };
