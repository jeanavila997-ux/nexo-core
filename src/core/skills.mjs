// src/core/skills.mjs — Carregador de skills no formato aberto Agent Skills (Anthropic).
// Skill = pasta com SKILL.md (frontmatter name/description + corpo de instruções).
// Progressive disclosure: list() devolve só metadados; read() devolve o corpo completo.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (kv) meta[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: m[2] };
}

export class Skills {
  constructor(dir) {
    this.dir = dir;
  }

  // Lista de skills instaladas (apenas metadados — discovery).
  list() {
    if (!existsSync(this.dir)) return [];
    const out = [];
    for (const name of readdirSync(this.dir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const file = join(this.dir, name.name, 'SKILL.md');
      if (!existsSync(file)) continue;
      try {
        const { meta } = parseFrontmatter(readFileSync(file, 'utf8'));
        out.push({
          name: meta.name ?? name.name,
          description: meta.description ?? '',
          folder: name.name,
        });
      } catch { /* SKILL.md inválido: ignora */ }
    }
    return out;
  }

  // Ativação: corpo completo da skill.
  read(name) {
    const candidates = [name, `${name}/SKILL.md`, join(name, 'SKILL.md')];
    for (const c of candidates) {
      const file = join(this.dir, c, 'SKILL.md');
      if (existsSync(file)) {
        const raw = readFileSync(file, 'utf8');
        const { meta, body } = parseFrontmatter(raw);
        return { name: meta.name ?? name, description: meta.description ?? '', body };
      }
    }
    return null;
  }
}
