# 🗺️ ARQUITETURA — Ecossistema NEXO

> Como o nexo-core se conecta aos outros projetos do laboratório.
> Missão: **APRENDER → ANALISAR → TESTAR → PROTEGER**

## Visão geral

```
┌─────────────────────────────────────────────────────┐
│ SUPERFÍCIES (clientes MCP)                          │
│                                                     │
│  💬 chat-ia (porta 7788) ← interface principal      │
│  🤖 Claude Code (CLI)                               │
│  🖥️ Mestre-do-PC-V10 launcher (porta 7777)          │
│  🌐 dify-mestre-integration (workflows Dify)        │
└──────────────┬──────────────────────────────────────┘
               │ MCP stdio (JSON-RPC) · HTTP POST /mcp
┌──────────────▼──────────────────────────────────────┐
│ 🧠 NEXO-CORE (núcleo headless — o "banco")          │
│  • Catálogo: 451 comandos PowerShell (127.xlsx)     │
│  • 9 tools MCP + 4 resources                        │
│  • Skills SKILL.md (progressive disclosure)         │
│  • Memória persistente JSONL                        │
│  • Auditoria SHA-256 + máscara de argumentos        │
│  • Loop ReAct via Ollama (qualquer modelo local)    │
│  • Gate determinístico anti-comando-destrutivo      │
└─────────────────────────────────────────────────────┘
```

## O fluxo da conexão (chat-ia ↔ nexo-core)

1. **Registro**: o chat-ia declara o nexo em `env/mcp-servers.json`:
   ```json
   "nexo": {
     "transport": "stdio",
     "command": "node",
     "args": ["<CAMINHO>/nexo-core/nexo.mjs", "serve-stdio"],
     "enabled": true
   }
   ```
2. **Boot**: ao subir (`iniciar-chat-ia.bat`), o chat-ia spawna o nexo-core
   como subprocesso stdio — não precisa de servidor separado.
3. **Tools disponíveis no chat**: `catalog_search`, `catalog_get`,
   `catalog_categories`, `catalog_run`, `memory_save`, `memory_search`,
   `skills_list`, `skill_read`, `agent_run` (+ `shell_run` se política abrir).
4. **Segurança atravessa a fronteira**: comandos ⚠️ chegam ao chat bloqueados
   (`isError`) até confirmação explícita `confirm: true`. A política
   (`data/policy.json`) decide no núcleo — nunca depende do LLM.
5. **Validação**: `cd ../chat-ia && node scripts/nexo-smoke.mjs`

## Papéis de cada repositório

| Repo | Papel | Conexão |
|---|---|---|
| **nexo-core** | Núcleo headless: catálogo, memória, skills, agente | servidor MCP |
| **chat-ia** | Frontend: chat multi-provedor, RAG, REPL, áudio | cliente MCP do nexo |
| **Mestre-do-PC-V10** | Launcher (porta 7777) + origem dos projetos | sobe o chat-ia |
| **dify-mestre-integration** | Workflows/agentes/RAG do Dify | servidor MCP (pode entrar no mesmo mcp-servers.json) |
| **base-clientes-mcp** | Base de dados de clientes | MCP separado — definir escopo vs. nexo |
| **vitrine-de-apps** | Orquestrador/vitrine dos projetos | painel |

## ⚠️ Pontos de atenção

1. **Caminhos**: o `mcp-servers.json` usa `E:/projetos/nexo-core` enquanto o
   README do chat-ia menciona `C:/Users/JEANPC`. Confirmar o caminho real no
   pc2 e padronizar (ideal: variável de ambiente `NEXO_HOME`).
2. **Sobreposição de "bancos"**: nexo-core (comandos/memória) vs.
   base-clientes-mcp (clientes). Escopo sugerido: nexo = conhecimento +
   automação do Windows; base-clientes = dados de negócio.
3. **HTTP vs stdio**: stdio é o transporte padrão (mais seguro, sem porta
   aberta). Use `serve-http --port 8787` só quando precisar de acesso fora
   do processo (ex.: VPS, testes remotos) — sempre em 127.0.0.1 ou via túnel
   Cloudflare.

## Transporte alternativo: Claude Code

```json
{ "mcpServers": { "nexo": { "command": "node", "args": ["<CAMINHO>/nexo-core/nexo.mjs", "serve-stdio"] } } }
```

## Roadmap de integração

- [ ] Padronizar caminhos via `NEXO_HOME`
- [ ] Registrar dify-mestre-integration no `mcp-servers.json` do chat-ia
- [ ] Definir fronteira nexo-core × base-clientes-mcp
- [ ] Túnel Cloudflare para acesso remoto seguro ao `serve-http`
- [ ] Smoke test automatizado no boot do `iniciar-chat-ia.bat`
