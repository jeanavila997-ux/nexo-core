// src/core/audit.mjs — Trilha de auditoria (padrão MULT-CHAT-HUB):
// valores sensíveis são MASCARADOS com '****', mas o SHA-256 do valor original
// é preservado ao lado — permitindo verificar o valor sem vazar o segredo.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, appendFileSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SENSITIVE_KEY = /api[-_]?key|passw(or)?d|passwd|token|secret|auth|credential|private[-_]?key|bearer/i;

export function sha256(v) {
  return createHash('sha256').update(String(v), 'utf8').digest('hex');
}

// Mascara recursivamente valores cuja chave parece sensível.
export function maskSensitive(value, key = null) {
  if (key && SENSITIVE_KEY.test(key)) {
    return { masked: '****', sha256: sha256(value) };
  }
  if (Array.isArray(value)) return value.map((v) => maskSensitive(v));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = maskSensitive(v, k);
    return out;
  }
  return value;
}

export class Audit {
  constructor(file) {
    this.file = file ?? null;
    if (this.file) mkdirSync(dirname(this.file), { recursive: true });
  }

  log({ tool, args = {}, ok = true, ms = 0, summary = '' }) {
    if (!this.file) return null;
    const entry = {
      ts: new Date().toISOString(),
      tool,
      args: maskSensitive(args),
      ok,
      ms,
      summary: String(summary).slice(0, 400),
    };
    appendFileSync(this.file, JSON.stringify(entry) + '\n', 'utf8');
    return entry;
  }

  tail(n = 20) {
    if (!this.file || !existsSync(this.file)) return [];
    const out = [];
    for (const line of readFileSync(this.file, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try { out.push(JSON.parse(line)); } catch { /* ignora linha corrompida */ }
    }
    return out.slice(-n);
  }
}
