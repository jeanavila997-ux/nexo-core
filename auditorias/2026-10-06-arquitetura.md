# 📋 Auditoria Arquitetural — 2026-10-06

> Auditoria somente-leitura do NEXO Core (fonte externa, revisada e arquivada).
> Risco da atividade: 🟢 Seguro — somente leitura. Nada foi executado/modificado
> pelo auditor.

## [OBSERVADO] O que o NEXO já tem

Núcleo Node.js/ESM com MCP próprio, catálogo PowerShell, dry_run, gate
determinístico, memória JSONL, auditoria, skills, Ollama e agente ReAct.

**Divergência encontrada**: README.md e ARQUITETURA.md falavam em 451 comandos,
enquanto `package.json`, `catalog.mjs` e `tools.mjs` falam em 452. → **Corrigido
neste commit (452 como fonte de verdade).**

**Ponto central**: hoje o sistema só sabe `destructive: true/false` — para um
núcleo de automação e segurança, isso ficou simples demais.

## Tabela de melhorias

| Prioridade | Melhoria | Por quê |
|---|---|---|
| P0 | Risk Engine | Substituir boolean por classificação real de risco |
| P0 | Policy Engine v2 | Permissão por comando + agente + contexto + privilégio |
| P0 | Execução em duas etapas | PLAN → APPROVE → EXECUTE → VERIFY |
| P0 | Auditoria completa | Intenção, ferramenta, comando, permissão, resultado, efeito |
| P0 | Anti prompt injection | Skills/memória/web não autorizam execução |
| P1 | Tool Registry | Catálogo unificado: PowerShell, MCPs, plugins, APIs |
| P1 | Capability Profiles | Cada agente recebe só as ferramentas necessárias |
| P1 | Observability | Métricas de tools, erros, latência, bloqueios |
| P1 | Security Scanner | Análise estática de scripts antes da execução |
| P1 | Rollback/Recovery | Reversão para mudanças críticas |
| P2 | LLM Router | Ollama local + provedores conforme tarefa |
| P2 | Plugin/MCP Registry | GitHub, Supabase, Context7 como capacidades |
| P2 | Knowledge/RAG | Documentação técnica separada da memória |
| P2 | Task Planner | Decompor objetivos em DAG antes da execução |
| P2 | Dashboard | agente → ferramenta → execução → auditoria |

## 1. Risk Engine (prioridade máxima)

De `destructive = true/false` para níveis:

```
🟢 SAFE · 🟡 ATTENTION · 🔴 DANGEROUS · 🔐 SENSITIVE
```

Metadados por comando: `risk_level`, `requires_admin`, `requires_network`,
`writes_files`, `changes_registry`, `changes_services`, `changes_firewall`,
`downloads_content`, `executes_external_code`, `contains_secrets`,
`requires_confirmation`, `rollback_available`, `platform`.

> `Get-Process` não pode ser tratado como alteração de serviço, firewall,
> registro ou exclusão de arquivos.

## 2. Policy Engine v2

Preservar o gate determinístico (decisão no núcleo, nunca no LLM), evoluindo de
`comando → permitido/bloqueado` para:

```
IDENTIDADE → INTENÇÃO → TOOL → COMANDO → RISCO → PRIVILÉGIO →
POLÍTICA → APROVAÇÃO → EXECUÇÃO → VERIFICAÇÃO → AUDITORIA
```

Least privilege por agente: documentação só lê; diagnóstico só 🟢; admin 🟡/🔴
com confirmação.

## 3. Execution Engine

```
PLAN → DRY-RUN → APPROVAL → EXECUTE → VERIFY
```

Operações críticas:

```
BACKUP → EXECUTE → VERIFY → SUCCESS | ROLLBACK
```

**Detalhe-chave: VERIFY.** `exit_code = 0` ≠ objetivo atingido. Ex.: parar um
serviço exige `Get-Service` confirmando `Stopped` antes de marcar
`[EXECUTADO][VERIFICADO]`.

## 4. Security Scanner pré-execução

```
Command → Static Analyzer → Risk Engine → Policy → Executor
```

