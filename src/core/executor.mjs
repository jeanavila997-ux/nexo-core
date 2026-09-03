// src/core/executor.mjs — Executa comandos PowerShell com timeout e captura UTF-8.
// Saída sempre tem o MESMO shape (sucesso e falha), para o agente poder raciocinar.
import { spawn } from 'node:child_process';

export function resolveShell(preferred = null) {
  const name = preferred ?? process.env.NEXO_SHELL ?? 'pwsh';
  return { name, args: ['-NoProfile', '-NonInteractive', '-Command'] };
}

// Executa um comando PowerShell. Nunca lança exceção: falhas viram resultado.
export function runPowerShell({
  cmd,
  timeoutMs = 60000,
  maxOutputChars = 20000,
  dryRun = false,
  shell = null,
}) {
  if (dryRun) {
    return { ok: true, dryRun: true, cmd, stdout: '', stderr: '', exitCode: null, timedOut: false, ms: 0 };
  }
  const sh = resolveShell(shell);
  const full =
    "$OutputEncoding=[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; " +
    cmd;
  const t0 = Date.now();
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(sh.name, [...sh.args, full], { windowsHide: true });
    } catch (e) {
      resolve({
        ok: false, cmd, stdout: '', stderr: `Falha ao iniciar ${sh.name}: ${e.message}`,
        exitCode: -1, timedOut: false, ms: 0,
      });
      return;
    }
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill(); } catch {}
    }, Math.max(1000, timeoutMs));

    const clip = (s) => (s.length > maxOutputChars ? s.slice(0, maxOutputChars) + `\n…[saída truncada em ${maxOutputChars} caracteres]` : s);

    child.stdout.on('data', (d) => { stdout += d.toString('utf8'); });
    child.stderr.on('data', (d) => { stderr += d.toString('utf8'); });
    child.on('error', (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        ok: false, cmd, stdout: clip(stdout), stderr: clip(stderr + `\n${e.message}`),
        exitCode: -1, timedOut, ms: Date.now() - t0,
      });
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        ok: code === 0 && !timedOut,
        cmd,
        stdout: clip(stdout),
        stderr: clip(stderr),
        exitCode: code,
        timedOut,
        ms: Date.now() - t0,
      });
    });
  });
}
