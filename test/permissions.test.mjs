import test from 'node:test';
import assert from 'node:assert/strict';
import { Policy, DEFAULT_POLICY } from '../src/core/permissions.mjs';

test('padrão: destrutivo exige confirmação explícita', () => {
  const p = new Policy();
  const cmd = { id: 'limpar_prefetch', title: 'Limpar Prefetch', destructive: true, cmd: 'x' };
  const g = p.checkRun(cmd, {});
  assert.equal(g.allowed, false);
  assert.equal(g.needsConfirm, true);
  const g2 = p.checkRun(cmd, { confirm: true });
  assert.equal(g2.allowed, true);
});

test('confirm com valor não-booleano não autoriza', () => {
  const p = new Policy();
  const cmd = { id: 'd', destructive: true, cmd: 'x' };
  assert.equal(p.checkRun(cmd, { confirm: 'true' }).allowed, false);
  assert.equal(p.checkRun(cmd, { confirm: 1 }).allowed, false);
});

test('destructive=deny bloqueia mesmo com confirm', () => {
  const p = new Policy({ destructive: 'deny' });
  const cmd = { id: 'd', destructive: true, cmd: 'x' };
  assert.equal(p.checkRun(cmd, { confirm: true }).allowed, false);
});

test('allow_ids libera destrutivo específico sem confirmação', () => {
  const p = new Policy({ allow_ids: ['d'] });
  const cmd = { id: 'd', destructive: true, cmd: 'x' };
  assert.equal(p.checkRun(cmd, {}).allowed, true);
  const other = { id: 'e', destructive: true, cmd: 'x' };
  assert.equal(p.checkRun(other, {}).allowed, false);
});

test('deny_ids vence tudo', () => {
  const p = new Policy({ deny_ids: ['d'], allow_ids: ['d'] });
  const cmd = { id: 'd', destructive: false, cmd: 'x' };
  const g = p.checkRun(cmd, {});
  assert.equal(g.allowed, false);
  assert.match(g.reason, /denylist/);
});

test('não-destrutivo roda sem confirmação', () => {
  const p = new Policy();
  const cmd = { id: 'ver_ram', destructive: false, cmd: 'x' };
  assert.equal(p.checkRun(cmd, {}).allowed, true);
});

test('shell fechado por padrão', () => {
  assert.equal(new Policy().canShell(), false);
  assert.equal(new Policy({ shell_mode: 'open' }).canShell(), true);
});

test('política carregada não vaza referências do DEFAULT', () => {
  const p1 = new Policy({ allow_ids: ['x'] });
  const p2 = new Policy();
  assert.deepEqual(p2.allow_ids, DEFAULT_POLICY.allow_ids);
  assert.notEqual(p1.allow_ids, DEFAULT_POLICY.allow_ids);
});