Padrões que exigem inspeção adicional (não são veredito de malware):
`Invoke-Expression`, `EncodedCommand`, `DownloadString`, `Invoke-WebRequest`,
`Start-Process`, `Remove-Item`, `Set-ExecutionPolicy`, `reg.exe`, `schtasks`,
`sc.exe`, `netsh`, `Set-MpPreference`.

## 5. Tool Registry

```
TOOLS/
├── terminal · filesystem · powershell · github · supabase
├── context7 · codex-security · web · ollama · databases
└── observability
```

Formato por ferramenta:

```json
{
  "name": "github",
  "type": "mcp",
  "permissions": ["read_repository"],
  "risk": "SAFE",
  "network": true,
  "requires_auth": true,
  "write_enabled": false
}
```

## 6. Memória ≠ Conhecimento

```
NEXO KNOWLEDGE
├── memory/     (sessions · preferences · decisions)  → "o que aconteceu?"
├── knowledge/  (powershell · windows · linux · networking · cyber · mcp)
│                                                      → "o que sabemos sobre X?"
├── skills/
└── audit/
```

## 7. Agentes especializados

Começar com **quatro** (evitar dezenas agora):

```
Planner → Security → Executor → Auditor
```

Planner não executa. Security não executa. Executor não decide os próprios
privilégios. Auditor verifica o resultado. → nenhum LLM único controla o ciclo.

## 8. Prompt injection como componente arquitetural

```
SYSTEM POLICY
      ▼
TRUST BOUNDARY
 ┌────┴─────┐
 GitHub  Web  Docs  RAG  Skills externas
```

Conteúdo recuperado = **UNTRUSTED DATA**, nunca SYSTEM INSTRUCTION. Nenhum
texto externo pode transformar `deny → allow`.

## 9. Observabilidade

Eventos estruturados: `agent.started`, `plan.created`, `tool.requested`,
`tool.allowed`, `tool.denied`, `command.previewed`, `human.approved`,
`command.executed`, `command.failed`, `verification.passed/failed`,
`rollback.started/completed`, `agent.finished`.

Painel futuro:

```
NEXO STATUS
Agents 4 · Tools 27 · Commands 452
Safe xxx · Attention xx · Dangerous xxx · Sensitive xx
Executions today 31 · Blocked 4 · Failed 2 · Approvals 3 · Rollbacks 1
```

## Arquitetura-alvo

```
                   NEXO CORE
             ┌────────┴────────┐
             │  ORCHESTRATOR   │
             └────────┬────────┘
              ┌───────▼────────┐
              │  TASK PLANNER  │
              └───────┬────────┘
        ┌─────────────▼─────────────┐
        │    CAPABILITY ROUTER      │
        └─────────────┬─────────────┘
     ┌────────────────┼─────────────────┐
     ↓                ↓                 ↓
 PowerShell         MCP             Plugins
 Catalog          Servers           / APIs
     └────────────────┼─────────────────┘
                      ↓
               SECURITY GATE → POLICY ENGINE → DRY RUN
                      ↓
             HUMAN APPROVAL (quando exigida)
                      ↓
                EXECUTOR → VERIFY → AUDIT / ROLLBACK
```

## O que NÃO fazer agora

- ❌ Vinte frameworks, LangChain, bancos vetoriais, montanha de dependências
  (proteger o Node puro zero-deps até haver necessidade concreta)
- ❌ `shell_mode: open` como padrão (`catalog_only` é barreira valiosa)
- ❌ Agentes ligados direto ao terminal admin sem Policy Engine

## Ordem de implementação recomendada

1. **Fase 1 — Segurança**: Risk Engine → Policy v2 → Capability Profiles →
   Verify → auditoria ampliada
2. **Fase 2 — Inteligência**: Planner → Tool Registry → Knowledge → LLM Router
3. **Fase 3 — Ecossistema**: GitHub → Context7 → Codex Security → Supabase → web
4. **Fase 4 — Operação**: observabilidade → rollback → dashboard → acesso remoto
5. **Fase 5 — Autonomia**: workflows multiagente com limites de custo, passos,
   tempo, privilégios e ferramentas
