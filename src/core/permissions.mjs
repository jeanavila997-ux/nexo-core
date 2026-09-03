// src/core/permissions.mjs — Gate de permissão DETERMINÍSTICO.
// Comandos marcados como ⚠️ Destrutivos no catálogo só executam com confirmação
// explícita. A política vive em data/policy.json e nunca depende de prompt de LLM.
import { readFileSync, existsSync } from 'node:fs';

export const DEFAULT_POLICY = {
  destructive: 'confirm', // 'confirm' | 'allow' | 'deny'
  shell_mode: 'catalog_only', // 'catalog_only' | 'open'
  timeout_ms: 60000,
  max_output_chars: 20000,
  allow_ids: [], // destrutivos liberados sem confirmação (use com cuidado)
  deny_ids: [], // bloqueados sempre
};

export class Policy {
  constructor(overrides = {}) {
    Object.assign(this, structuredClone(DEFAULT_POLICY), overrides);
  }

  static load(filePath) {
    if (!existsSync(filePath)) return new Policy();
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    return new Policy(raw);
  }

  // Avalia se um comando do catálogo pode executar.
  // Retorna { allowed, needsConfirm, reason } — sempre decide, nunca pergunta ao LLM.
  checkRun(cmd, args = {}) {
    if (this.deny_ids.includes(cmd.id)) {
      return {
        allowed: false,
        needsConfirm: false,
        reason: `Comando '${cmd.id}' está na denylist da política (deny_ids).`,
      };
    }
    const destructive = Boolean(cmd.destructive) && !this.allow_ids.includes(cmd.id);
    if (destructive) {
      if (this.destructive === 'deny') {
        return {
          allowed: false,
          needsConfirm: false,
          reason: `Política atual proíbe comandos destrutivos (destructive: 'deny'). '${cmd.id}' foi bloqueado.`,
        };
      }
      if (this.destructive === 'confirm' && args.confirm !== true) {
        return {
          allowed: false,
          needsConfirm: true,
          reason:
            `'${cmd.id}' é DESTRUTIVO (${cmd.title}). ` +
            `Para executar, chame novamente com {"confirm": true}. ` +
            `Comando a executar: ${cmd.cmd}`,
        };
      }
    }
    return { allowed: true, needsConfirm: false, reason: '' };
  }

  canShell() {
    return this.shell_mode === 'open';
  }
}
