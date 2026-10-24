# VPS_DEPLOY.md — Guia padrão de acesso e deploy

> Arquivo genérico para todos os apps e agentes do Jean Avila (dev do agro).
> Copie para a raiz de cada repositório. **Nunca coloque senhas, tokens ou chaves privadas aqui.**
> Valores reais (IP, portas internas, URLs de painéis) ficam em `VPS_DEPLOY.privado.md`, fora do Git — os repositórios são públicos.

## 1. Servidor

| Item | Valor |
|---|---|
| Provedor | Hostinger VPS |
| Hostname | `srv1483039` |
| Sistema | Ubuntu 24.04 (4 CPU, 15 GB RAM) |
| IP | `<IP_DA_VPS>` |
| Usuário de deploy | `deploy` (recomendado; hoje o acesso é por `root` com chave) |
| Pasta dos apps | `/opt/apps/<nome-do-app>` |
| Domínio | sem domínio próprio: `<app>.<IP-COM-HIFENS>.sslip.io` (resolve pro IP) |
| Proxy HTTPS | Traefik já existente (Docker Manager da Hostinger, pasta do Traefik), Let's Encrypt via resolver `letsencrypt` |

## 2. Acesso (somente por chave SSH)

```bash
ssh deploy@<IP_DA_VPS>   # hoje: ssh root@<IP_DA_VPS>
```

- Cada máquina ou agente usa **a própria chave** (`ssh-keygen -t ed25519`).
- A chave **pública** vai em `/home/deploy/.ssh/authorized_keys` na VPS.
- A chave **privada** nunca sai da máquina dela e nunca entra no Git.
- Para revogar um agente: apague a linha dele em `authorized_keys`.

## 3. Variáveis de ambiente (segredos)

- Ficam só na VPS, em `/opt/apps/<nome-do-app>/.env` (permissão `600`).
- No repositório, mantenha apenas um `.env.example` com os nomes e sem valores.
- `.env` sempre listado no `.gitignore`.

## 4. Portas

Cada app escuta só em `127.0.0.1:<porta>` e o **Traefik** publica pra fora (80/443, com HTTPS automático).
O firewall (`ufw`) libera só 22, 80 e 443. Atenção: portas publicadas pelo Docker (`ports:`) **ignoram o ufw** —
sempre use `"127.0.0.1:<porta_host>:<porta_container>"` no compose.

| App | Porta interna | Domínio/rota |
|---|---|---|
| nexus-terminal | `127.0.0.1:3100` (container `nexus-terminal-nexus-1`, network host) | `https://nexus.<IP-COM-HIFENS>.sslip.io` (basic auth) |
| Ollama (nativo) | `127.0.0.1:11434` | só interno (via `/api/ollama` do Nexus) |
| MySQL | `127.0.0.1:<porta>` | só interno (túnel SSH) |
| PostgreSQL | `127.0.0.1:<porta>` | só interno (túnel SSH) |
| Adminer | `127.0.0.1:32771` | `(ver VPS_DEPLOY.privado.md)` (Traefik) |
| 9Router | `127.0.0.1:<porta>` | `(ver VPS_DEPLOY.privado.md)` (Traefik) |
| open-webui | `127.0.0.1:<porta>` | — |
| `<outro-app>` | 3101 | `<app>.<IP-COM-HIFENS>.sslip.io` |

Acesso a banco pelo PC: `ssh -L 5432:127.0.0.1:<porta_pg> root@<IP_DA_VPS>` e conecte em `127.0.0.1:5432`.

## 5. Deploy padrão (Node / Vite / React)

```bash
cd /opt/apps/<nome-do-app>
git pull
npm ci
npm run build
pm2 restart <nome-do-app> || pm2 start npm --name <nome-do-app> -- run start
pm2 save
```

Apps só com front-end (Vite build): sirva a pasta `dist/` com um servidor Node mínimo (como o `server.mjs` do Nexus) atrás do Traefik.

### Nexus Terminal (como está hoje)

```bash
cd /opt/apps/nexus-terminal
git pull
npm ci && npm run build          # não rode `npm run dev` (predev usa pwsh/Windows)
docker compose up -d             # usa docker-compose.yml + server.mjs locais (não versionados)
docker compose restart           # após novo build
```

