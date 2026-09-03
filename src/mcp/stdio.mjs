// src/mcp/stdio.mjs — Transporte MCP sobre stdio (newline-delimited JSON-RPC).
// É o transporte canônico para clientes locais (Claude Code, etc.).
export function serveStdio(server, { stdout = process.stdout, stdin = process.stdin } = {}) {
  let buf = '';
  stdin.setEncoding('utf8');
  stdin.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      server.handle(msg).then((res) => {
        if (res) stdout.write(JSON.stringify(res) + '\n');
      }).catch((e) => {
        // falha absoluta do handler: não deve acontecer (server.handle captura)
        stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg?.id ?? null, error: { code: -32603, message: String(e) } }) + '\n');
      });
    }
  });
  return new Promise((resolve) => {
    stdin.on('end', () => resolve());
    stdin.on('close', () => resolve());
  });
}
