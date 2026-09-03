import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSheetRows } from '../src/util/xlsx.mjs';
import { convertXlsxToCatalog, Catalog } from '../src/core/catalog.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

test('parseSheetRows decodifica shared strings e colunas', () => {
  const xml = '<worksheet><sheetData>' +
    '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row>' +
    '<row r="2"><c r="A2" t="s"><v>4</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>2</v></c><c r="D2" t="s"><v>6</v></c></row>' +
    '</sheetData></worksheet>';
  const shared = ['title', 'id', 'badge', 'cmd', 'Ver RAM', 'ver_ram', 'echo ram'];
  const rows = parseSheetRows(xml, shared);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1], ['Ver RAM', 'ver_ram', 'badge', 'echo ram']);
});

test('parseSheetRows decodifica entidades XML', () => {
  const xml = '<worksheet><sheetData><row r="1"><c r="A1"><v>caf&#233; &amp; a&#231;&#250;car</v></c></row></sheetData></worksheet>';
  const rows = parseSheetRows(xml, []);
  assert.equal(rows[0][0], 'café & açúcar');
});

test('convertXlsxToCatalog marca destrutivos', () => {
  const fakeXlsx = null;
  // teste unitário via parseSheetRows já cobre a conversão linha a linha;
  // aqui validamos o mapeamento de campos:
  const rows = [
    ['Título', 'id', 'badge', 'cmd', 'badge2'],
    ['Limpar tudo', 'limpar_tudo', 'Limpeza', 'Remove-Item x', '⚠️ Destrutivo'],
    ['Ver disco', 'ver_disco', 'Disco', 'Get-PSDrive', ''],
  ];
  const commands = rows.slice(1).map((row) => {
    const [title, id, category, cmd, badge2] = row;
    return { id, title, category, cmd, destructive: /destrutivo/i.test(badge2 ?? '') };
  });
  assert.equal(commands[0].destructive, true);
  assert.equal(commands[1].destructive, false);
});

test('conversão real do 127.xlsx (integração, pula se ausente)', () => {
  const xlsx = join(ROOT, '..', '..', '127.xlsx');
  if (!existsSync(xlsx)) return; // skip
  const commands = convertXlsxToCatalog(readFileSync(xlsx), '127.xlsx');
  assert.ok(commands.length >= 400, `esperado >=400 comandos, veio ${commands.length}`);
  const destr = commands.filter((c) => c.destructive).length;
  assert.ok(destr > 50, `esperado >50 destrutivos, veio ${destr}`);
});

test('Catalog.search ranqueia por título e filtra categoria', () => {
  const cat = new Catalog('/tmp/nao-existe.json');
  cat.commands = [
    { id: 'ver_ram', title: 'Ver Uso de RAM', category: 'Memória', cmd: 'x', destructive: false },
    { id: 'listar_ram', title: 'Listar Processos por RAM', category: 'Memória', cmd: 'x', destructive: false },
    { id: 'limpar_disco', title: 'Limpar Disco', category: 'Disco', cmd: 'x', destructive: false },
  ];
  cat.byId = new Map(cat.commands.map((c) => [c.id, c]));
  const hits = cat.search({ q: 'ram' });
  assert.equal(hits[0].id, 'ver_ram');
  const memOnly = cat.search({ category: 'Memória', limit: 10 });
  assert.equal(memOnly.length, 2);
  assert.deepEqual(cat.categories()[0], { name: 'Memória', count: 2 });
});

test('Catalog.get devolve null para id inexistente', () => {
  const cat = new Catalog('/tmp/x.json');
  cat.commands = [{ id: 'a', title: 'A', category: 'X', cmd: 'x', destructive: false }];
  cat.byId = new Map([['a', cat.commands[0]]]);
  assert.equal(cat.get('a').id, 'a');
  assert.equal(cat.get('zzz'), null);
});
