// src/core/catalog.mjs — Catálogo de comandos: conversão do 127.xlsx, busca e acesso.
// O catálogo é a base de ferramentas do núcleo headless (452 comandos PowerShell).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { readXlsx } from '../util/xlsx.mjs';

// Converte as linhas do 127.xlsx (title | id | badge | cmd | badge2) em registros de catálogo.
export function convertXlsxToCatalog(xlsxBuffer, source = '127.xlsx') {
  const rows = readXlsx(xlsxBuffer);
  const commands = [];
  for (const row of rows.slice(1)) {
    const title = row[0] ?? '';
    const id = row[1] ?? '';
    const category = row[2] ?? 'Outros';
    const cmd = row[3] ?? '';
    const badge2 = row[4] ?? '';
    if (!id || !cmd) continue;
    commands.push({
      id: id.trim(),
      title: (title || id).trim(),
      category: (category || 'Outros').trim(),
      cmd: cmd.trim(),
      destructive: /destrutivo/i.test(badge2),
      source,
    });
  }
  // valida ids duplicados
  const seen = new Map();
  for (const c of commands) {
    if (seen.has(c.id)) throw new Error(`ID duplicado no catálogo: ${c.id} (${seen.get(c.id)} x ${c.title})`);
    seen.set(c.id, c.title);
  }
  return commands;
}

export function saveCatalog(commands, filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(commands, null, 2), 'utf8');
}

export class Catalog {
  constructor(filePath) {
    this.filePath = filePath;
    this.commands = [];
    this.byId = new Map();
  }

  static load(filePath) {
    const cat = new Catalog(filePath);
    cat.load();
    return cat;
  }

  load() {
    if (!existsSync(this.filePath)) {
      throw new Error(
        `Catálogo não encontrado em ${this.filePath}. Rode: node nexo.mjs catalog convert`,
      );
    }
    const raw = JSON.parse(readFileSync(this.filePath, 'utf8'));
    if (!Array.isArray(raw)) throw new Error('Catálogo inválido: esperado array JSON');
    this.commands = raw;
    this.byId = new Map(raw.map((c) => [c.id, c]));
    return this;
  }

  get size() {
    return this.commands.length;
  }

  get(id) {
    return this.byId.get(id) ?? null;
  }

  categories() {
    const counts = new Map();
    for (const c of this.commands) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Busca por termos (título pesa mais que id, id pesa mais que corpo).
  search({ q = '', category = '', limit = 20 } = {}) {
    let items = this.commands;
    if (category) {
      const cat = category.toLowerCase();
      items = items.filter((c) => c.category.toLowerCase() === cat);
    }
    if (q) {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      const scoreCommand = (c) => {
        const title = c.title.toLowerCase();
        const hay = `${c.title} ${c.id} ${c.category} ${c.cmd}`.toLowerCase();
        let score = 0;
        let matchedAll = true;
        for (const t of terms) {
          let s = 0;
          if (title.includes(t)) s += 3;
          if (c.id.toLowerCase().includes(t)) s += 2;
          if (hay.includes(t)) s += 1;
          if (s === 0) matchedAll = false;
          score += s;
        }
        return { score, matchedAll };
      };
      const all = [];
      const any = [];
      for (const c of items) {
        const { score, matchedAll } = scoreCommand(c);
        if (score > 0) (matchedAll ? all : any).push({ c, score });
      }
      // fallback: se nada casa com TODOS os termos, aceita QUALQUER termo
      // (modelos locais pequenos costumam empilhar termos na busca)
      const chosen = all.length ? all : any;
      chosen.sort((a, b) => b.score - a.score);
      items = chosen.map((x) => x.c);
    }
    return items.slice(0, limit);
  }
}