- `server.mjs` serve `dist/` e faz os mesmos proxies do `vite.config.ts`: `/api/ollama` → `127.0.0.1:11434`, `/api/router` → `127.0.0.1:<porta_router>` com `Authorization: Bearer $ROUTER_API_KEY` (a chave fica só no servidor).
- Variáveis em `/opt/apps/nexus-terminal/.env` (600). Se `ROUTER_API_KEY` estiver vazio, `/api/router` responde 503.
- `server.mjs` e `docker-compose.yml` estão em `.git/info/exclude` (não vão pro GitHub).

### Python (bots e agentes)

```bash
cd /opt/apps/<nome-do-app>
git pull
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
pm2 restart <nome-do-app> || pm2 start "python main.py" --name <nome-do-app>
```

### Docker (alternativa)

```bash
cd /opt/apps/<nome-do-app>
git pull
docker compose up -d --build
```

## 6. Traefik (modelo por app)

O Traefik roda em `network_mode: host` com provider Docker (`exposedbydefault=false`), entrypoints `web` (:80, redireciona pra HTTPS) e `websecure` (:443), e certresolver `letsencrypt` (HTTP challenge).
Não precisa Nginx nem certbot: basta subir o app num container com labels. Modelo (o mesmo usado no Nexus):

```yaml
name: <nome-do-app>
services:
  app:
    image: node:22-alpine
    restart: unless-stopped
    network_mode: host            # Traefik (host) alcança 127.0.0.1:<porta>
    user: "1000:1000"
    working_dir: /app
    command: ["node", "server.mjs"]
    env_file: .env
    environment:
      HOST: 127.0.0.1
      PORT: "<porta>"
    volumes:
      - ./server.mjs:/app/server.mjs:ro
      - ./dist:/app/dist:ro
    labels:
      - traefik.enable=true
      - traefik.http.routers.<app>.rule=Host(`<app>.<IP-COM-HIFENS>.sslip.io`)
      - traefik.http.routers.<app>.entrypoints=websecure
      - traefik.http.routers.<app>.tls.certresolver=letsencrypt
      - traefik.http.routers.<app>.middlewares=<app>-auth
      # hash bcrypt (htpasswd -nB <usuario>), com cada $ escrito como $$
      - traefik.http.middlewares.<app>-auth.basicauth.users=<usuario>:<hash_bcrypt>
      - traefik.http.middlewares.<app>-auth.basicauth.removeheader=true
      - traefik.http.services.<app>.loadbalancer.server.port=<porta>
```

Apps em container normal (rede bridge, sem `network_mode: host`) também funcionam: não publique `ports:` e use `loadbalancer.server.port=<porta_do_container>`.

```bash
docker compose up -d
docker logs <container-do-traefik> --tail 50   # ver emissão do certificado
curl -I https://<app>.<IP-COM-HIFENS>.sslip.io    # 401 sem login, 200 com login
```

## 7. Regras de segurança

- Firewall (ativo): `ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable`. Lembre: Docker ignora o ufw, então bind em `127.0.0.1` no compose.
- Apps sem login próprio expostos na internet: proteger com basic auth do Traefik.
- Senha de login SSH desligada (`PasswordAuthentication no`) depois que as chaves funcionarem.
- Nada de senha padrão (ex.: `admin/admin123`) em produção.
- Apps com dados de clientes precisam de login antes de ir pro ar.
- Atualizar o sistema: `sudo apt update && sudo apt upgrade -y`.

## 8. Checklist para agentes de IA

Antes de mexer na VPS, o agente deve:

1. Ler este arquivo e o `README.md` do app.
2. Nunca imprimir, commitar ou enviar o conteúdo de `.env` ou de chaves.
3. Usar só a pasta do próprio app em `/opt/apps/`.
4. Confirmar com o Jean antes de apagar dados, mudar o firewall ou reiniciar o servidor.
5. Depois do deploy, testar com `curl -I http://127.0.0.1:<porta>`, `docker ps` e `curl -I https://<app>.<IP-COM-HIFENS>.sslip.io`.
