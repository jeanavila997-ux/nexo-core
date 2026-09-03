// src/mcp/server.mjs — Servidor MCP (Model Context Protocol) minimalista.
// JSON-RPC 2.0, sem SDK: initialize, tools/list, tools/call, resources/*.
// Erros de EXECUÇÃO de tool viram result.isError (o cliente/LLM pode corrigir);
// erros de PROTOCOLO viram JSON-RPC error (-32601/-32602/-32603).
export const SUPPORTED_VERSIONS = ['2026-07-28', '2025-06-18', '2025-03-26'];
export const DEFAULT_VERSION = '2025-06-18';

function ok(id, result) {
  return { jsonrpc: '2.0', id, result };
}
function err(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

export function createMcpServer({ name = 'nexo-core', version = '0.1.0', tools, resources = [] }) {
  return {
    async handle(msg) {
      if (!msg || typeof msg !== 'object') return null;
      const { id, method, params } = msg;
      const isNotification = id === undefined || id === null;
      if (typeof method === 'string' && method.startsWith('notifications/')) return null;
      try {
        switch (method) {
          case 'initialize': {
            const requested = params?.protocolVersion;
            const protocolVersion = SUPPORTED_VERSIONS.includes(requested)
              ? requested
              : DEFAULT_VERSION;
            return ok(id, {
              protocolVersion,
              capabilities: {
                tools: { listChanged: false },
                resources: { listChanged: false, subscribe: false },
              },
              serverInfo: { name, version },
              instructions:
                'NEXO: núcleo headless de manutenção do Windows. ' +
                'Comece por catalog_search; comandos destrutivos exigem confirm:true; ' +
                'use dry_run:true para pré-visualizar. agent_run para objetivos de múltiplos passos.',
            });
          }
          case 'ping':
            return ok(id, {});
          case 'tools/list':
            return ok(id, {
              tools: [...tools.entries()].map(([toolName, t]) => ({
                name: toolName,
                description: t.description,
                inputSchema: t.inputSchema,
              })),
            });
          case 'tools/call': {
            const toolName = params?.name;
            if (!toolName || !tools.has(toolName)) {
              return err(id, -32602, `Tool desconhecida: '${toolName}'. Disponíveis: ${[...tools.keys()].join(', ')}`);
            }
            const args = params?.arguments ?? {};
            const tool = tools.get(toolName);
            // validação mínima de campos obrigatórios
            for (const req of tool.inputSchema.required ?? []) {
              if (args[req] === undefined) {
                return ok(id, {
                  content: [{ type: 'text', text: `Parâmetro obrigatório ausente: '${req}'. ${tool.description}` }],
                  isError: true,
                });
              }
            }
            const t0 = Date.now();
            const r = await tool.handler(args);
            return ok(id, {
              content: [{ type: 'text', text: r.text }],
              isError: !r.ok,
              ms: Date.now() - t0,
            });
          }
          case 'resources/list':
            return ok(id, { resources });
          case 'resources/read': {
            const uri = params?.uri;
            const res = resources.find((r) => r.uri === uri);
            if (!res) return err(id, -32602, `Recurso desconhecido: '${uri}'. Disponíveis: ${resources.map((r) => r.uri).join(', ')}`);
            const text = await res.read();
            return ok(id, {
              contents: [{ uri, mimeType: res.mimeType ?? 'text/plain', text }],
            });
          }
          default:
            return err(id, -32601, `Método não suportado: '${method}'`);
        }
      } catch (e) {
        return err(id, -32603, `Erro interno: ${e?.message ?? e}`);
      }
    },
  };
}
