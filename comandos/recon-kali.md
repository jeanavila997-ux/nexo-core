# 🔴 Comandos Red Team / Recon (Kali Linux)

> Executar somente contra alvos autorizados.

## Descoberta de subdomínios
```bash
subfinder -d alvo.com -silent          # subdomínios passivos
amass enum -passive -d alvo.com        # enumeração ampla passiva
```

## Probing e fingerprint
```bash
httpx -l subs.txt -title -tech-detect  # probing HTTP + tecnologias
dnsx -l subs.txt -a -resp              # resolução DNS em massa
```

## WHOIS / OSINT
```bash
whois alvo.com                         # WHOIS básico
curl -s "https://crt.sh/?q=%25.alvo.com&output=json" | jq -r '.[].name_value' | sort -u
```

## Varredura de portas
```bash
nmap -sV -sC -O alvo.local             # varredura com scripts padrão
nmap -p- --min-rate 1000 alvo.local    # varredura completa de portas
```
