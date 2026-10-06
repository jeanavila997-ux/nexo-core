# ✅ Checklist de Pré-voo

## Antes de subir

- [ ] VPS provisionada (Ubuntu 24.04, SSH funcionando)
- [ ] Hardening: usuário não-root + UFW + fail2ban
- [ ] Node 22 + git + Ollama instalados
- [ ] Repo clonado em `/opt/nexo-core`
- [ ] `data/policy.json` revisado (destructive: deny na VPS!)
- [ ] Serviço systemd ativo (`systemctl status nexo`)
- [ ] Túnel Cloudflare configurado (ver `cloudflare-tunnel.md`)
- [ ] chat-ia apontando para o endpoint do túnel

## Segurança (não pular)

- [ ] **Nunca** expor a porta 8787 direto na internet (bind em 127.0.0.1)
- [ ] `shell_mode: "catalog_only"` — sem shell aberto na VPS
- [ ] Chaves de API em `.env` com `chmod 600` — nunca no git
- [ ] SSH por chave, senha desabilitada (`PasswordAuthentication no`)
- [ ] `journalctl -u nexo` revisado após primeiros testes
- [ ] Backup de `data/memory/` e `data/logs/` (auditoria)

## Dados que vou precisar em mãos

| Item | Onde está |
|---|---|
| IP + senha/chave SSH da VPS | painel Hostinger |
| Token Cloudflare (túnel) | dashboard Cloudflare → Zero Trust |
| Domínio para o túnel | Cloudflare DNS |
| Chaves de API dos provedores | env/.env do chat-ia |
| Modelo Ollama escolhido | definir: gemma3:4b / qwen2.5:7b |

## Teste de fumaça pós-deploy

```bash
# 1. serviço vivo
systemctl status nexo
# 2. MCP respondendo
curl -s http://127.0.0.1:8787/mcp ...
# 3. túnel roteando
curl -s https://nexo.seudominio.com/mcp ...
# 4. chat-ia conectando
node scripts/nexo-smoke.mjs
```
