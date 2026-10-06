# 🟠 Claude Code — Comandos e Prompts

## Instalação e setup
```bash
npm install -g @anthropic-ai/claude-code
claude          # iniciar no diretório do projeto
```

## Comandos essenciais
| Comando | Função |
|---|---|
| `claude` | inicia sessão interativa |
| `claude -p "prompt"` | modo one-shot (headless) |
| `/init` | cria CLAUDE.md do projeto |
| `/clear` | limpa contexto |
| `/compact` | compacta histórico |
| `/agents` | gerencia subagentes |
| `claude --resume` | retoma sessão anterior |

## Prompts úteis
```
Analise este repositório e crie um CLAUDE.md com arquitetura, comandos de build
e convenções de código.
```
```
Crie um subagente de security review que roda antes de cada commit.
```
