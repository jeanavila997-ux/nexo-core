# 🚀 .deploy — Deploy do NEXO em VPS / Linux

> Pasta oculta de preparação para subir o nexo-core (e o ecossistema) para uma
> VPS Linux ou servidor local Linux. Tudo que você vai precisar está aqui.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `guia-vps.md` | Passo a passo completo: provisionar, instalar, rodar |
| `checklist.md` | Checklist de pré-voo e segurança |
| `env-exemplo.md` | Variáveis de ambiente e segredos |
| `cloudflare-tunnel.md` | Acesso remoto seguro sem abrir porta |
| `ideias-referencias.md` | Ideias, projetos e referências para aprender |

## Decisões já tomadas

- **Alvo**: VPS Hostinger (8 GB RAM) ou provedor local Linux
- **Transporte**: `serve-http` na VPS (stdio não existe entre máquinas)
- **Acesso remoto**: túnel Cloudflare (sem porta exposta)
- **LLM**: Ollama na VPS (8 GB → modelos até 7B/8B q4) ou API externa

## O que NÃO sobe (fica no pc2)

- ❌ Catálogo de comandos **PowerShell/Windows** (451 comandos) — não roda no Linux
- ✅ O que sobe: núcleo MCP, skills, memória, agente ReAct, auditoria

> 💡 Na VPS, o nexo-core vira **núcleo de conhecimento + agente**, não executor
> de comandos Windows. Para execução remota no pc2, o pc2 roda `serve-http`
> local e a VPS (ou o chat-ia) consome via túnel.

## Arquitetura alvo

```
┌──────────────┐   túnel CF    ┌─────────────────┐
│  chat-ia     │ ◄───────────► │  VPS Linux      │
│  (pc2)       │               │  └ nexo-core    │
│              │               │  └ Ollama       │
└──────────────┘               └─────────────────┘
       │
       └─ nexo local (stdio) → comandos Windows reais
```

Dois nexos: **local** (executor Windows, stdio) + **VPS** (conhecimento/agente, HTTP).
