# ☁️ Cloudflare Tunnel — Acesso Remoto Seguro

> Expõe o nexo da VPS sem abrir nenhuma porta no firewall.

## Setup

```bash
# instalar cloudflared na VPS
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared noble main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install cloudflared -y

# autenticar e criar túnel
cloudflared tunnel login
cloudflared tunnel create nexo
cloudflared tunnel route dns nexo nexo.seudominio.com
```

## Config (`/etc/cloudflared/config.yml`)

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /etc/cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: nexo.seudominio.com
    service: http://127.0.0.1:8787
  - service: http_status:404
```

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

## Proteger com Cloudflare Access (recomendado)

No dashboard Zero Trust → Access → Applications:
- App: `nexo.seudominio.com`
- Policy: apenas seu e-mail (OTP)
- Assim mesmo quem descobrir o hostname não passa da tela de login

## Verificar

```bash
curl -s https://nexo.seudominio.com/mcp -X POST \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
