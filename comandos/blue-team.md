# 🔵 Comandos Blue Team / Defesa

## Portas e serviços locais
```bash
ss -tulnp                              # portas abertas locais
sudo lsof -i -P -n | grep LISTEN       # processos escutando
```

## Análise de autenticação (brute force SSH)
```bash
grep "Failed password" /var/log/auth.log | tail -50
lastb | head -20                       # logins falhos
```

## Windows (PowerShell) — pc2 / Mestre do PC V10
```powershell
Get-NetTCPConnection -State Listen     # portas abertas
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20  # logons falhos
```
