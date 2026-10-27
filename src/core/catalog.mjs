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

// ---- Parâmetros seguros ({{PLACEHOLDER}} + regex por parâmetro) ----
// Um comando pode declarar `params: { nome: "<regex>" }`. O valor só entra no comando
// se casar INTEIRO com a regex (padrão anti-injeção: sem $ ` ( ) ; | & nas regexes).
// Placeholder que sobrar sem valor = comando não executa (nunca roda "{{NOME}}" literal).
const PLACEHOLDER = /\{\{([A-Z0-9_]+)\}\}/g;
const MAX_PARAM_LEN = 1024;

export function placeholdersOf(cmdText) {
  return [...new Set([...String(cmdText).matchAll(PLACEHOLDER)].map((m) => m[1]))];
}

export function resolveCommand(command, params = {}) {
  let text = command.cmd;
  const defs = command.params ?? {};
  const given = params && typeof params === 'object' ? params : {};
  for (const [key, regexSource] of Object.entries(defs)) {
    const value = given[key];
    if (typeof value !== 'string' || value.length === 0) {
      return { ok: false, error: `Falta o parâmetro '${key}'. Envie params: {"${key}": "..."} (formato: ${regexSource}).` };
    }
    // Valor com cara de opção (-x / --global) nunca entra: aspas não impedem o
    // programa nativo de interpretá-lo como flag (injeção de argumento).
    if (value.startsWith('-')) {
      return { ok: false, error: `Parâmetro '${key}' não pode começar com '-' (seria lido como opção do comando).` };
    }
    if (value.length > MAX_PARAM_LEN || !new RegExp(`^(?:${regexSource})$`, 'u').test(value)) {
      return { ok: false, error: `Parâmetro '${key}' inválido para '${command.id}'. Formato aceito: ${regexSource}` };
    }
    text = text.split(`{{${key.toUpperCase()}}}`).join(value);
  }
  const leftover = placeholdersOf(text);
  if (leftover.length) {
    return {
      ok: false,
      error: `'${command.id}' tem placeholder(s) sem definição segura: ${leftover.join(', ')}. ` +
        'Ele precisa de "params" com regex no catálogo antes de poder executar.',
    };
  }
  return { ok: true, cmd: text };
}

// Mescla um pacote externo no catálogo. Idempotente: id igual + mesmo source = atualiza;
// id igual de OUTRA origem = erro (não sobrescreve comando de terceiros).
export function mergeCatalog(base, extra, source) {
  const out = [...base];
  const idx = new Map(out.map((c, i) => [c.id, i]));
  let added = 0, updated = 0;
  for (const c of extra) {
    if (!c.id || !c.cmd || !c.title || !c.category) throw new Error(`Registro inválido no pacote: ${JSON.stringify(c).slice(0, 120)}`);
    for (const [k, re] of Object.entries(c.params ?? {})) new RegExp(re, 'u'); // regex compila?
    const rec = { ...c, source: c.source ?? source };
    if (idx.has(c.id)) {
      const cur = out[idx.get(c.id)];
      if (cur.source !== rec.source) throw new Error(`ID '${c.id}' já existe com origem '${cur.source}' — renomeie no pacote.`);
      out[idx.get(c.id)] = rec; updated++;
    } else {
      idx.set(c.id, out.length); out.push(rec); added++;
    }
  }
  return { commands: out, added, updated };
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
