# 🖥️ Guia VPS — Passo a Passo

## 1. Provisionar a VPS

Requisitos mínimos (Hostinger 8 GB atende bem):
- Ubuntu 24.04 LTS
- 2 vCPU / 8 GB RAM
- Acesso SSH

## 2. Setup inicial (hardening básico)

```bash
# atualizar
sudo apt update && sudo apt upgrade -y

# criar usuário não-root
sudo adduser nexo
sudo usermod -aG sudo nexo

# firewall
sudo ufw allow 22/tcp
sudo ufw enable

# fail2ban (anti brute-force SSH)
sudo apt install fail2ban -y
```

## 3. Instalar dependências

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git

# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gemma3:4b        # cabe em 8 GB RAM
ollama pull nomic-embed-text # embeddings (para RAG futuro)
```

## 4. Subir o nexo-core

```bash
cd /opt
sudo git clone https://github.com/jeanavila997-ux/nexo-core
sudo chown -R nexo:nexo nexo-core
cd nexo-core

# política segura para VPS (nada destrutivo, sem shell aberto)
cat > data/policy.json <<'EOF'
{ "destructive": "deny", "shell_mode": "catalog_only", "timeout_ms": 60000, "allow_ids": [], "deny_ids": [] }
EOF

# rodar em HTTP só na loopback (o túnel CF expõe com segurança)
NEXO_OLLAMA_HOST=http://127.0.0.1:11434 \
node nexo.mjs serve-http --port 8787
```

## 5. Rodar como serviço (systemd)

```ini
# /etc/systemd/system/nexo.service
[Unit]
Description=NEXO Core MCP Server
After=network.target ollama.service

[Service]
User=nexo
WorkingDirectory=/opt/nexo-core
Environment=NEXO_OLLAMA_HOST=http://127.0.0.1:11434
Environment=NEXO_MODEL=gemma3:4b
ExecStart=/usr/bin/node nexo.mjs serve-http --port 8787
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nexo
sudo systemctl status nexo
journalctl -u nexo -f    # logs ao vivo
```

## 6. Validar

```bash
curl -s http://127.0.0.1:8787/mcp -X POST \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
