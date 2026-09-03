# PLAN.md

## Tarefa

Construir o núcleo headless MCP-first (nexo-core) a partir do acervo de documentos em E:\projetos.

## Contexto

O acervo (24+ archives) converge para um hub de agentes locais headless: catálogo de comandos do 127.xlsx, skills no padrão Anthropic, memória estilo Mem0, auditoria padrão MULT-CHAT-HUB e loop de agente local via Ollama. O usuário escolheu "só o núcleo headless" (sem UI) e definiu que o frontend será o chat-ia (cliente MCP existente).

## Abordagem

Node puro ESM com zero dependências npm; MCP (JSON-RPC 2.0) implementado à mão para stdio e HTTP; loop ReAct em texto puro (compatível com qualquer modelo local); gate de permissão determinístico antes de qualquer execução; skills e memória em arquivos simples. Uma única implementação de tools serve às duas superfícies (MCP e loop do agente).

## Milestones

- [x] **M1: Scaffold + catálogo** — conversão do 127.xlsx com leitor .xlsx puro | verify: `node nexo.mjs catalog convert` → 451 comandos
- [x] **M2: Módulos core** — catalog, permissions, executor, memory, skills, audit, tools | verify: `npm test` (52 testes)
- [x] **M3: Servidor MCP stdio** — initialize/tools/tools.call + e2e com cliente real | verify: `node --test test/mcp-stdio.e2e.test.mjs`
- [x] **M4: Loop ReAct via Ollama** — corrigido timeout (300s), cheat-sheet de argumentos, `num_predict` e busca OR | verify: `node nexo.mjs agent "Quanto de RAM livre...?"` → resposta correta em 3 passos
- [x] **M5: HTTP + docs + artefatos** — smoke HTTP ok; README/AGENTS/PLAN/IMPLEMENT/CHECKLIST | verify: smoke em :8790 + `npm test` (53 testes)
- [x] **M6: Integração chat-ia** — mcp-servers.json + timeout configurável + smoke | verify: `node scripts/nexo-smoke.mjs` no chat-ia (exit 0)

## Escopo

Dentro do escopo:
- Núcleo headless (tools, skills, memória, audit, loop, 2 transportes), testes e artefatos de harness
- Config de integração no chat-ia (mcp-servers.json + timeout + smoke script)

Fora do escopo (explícito):
- Qualquer UI/dashboard (o frontend é o chat-ia existente)
- Embeddings vetoriais na memória (busca por termos basta; mem0-style fica para depois)
- OpenAI-compatible API no núcleo (MCP cobre o contrato)
- Transporte SSE do MCP (o chat-ia usa stdio)

## Riscos

- Ollama 100% CPU (~6 tok/s) → mitigado com `num_predict=220` e pensamentos curtos
- Modelos pequenos chutam nomes de campos → sinônimos nas tools + cheat-sheet no prompt
- Sessão única do LLM pode se perder → max_steps + audit de cada passo

## Decisões (log)

Ver IMPLEMENT.md.
