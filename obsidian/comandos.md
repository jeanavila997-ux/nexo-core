# 📝 Obsidian — Comandos e Integração

## URI Scheme (automação)
```
obsidian://open?vault=COFRE%20REMOTO&file=ref%2Farquivo
obsidian://search?vault=NOME&query=termo
obsidian://new?vault=NOME&file=daily/nota&append=true
```

## Shortcuts / comandos de voz do lab
| Comando | Ação |
|---|---|
| `obsidian daily` | abre nota diária |
| `obsidian search <termo>` | busca no vault |
| `obsidian daily:append <texto>` | anexa na nota diária |

## Workflow: Kimi → Obsidian
```
1. Kimi gera conteúdo (relatório, prompt, análise)
2. Salva como .md
3. Commit no repo do vault OU append via URI scheme
4. Vault versionado com git plugin
```

## Plugins recomendados
- **Templater** — templates dinâmicos
- **Dataview** — queries nas notas
- **Git** — backup automático
- **Excalidraw** — diagramas

## Vaults do lab
- `COFRE REMOTO` — referências e PDFs
- `Obsidian Sandbox` — testes e rascunhos
