---
description: Executa uma tarefa de código no NEXO Core respeitando escopo, permissões e portões de verificação do AGENTS.md
argument-hint: "<descrição da tarefa>"
---

# Tarefa — NEXO Core

Descrição da tarefa: **$ARGUMENTS**

Siga o ciclo em portões. As regras de escopo vêm do `AGENTS.md` (fonte única) — leia-o primeiro.

## Portão 0 — Plano antes de código
1. Reafirme a tarefa em 1-2 linhas e liste os arquivos que pretende tocar — todos devem estar no escopo **permitido**: `src/`, `test/`, `data/skills/`, `data/policy.json`, `nexo.mjs`.
2. Se a tarefa pedir mudar **contrato MCP** (nomes/schemas de tools do `src/mcp/`) ou editar `data/catalog/commands.json` à mão → **PARE e escalone ao humano** (AGENTS.md: clientes externos dependem — chat-ia e Claude Code).
3. Sem novas dependências npm — projeto é **zero-dependência por requisito** (`node:zlib`, `fetch` global, ESM puro com extensão `.mjs`).

## Portão 1 — Implementação
- Shape de resultado uniforme `{ ok, text }` em toda tool nova/alterada.
- Mensagens de tool de erro sempre dizem **o que fazer a seguir**.
- Comentários e strings de usuário em **pt-BR**.
- `permissions.mjs`: qualquer nova tool com efeito destrutivo deve nascer marcada `destructive` — sem `confirm: true` ela é proibida, inclusive em testes.

## Portão 2 — Verificação (obrigatório antes de "pronto")
Execute e reporte o resultado literal:
1. `npm test` → exigir **53/53** (ou o total atual) passando.
2. Smoke de integração no projeto irmão:
   ```
   cd ../chat-ia && node scripts/nexo-smoke.mjs
   ```
   → exigir **exit 0**.
3. Checklist do AGENTS.md: nenhum teste novo marcando destructive sem confirm; arquivos dentro do escopo.

## Portão 3 — Relatório
- Diff resumido (arquivos + linhas tocadas).
- Tabela dos portões: testes, smoke, escopo — cada um ✅/❌ com número real da saída.
- **Nunca** commite/ publique sem a suíte verde e confirmação do humano.

Regras: não invente resultados; se um portão falhar, o ciclo recomeça no Portão 1 com correção — nunca "declare pronto" com falha aberta.