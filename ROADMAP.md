# 🧭 ROADMAP DE EVOLUÇÃO — NEXO Core

> Destilado da auditoria arquitetural de 2026-10-06 (`auditorias/2026-10-06-arquitetura.md`).
> Direção: deixar de ser "agente que possui ferramentas" e virar **núcleo que
> governa quais agentes usam quais capacidades, sob quais condições e com qual
> evidência do resultado**.

## Princípios preservados

- ✅ Gate determinístico no núcleo — nunca depende de prompt de LLM
- ✅ Node puro, **zero dependências npm** — proteger essa simplicidade
- ✅ `shell_mode: "catalog_only"` como padrão — não abrir shell sem necessidade
- ✅ Nenhum agente conectado ao terminal admin sem passar pelo Policy Engine

## Fase 1 — Segurança (P0)

- [ ] **Risk Engine**: `destructive: bool` → `risk_level`:
      🟢 SAFE · 🟡 ATTENTION · 🔴 DANGEROUS · 🔐 SENSITIVE
- [ ] **Metadados por comando**: `requires_admin`, `requires_network`,
      `writes_files`, `changes_registry`, `changes_services`, `changes_firewall`,
      `downloads_content`, `executes_external_code`, `contains_secrets`,
      `requires_confirmation`, `rollback_available`, `platform`
- [ ] **Policy Engine v2**: identidade → intenção → tool → comando → risco →
      privilégio → política → aprovação → execução → verificação → auditoria
- [ ] **Execution Engine**: PLAN → DRY-RUN → APPROVAL → EXECUTE → **VERIFY**
      (exit 0 ≠ objetivo atingido; críticas ganham BACKUP → ROLLBACK)
- [ ] **Auditoria ampliada**: intenção, ferramenta, comando, permissão,
      resultado e efeito
- [ ] **Fronteira anti prompt-injection**: conteúdo de web/GitHub/RAG/skills
      externas = UNTRUSTED DATA — jamais pode virar `deny → allow`

## Fase 2 — Inteligência (P1)

- [ ] **Capability Profiles**: least privilege por agente
      (documentação: só `catalog_search`; diagnóstico: só 🟢; admin: 🟡/🔴 + confirm)
- [ ] **Tool Registry**: catálogo unificado (PowerShell, MCPs, plugins, APIs)
      com `name, type, permissions, risk, network, requires_auth, write_enabled`
- [ ] **Security Scanner**: análise estática pré-execução
      (Invoke-Expression, EncodedCommand, DownloadString, Set-MpPreference…)
      → "capacidades que exigem inspeção" (não veredito de malware)
- [ ] **Knowledge vs Memory**: `memory/` (o que aconteceu) separado de
      `knowledge/` (o que sabemos sobre um assunto)
- [ ] **4 agentes especializados**: Planner → Security → Executor → Auditor
      (Planner não executa; Security não executa; Executor não concede
      privilégios a si mesmo; Auditor verifica)

## Fase 3 — Ecossistema (P2)

- [ ] LLM Router (Ollama local + provedores conforme tarefa)
- [ ] Plugin/MCP Registry (GitHub, Supabase, Context7 como capacidades)
- [ ] Task Planner (decompor objetivos em DAG antes de executar)

## Fase 4 — Operação

- [ ] **Observabilidade**: eventos estruturados (`agent.started`,
      `tool.allowed`, `tool.denied`, `human.approved`, `command.executed`,
      `verification.passed`, `rollback.completed`…)
- [ ] Rollback/Recovery para mudanças críticas
- [ ] Dashboard: agente → ferramenta → execução → auditoria
- [ ] Acesso remoto controlado (ver `.deploy/`)

## Fase 5 — Autonomia

- [ ] Workflows multiagente com limites de custo, passos, tempo,
      privilégios e ferramentas

## Correções imediatas aplicadas

- [x] Divergência de contagem: README/ARQUITETURA atualizados 451 → **452** comandos
      (fonte de verdade: `package.json`, `catalog.mjs`, `tools.mjs`)
