# VPS_DEPLOY.md — Guia padrão de acesso e deploy

> Arquivo genérico para todos os apps e agentes do Jean Avila (dev do agro).
> Copie para a raiz de cada repositório. **Nunca coloque senhas, tokens ou chaves privadas aqui.**

## 1. Servidor

| Item | Valor |
|---|---|
| Provedor | Hostinger VPS |
| Hostname | `srv1483039` |
| Sistema | Ubuntu |
| IP | `<IP_DA_VPS>` (preencher) |
| Usuário de deploy | `deploy` (evitar usar `root` no dia a dia) |
| Pasta dos apps | `/opt/apps/<nome-do-app>` |
| Domínio (opcional) | `<app>.<seu-dominio>` |

## 2. Acesso (somente por chave SSH)

```bash
ssh deploy@<IP_DA_VPS>
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

Cada app escuta só em `127.0.0.1:<porta>`, e o Nginx publica pra fora (80/443).

| App | Porta interna | Domínio/rota |
|---|---|---|
| nexus-terminal | 3000 | `nexus.<dominio>` |
| `<outro-app>` | 3001 | `...` |
| `<agente>` | 3002 | `...` |

## 5. Deploy padrão (Node / Vite / React)

```bash
cd /opt/apps/<nome-do-app>
git pull
npm ci
npm run build
pm2 restart <nome-do-app> || pm2 start npm --name <nome-do-app> -- run start
pm2 save
```

Apps só com front-end (Vite build): sirva a pasta `dist/` direto pelo Nginx.

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

## 6. Nginx (modelo por app)

`/etc/nginx/sites-available/<nome-do-app>`

```nginx
server {
    server_name <app>.<seu-dominio>;
    location / {
        proxy_pass http://127.0.0.1:<porta>;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/<nome-do-app> /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d <app>.<seu-dominio>   # HTTPS grátis
```

## 7. Regras de segurança

- Firewall: `ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable`.
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
5. Depois do deploy, testar com `curl -I http://127.0.0.1:<porta>` e `pm2 status`.
