# 💡 Ideias, Projetos e Referências para Aprender

## Ideias para o nexo na VPS

1. **Nexo duplo** — local (executor Windows) + VPS (cérebro/memória)
2. **Memória compartilhada** — `memory_save` na VPS vira conhecimento
   acessível de qualquer dispositivo (pc2, celular, notebook)
3. **Hackbot de recon** — VPS roda recon passivo agendado (subfinder + httpx)
   e salva relatórios na memória do nexo
4. **Agente de vigilância** — cron diário: status da VPS, portas, logs →
   relatório na memória + alerta
5. **Ponte Obsidian** — notas do vault sincronizadas para a VPS viram
   conhecimento consultável pelo chat-ia
6. **MULT-CHAT-HUB na VPS** — hub multi-chat acessível de qualquer lugar
   via túnel

## Projetos de referência para estudar

| Projeto | O que aprender |
|---|---|
| [Mestre-do-PC-V10](https://github.com/jeanavila997-ux/Mestre-do-PC-V10) | origem do catálogo e launcher |
| [chat-ia](https://github.com/jeanavila997-ux/chat-ia) | cliente MCP, RAG offline, multi-provedor |
| [base-clientes-mcp](https://github.com/jeanavila997-ux/base-clientes-mcp) | outro padrão de MCP server com dados |
| [dify-mestre-integration](https://github.com/jeanavila997-ux/dify-mestre-integration) | workflows Dify via MCP |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | estrutura de skills reutilizáveis |
| [trimstray/the-book-of-secret-knowledge](https://github.com/trimstray/the-book-of-secret-knowledge) | ferramentas e listas de sysadmin/sec |

## Trilha de aprendizado sugerida

```
Semana 1: VPS + hardening + systemd (guia-vps.md)
Semana 2: Cloudflare Tunnel + Access (cloudflare-tunnel.md)
Semana 3: Nexo duplo (local + VPS) + memória compartilhada
Semana 4: Primeiro hackbot agendado + relatório automático
```

## Conceitos para dominar

- **MCP** (Model Context Protocol) — stdio vs HTTP/SSE
- **systemd** — serviços, restart, logs (journalctl)
- **Reverse tunnel** — por que túnel > porta aberta
- **Ollama em CPU** — quantização q4, num_ctx, num_predict
- **Zero Trust** — Cloudflare Access como portão
