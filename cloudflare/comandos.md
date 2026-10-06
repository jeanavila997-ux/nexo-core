# ☁️ Cloudflare — Comandos e Referências

## Wrangler CLI (Workers)
```bash
npm install -g wrangler
wrangler login
wrangler init meu-worker
wrangler dev                 # teste local
wrangler deploy              # deploy
wrangler tail                # logs ao vivo
```

## R2 (storage)
```bash
wrangler r2 bucket create meu-bucket
wrangler r2 object put meu-bucket/arquivo --file=./arquivo
```

## DNS / domínios
- API: `https://api.cloudflare.com/client/v4/zones`
- Plugin MCP Cloudflare disponível no Kimi (2500+ endpoints)

## Zero Trust / Túnel
```bash
cloudflared tunnel login
cloudflared tunnel create lab-tunnel
cloudflared tunnel route dns lab-tunnel app.meudominio.com
```

## Casos de uso no lab
- [ ] Worker como proxy de API para o MULT-CHAT-HUB
- [ ] Túnel para expor serviços locais do pc2 com segurança
- [ ] R2 para backup de artefatos do lab
