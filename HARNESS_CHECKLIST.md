# HARNESS_CHECKLIST.md — NEXO Core

> Revisão antes de considerar o núcleo pronto. Item falhando = bloqueador; item pulado precisa de justificativa escrita.

## Instruções do agente (AGENTS.md)

- [x] Visão do projeto precisa e atualizada
- [x] Estrutura do repositório reflete o layout atual
- [x] Permissões explícitas — permitido, restrito e proibido especificados
- [x] Portões de verificação definidos e comandos corretos (`npm test`, smoke do chat-ia)
- [x] Sem instruções ambíguas

## Design de ferramentas

- [x] Cada tool tem nome claro e sem ambiguidade (9 tools, verbos de domínio: catalog/memory/skill/agent)
- [x] Schemas mínimos — nenhum campo opcional que o agente não usaria
- [x] Mensagens de erro dizem o que fazer a seguir (ex.: "use catalog_search para achar o id correto")
- [x] Retornos consistentes: `{ ok, text }` em todas as tools; MCP envolve em `content[0].text` + `isError`
- [x] Nenhuma tool faz mais de uma coisa conceitual (catalog_run NÃO aceita comando arbitrário — isso é shell_run, gated)

## Entrega de contexto

- [x] Contexto do agente é o necessário para a tarefa: cheat-sheet de argumentos + categorias, não o catálogo inteiro
- [x] Estado de longa duração em arquivos (memória JSONL, audit), não no prompt
- [x] Observações clipadas (2500 chars) para conter o crescimento do contexto
- [x] Sem dados sensíveis no contexto (audit mascara com '****' + SHA-256)

## Artefatos de planejamento

- [x] PLAN.md com milestones e comandos de verificação
- [x] Escopo dentro/fora escrito
- [x] IMPLEMENT.md registra decisões e desvios conforme aconteceram

## Permissões e sandbox

- [x] Mínimo de permissões: `shell_mode: "catalog_only"` por padrão (sem PowerShell arbitrário)
- [x] Operações destrutivas exigem confirmação explícita (`confirm: true`), decisão DETERMINÍSTICA da política
- [x] HTTP bindado apenas em 127.0.0.1
- [x] Executor com timeout (60s) e teto de saída (20k chars)

## Loop de verificação

- [x] 53 testes (unit + integração e2e stdio) rodam com `npm test`
- [x] O agente pode verificar a si mesmo (`nexo.mjs status` + smoke do chat-ia)
- [x] Critérios de eval definidos ANTES da tarefa (este checklist + PLAN.md)

## Quando um componente pode ser removido

| Componente | Existe porque | Pode ser removido quando |
|---|---|---|
| Gate confirm p/ destrutivos | Modelos pequenos não têm julgamento de segurança confiável | Modelos com garantias verificáveis de segurança + política por comando |
| Cheat-sheet de argumentos no prompt | Modelos locais pequenos chutam nomes de campos | Modelo segue inputSchema com confiabilidade (tool-calling nativo robusto) |
| num_predict=220 | Ollama 100% CPU (~6 tok/s) na máquina atual | Rodar em GPU/acelerador ou modelo + rápido |
| Busca fallback OR | Modelos empilham termos e frustram busca AND-only | Modelos buscam com termos atômicos consistentes |
| Máscara + hash na auditoria | Segredos podem passar por args de tools | Ambiente sem risco de vazamento de secrets |
| ReAct em texto (sem SDK MCP) | Zero deps e compatibilidade com qualquer modelo | Cliente MCP SDK oficial se o projeto aceitar dependências |

---

Revisado: 2026-09-03 · Revisor: Claude (build session)
