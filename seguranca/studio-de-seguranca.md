# 🛡️ Studio de Segurança — Metodologias e Checklists

## Frameworks de referência
| Framework | Foco |
|---|---|
| MITRE ATT&CK | táticas e técnicas de adversários |
| OWASP Top 10 | riscos web |
| PTES | padrão de pentest |
| NIST CSF | gestão de risco |
| Cyber Kill Chain | fases de intrusão |

## Checklist: ambiente de lab seguro
- [ ] Rede isolada (VM/containers separados)
- [ ] Snapshots antes de testes destrutivos
- [ ] Alvos sempre próprios ou com autorização
- [ ] Logs de tudo que é testado
- [ ] Relatório ao final de cada sessão

## Labs práticos recomendados
- **HackTheBox** — máquinas e sherlocks
- **TryHackMe** — trilhas guiadas
- **PortSwigger Academy** — web security gratuito
- **PicoCTF** — CTF introdutório

## Modelo de relatório de sessão
```
# Sessão [data]
## Objetivo
## Alvo (autorização)
## Ferramentas usadas
## Achados
## Detecções/mitigações
## Próximos passos
```
