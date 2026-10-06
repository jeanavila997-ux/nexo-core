# 🐧 Comandos Linux — Referência Geral

## Sistema
```bash
uname -a                    # info do kernel
df -h                       # disco
free -h                     # memória
htop / btop                 # processos
journalctl -xe              # logs systemd
```

## Rede
```bash
ip a                        # interfaces
ip r                        # rotas
ss -tulnp                   # portas
curl -v https://alvo.com    # teste HTTP verboso
dig alvo.com ANY            # DNS completo
traceroute alvo.com         # rota
```

## Arquivos e permissões
```bash
find / -name "*.log" -mtime -1        # logs modificados hoje
grep -rn "password" .                 # busca recursiva
chmod 600 ~/.ssh/id_rsa               # permissão correta chave
tar -czvf backup.tar.gz pasta/        # compactar
```

## Usuários e auditoria
```bash
last                    # logins
w                       # quem está logado
sudo -l                 # privilégios sudo
```
