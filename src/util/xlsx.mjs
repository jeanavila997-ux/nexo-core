// src/util/xlsx.mjs — Leitor minimalista de .xlsx (ZIP + XML), sem dependências.
// Suporta: entradas ZIP (stored/deflate), sharedStrings, inlineStr e valores numéricos.
// Suficiente para planilhas simples exportadas pelo Excel / Google Sheets.
import { inflateRawSync } from 'node:zlib';

function decodeXml(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// Percorre o diretório central de um ZIP e devolve Map<nome, Buffer>.
export function readZipEntries(buffer) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('ZIP: EOCD não encontrado (arquivo corrompido?)');
  const total = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const out = new Map();
  for (let e = 0; e < total; e++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error('ZIP: assinatura do diretório central inválida');
    }
    const method = buffer.readUInt16LE(offset + 10);
    const compSize = buffer.readUInt32LE(offset + 20);
    const nameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLen);
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`ZIP: local header inválido para ${name}`);
    }
    const lNameLen = buffer.readUInt16LE(localOffset + 26);
    const lExtraLen = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + lNameLen + lExtraLen;
    const data = buffer.subarray(dataStart, dataStart + compSize);
    if (method === 0) out.set(name, Buffer.from(data));
    else if (method === 8) out.set(name, inflateRawSync(data));
    else throw new Error(`ZIP: método de compressão não suportado (${method}) em ${name}`);
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

function parseSharedStrings(xml) {
  const list = [];
  const re = /<si[^>]*>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = re.exec(xml))) {
    let text = '';
    const tre = /<t[^>]*>([\s\S]*?)<\/t>/g;
    let t;
    while ((t = tre.exec(m[1]))) text += decodeXml(t[1]);
    list.push(text);
  }
  return list;
}

function colToIndex(ref) {
  const letters = ref.match(/^([A-Z]+)/);
  if (!letters) return -1;
  let idx = 0;
  for (const ch of letters[1]) idx = idx * 26 + (ch.charCodeAt(0) - 64);
  return idx - 1;
}

export function parseSheetRows(xml, shared) {
  const rows = [];
  const re = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = re.exec(xml))) {
    const row = [];
    const cre = /<c([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g;
    let c;
    while ((c = cre.exec(m[1]))) {
      const attrs = c[1];
      const body = c[3] ?? '';
      const refM = attrs.match(/r="([A-Z]+\d+)"/);
      const col = refM ? colToIndex(refM[1]) : row.length;
      const typeM = attrs.match(/t="([a-zA-Z]+)"/);
      const type = typeM ? typeM[1] : null;
      let value = '';
      const vM = body.match(/<v[^>]*>([\s\S]*?)<\/v>/);
      if (type === 's' && vM) value = shared[+vM[1]] ?? '';
      else if (type === 'inlineStr') {
        const t = body.match(/<t[^>]*>([\s\S]*?)<\/t>/);
        value = t ? decodeXml(t[1]) : '';
      } else if (vM) value = decodeXml(vM[1]);
      row[col] = value;
    }
    rows.push(row);
  }
  return rows;
}

export function readXlsx(buffer) {
  const entries = readZipEntries(buffer);
  const sharedXml = entries.get('xl/sharedStrings.xml');
  const shared = sharedXml ? parseSharedStrings(sharedXml.toString('utf8')) : [];
  const sheetNames = [...entries.keys()]
    .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort();
  if (sheetNames.length === 0) throw new Error('XLSX: nenhuma planilha encontrada');
  const sheetXml = entries.get(sheetNames[0]).toString('utf8');
  return parseSheetRows(sheetXml, shared);
}
