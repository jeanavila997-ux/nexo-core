# 🟠 Comandos Ubuntu — Setup e Administração

## Pacotes
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget htop net-tools ufw
sudo apt autoremove -y
```

## Firewall (UFW)
```bash
sudo ufw enable
sudo ufw allow 22/tcp        # SSH
sudo ufw status verbose
sudo ufw deny 23/tcp         # bloquear telnet
```

## Serviços
```bash
systemctl status nginx
systemctl enable --now ssh
systemctl list-units --failed
```

## Segurança básica
```bash
sudo apt install fail2ban -y           # anti brute-force
sudo unattended-upgrades               # updates automáticos
sudo ss -tulnp                         # auditoria de portas
```

## WSL (pc2)
```powershell
wsl --list --verbose
wsl --update
wsl -d Ubuntu
```
