// src/core/memory.mjs — Memória persistente simples (JSONL) com busca por termos.
// Padrão inspirado em Mem0: fatos curtos, append-only, busca local sem embeddings.
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export class Memory {
  constructor(dir) {
    this.dir = dir;
    this.file = join(dir, 'memory.jsonl');
    this.ensure();
  }

  ensure() {
    mkdirSync(this.dir, { recursive: true });
    if (!existsSync(this.file)) writeFileSync(this.file, '', 'utf8');
  }

  add(content, tags = [], type = 'fact') {
    if (!content || !content.trim()) throw new Error('memory.add: conteúdo vazio');
    const entry = {
      id: randomUUID().slice(0, 12),
      ts: new Date().toISOString(),
      type,
      content: content.trim(),
      tags: tags.map(String),
    };
    appendFileSync(this.file, JSON.stringify(entry) + '\n', 'utf8');
    return entry;
  }

  all() {
    if (!existsSync(this.file)) return [];
    const out = [];
    for (const line of readFileSync(this.file, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try { out.push(JSON.parse(line)); } catch { /* linha corrompida: ignora */ }
    }
    return out;
  }

  search(q, limit = 10) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = [];
    for (const e of this.all()) {
      const hay = `${e.content} ${e.tags.join(' ')}`.toLowerCase();
      let score = 0;
      let matchedAll = terms.length > 0;
      for (const t of terms) {
        let s = 0;
        if (e.content.toLowerCase().includes(t)) s += 2;
        else if (hay.includes(t)) s += 1;
        if (s === 0) matchedAll = false;
        score += s;
      }
      if (terms.length && !matchedAll) continue;
      scored.push({ e, score: score || 1 });
    }
    scored.sort((a, b) => b.score - a.score || (a.e.ts < b.e.ts ? 1 : -1));
    return scored.slice(0, limit).map((x) => x.e);
  }

  clear() {
    writeFileSync(this.file, '', 'utf8');
    return true;
  }
}
