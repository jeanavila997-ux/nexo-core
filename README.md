# NEXO Core

**Núcleo headless MCP-first de agentes locais** — manutenção do Windows via catálogo de 451 comandos PowerShell, skills padronizadas, memória persistente e auditoria. **Zero dependências npm.**

Nascido do acervo em `E:\projetos`: o catálogo de comandos (`127.xlsx`), a visão headless/MCP do guia "Headless AI e Agentes Autônomos", as skills do padrão Anthropic (agentskills) e a disciplina de harness engineering. O frontend é o [chat-ia](../chat-ia), que consome este núcleo como cliente MCP.

## Arquitetura

```
SUPERFÍCIES (qualquer cliente MCP)
  chat-ia · Claude Code · apps próprios
        │  stdio (newline JSON-RPC)  ·  HTTP POST /mcp (127.0.0.1)
┌───────┴─────────────────────────────────────────┐
│ NÚCLEO HEADLESS                                  │
│  MCP: 9 tools + 4 resources                      │
│  Loop ReAct via Ollama (qualquer modelo local)   │
│  Gate determinístico p/ comandos destrutivos     │
│  Skills (SKILL.md, progressive disclosure)       │
│  Memória JSONL · Auditoria (máscara + SHA-256)   │
└──────────────────────────────────────────────────┘
```

## Quick start

```bash
node nexo.mjs catalog convert      # 127.xlsx → data/catalog/commands.json (451 comandos)
npm test                           # 53 testes
node nexo.mjs status               # diagnóstico (Ollama, catálogo, política)

# Servidor MCP (escolha um transporte)
node nexo.mjs serve-stdio          # para Claude Code / chat-ia
node nexo.mjs serve-http --port 8787

# Agente headless (verificação do loop, sem UI)
node nexo.mjs agent "Quanto de RAM livre eu tenho e quanto de espaço no disco?"
```

### Consumir no chat-ia
`env/mcp-servers.json` já inclui o nexo (`enabled: true`). Valide com:

```bash
cd ../chat-ia && node scripts/nexo-smoke.mjs
```

### Consumir no Claude Code
```json
{ "mcpServers": { "nexo": { "command": "node", "args": ["E:/projetos/nexo-core/nexo.mjs", "serve-stdio"] } } }
```

## Ferramentas MCP

| Tool | Descrição |
|---|---|
| `catalog_search` | Busca comandos por termos/categoria (busca em português) |
| `catalog_get` | Detalhes de um comando pelo id |
| `catalog_categories` | 36 categorias com contagens |
| `catalog_run` | Executa comando do catálogo — destrutivos exigem `{"confirm": true}`; `{"dry_run": true}` pré-visualiza |
| `memory_save` / `memory_search` | Memória persistente local (JSONL) |
| `skills_list` / `skill_read` | Skills no formato Agent Skills (progressive disclosure) |
| `agent_run` | Loop ReAct completo via Ollama para objetivos de múltiplos passos |
| `shell_run` | PowerShell arbitrário — **só existe** com `shell_mode: "open"` na política |

Resources: `nexo://catalog`, `nexo://policy`, `nexo://skills`, `nexo://status`.

## Segurança (gate determinístico)

A política em `data/policy.json` decide ANTES de executar — nunca depende de prompt de LLM:

```json
{ "destructive": "confirm", "shell_mode": "catalog_only", "timeout_ms": 60000, "allow_ids": [], "deny_ids": [] }
```

- `destructive: "confirm"` → comandos ⚠️ do catálogo exigem `confirm: true` explícito
- `destructive: "deny"` → bloqueia todos; `"allow"` → libera
- `allow_ids` / `deny_ids` → exceções por id (deny vence sempre)
- `dry_run` funciona mesmo em destrutivos (pré-visualizar não executa nada)
- Toda execução vira linha em `data/logs/audit.jsonl` com argumentos mascarados (`****`) + SHA-256 do valor original

## Configuração (variáveis de ambiente)

| Var | Padrão | Uso |
|---|---|---|
| `NEXO_OLLAMA_HOST` | `http://127.0.0.1:11434` | Ollama |
| `NEXO_MODEL` | `gemma4:e2b-it-qat` | Modelo do loop ReAct |
| `NEXO_LLM_TIMEOUT` | `300000` | Timeout por chamada LLM (ms) |
| `NEXO_NUM_CTX` | `8192` | Contexto do modelo |
| `NEXO_NUM_PREDICT` | `220` | Teto de tokens por resposta (em CPU lenta, é a maior alavanca de velocidade) |
| `NEXO_SHELL` | `pwsh` | Shell do executor (`powershell` como fallback) |

## Skills

Pasta `data/skills/<nome>/SKILL.md` (padrão Agent Skills: frontmatter `name`/`description` + corpo). Progressive disclosure: `skills_list` devolve só metadados; `skill_read` carrega o corpo. Instaladas: `manutencao-windows`, `relatorio-sistema`.

## Estrutura

```
nexo-core/
├── nexo.mjs                  CLI (serve-stdio | serve-http | agent | catalog | memory | skills | status)
├── src/core/                 catalog · permissions · executor · tools · agent · memory · skills · audit
├── src/llm/ollama.mjs        Cliente Ollama (zero deps)
├── src/mcp/                  server · stdio · http (JSON-RPC 2.0, sem SDK)
├── src/util/xlsx.mjs         Leitor .xlsx puro (zip + XML)
├── data/catalog/commands.json   451 comandos convertidos do 127.xlsx
├── data/policy.json          Política de permissões
├── data/skills/              Skills instaladas
└── test/                     53 testes (node --test)
```

## Licença

MIT
