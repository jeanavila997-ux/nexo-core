# AGENTS.md — NEXO Core

> Instruções para agentes de IA trabalhando neste repositório. Leia antes de qualquer tarefa.

## Visão do projeto

NEXO Core é um **núcleo headless MCP-first** em Node puro (ESM, zero dependências npm) para operação de manutenção do Windows por agentes locais. Ele expõe um catálogo de 451 comandos PowerShell (convertidos de `127.xlsx`), skills no formato Agent Skills, memória JSONL e um loop de agente ReAct via Ollama. O frontend é o chat-ia (repositório irmão), que consome este núcleo como cliente MCP via stdio.

## Estrutura

```
nexo.mjs               CLI e composição do núcleo
src/core/tools.mjs     Registro central de ferramentas (fonte única p/ MCP e agente)
src/core/agent.mjs     Loop ReAct (Thought/Action/Observation) + parser tolerante
src/core/permissions.mjs  Gate determinístico (destructive: confirm|allow|deny)
src/core/executor.mjs  Execução PowerShell (pwsh → powershell fallback)
src/core/catalog.mjs   Catálogo: conversão do 127.xlsx, busca (com fallback OR), categorias
src/core/memory.mjs    Memória JSONL com busca por termos
src/core/skills.mjs    SKILL.md (progressive disclosure)
src/core/audit.mjs     Auditoria: máscara '****' + SHA-256 do original
src/llm/ollama.mjs     Cliente Ollama (/api/chat, /api/tags)
src/mcp/               server.mjs (JSON-RPC 2.0) · stdio.mjs · http.mjs
src/util/xlsx.mjs      Leitor .xlsx puro (zip central directory + XML regex)
data/                  catalog/ · policy.json · skills/ · memory/ · logs/
test/                  53 testes com node:test
```

## Convenções

- **ESM puro** (`type: module`), sem TypeScript, sem dependências npm. Imports relativos com extensão `.mjs`.
- **Zero-dependência é requisito, não acaso**: nada de `require`, `npm install` ou SDKs. ZIP usa `node:zlib`; HTTP usa `fetch` global.
- Mensagens de tool de erro sempre dizem **o que fazer a seguir** (ex.: "use catalog_search para achar o id correto").
- Shape de resultado uniforme: `{ ok, text }` em todas as tools.
- Comentários e strings de usuário em **português (pt-BR)**.

## Permissões de ferramentas

Permitido:
- Ler/editar qualquer arquivo sob `src/`, `test/`, `data/skills/`, `data/policy.json`, `nexo.mjs`
- Rodar `npm test` (== `node --test`) e os comandos do CLI (`node nexo.mjs ...`)
- Rodar `node nexo.mjs catalog convert` para regenerar o catálogo a partir de `../127.xlsx`

Restrito (pergunte antes):
- Mudar o esquema de tools MCP (quebra clientes existentes — chat-ia e Claude Code)
- Alterar `data/catalog/commands.json` à mão (fonte de verdade é o 127.xlsx)

Não permitido:
- Novas dependências npm sem instrução explícita do humano
- Comandos destrutivos do catálogo SEM `confirm: true` — inclusive em testes
- Publicar/commitar sem a suíte de testes verde

## Limitações conhecidas

- O Ollama desta máquina roda **100% CPU** (~6 tok/s): o teto `NEXO_NUM_PREDICT=220` é essencial para o loop ser viável. Não aumente sem medir.
- `shell_run` só existe com `shell_mode: "open"` — é deliberado (superfície mínima).
- O transporte HTTP não implementa SSE/sessions do Streamable HTTP (responde JSON direto, stateless). Suficiente para clientes locais; estenda só se um cliente exigir.

## Portões de verificação

Antes de marcar qualquer tarefa completa:

- [ ] `npm test` — 53/53 passando
- [ ] `node scripts/nexo-smoke.mjs` no chat-ia (integração MCP) — exit 0
- [ ] Nenhum teste novo marcando destructive sem confirm
- [ ] Arquivos alterados dentro do escopo permitido acima

## Escalonamento

Se uma decisão exigir mudar o contrato MCP (nomes/schemas de tools), PARE e descreva o impacto para o humano — clientes externos dependem dele.
