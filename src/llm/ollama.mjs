// src/llm/ollama.mjs — Cliente mínimo do Ollama (API nativa /api/chat e /api/tags).
// Zero dependências: usa fetch global do Node 20+.
export class OllamaClient {
  constructor({
    host = process.env.NEXO_OLLAMA_HOST ?? 'http://127.0.0.1:11434',
    model = process.env.NEXO_MODEL ?? 'gemma4:e2b-it-qat',
    timeoutMs = Number(process.env.NEXO_LLM_TIMEOUT) || 300000,
    numCtx = Number(process.env.NEXO_NUM_CTX) || 8192,
    numPredict = Number(process.env.NEXO_NUM_PREDICT) || 220,
  } = {}) {
    this.host = host.replace(/\/+$/, '');
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.numCtx = numCtx;
    this.numPredict = numPredict;
  }

  async listModels() {
    const r = await this._fetch('/api/tags', { timeoutMs: 10000 });
    const j = await r.json();
    return (j.models ?? []).map((m) => ({ name: m.name, size: m.size, details: m.details ?? {} }));
  }

  async isUp() {
    try {
      const r = await this._fetch('/', { timeoutMs: 3000 });
      return r.ok;
    } catch {
      return false;
    }
  }

  // Chat não-streaming. Devolve { ok, content, error } — mesma forma para sucesso e erro.
  async chat(messages, { model = this.model, temperature = 0.2, numCtx = this.numCtx, numPredict = this.numPredict } = {}) {
    const body = { model, messages, stream: false, options: { temperature, num_ctx: numCtx, num_predict: numPredict } };
    try {
      const r = await this._fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        timeoutMs: this.timeoutMs,
      });
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        return { ok: false, content: '', error: `Ollama HTTP ${r.status}: ${text.slice(0, 300)}` };
      }
      const j = await r.json();
      return { ok: true, content: (j.message ?? {}).content ?? '', error: '' };
    } catch (e) {
      return { ok: false, content: '', error: `Ollama indisponível (${this.host}): ${e.message}` };
    }
  }

  async _fetch(path, opts = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? this.timeoutMs);
    try {
      return await fetch(this.host + path, { ...opts, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}
