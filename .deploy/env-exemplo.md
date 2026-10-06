# 🔐 Variáveis de Ambiente e Segredos

## nexo-core na VPS

```bash
# /etc/systemd/system/nexo.service.d/override.conf  (ou Environment= na unit)
NEXO_OLLAMA_HOST=http://127.0.0.1:11434
NEXO_MODEL=gemma3:4b          # 8 GB RAM: até 7b/8b q4
NEXO_LLM_TIMEOUT=300000
NEXO_NUM_CTX=8192
NEXO_NUM_PREDICT=220          # CPU de VPS: maior alavanca de velocidade
NEXO_SHELL=bash               # Linux! (padrão pwsh é do pc2)
```

## chat-ia (cliente) apontando para a VPS

`env/mcp-servers.json` — trocar stdio local por HTTP via túnel:

```json
{
  "servers": {
    "nexo_local": {
      "label": "NEXO local (executor Windows)",
      "transport": "stdio",
      "command": "node",
      "args": ["E:/projetos/nexo-core/nexo.mjs", "serve-stdio"],
      "enabled": true
    },
    "nexo_vps": {
      "label": "NEXO VPS (conhecimento/agente)",
      "transport": "sse",
      "url": "https://nexo.seudominio.com/mcp",
      "enabled": false
    }
  }
}
```

> Rodar os DOIS: local executa comandos Windows de verdade; VPS responde
> conhecimento/memória/agente.

## Regras de ouro

1. Segredos só em `.env` (chmod 600) ou systemd override — **nunca no git**
2. `.gitignore` já deve cobrir: `.env`, `data/memory/`, `data/logs/`
3. Rotacionar token do Cloudflare a cada 90 dias
4. Uma chave de API por projeto (não reutilizar entre lab e produção)
