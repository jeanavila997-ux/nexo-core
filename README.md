# nexo-core

Núcleo headless MCP-first do ecossistema NEXO — banco de dados central dos nossos **chats + agentes + sistemas**.

## Estrutura

| Caminho | Sistema | Descrição |
|---|---|---|
| `lab/` | **NEXO Lab** | Dashboard Red×Blue (React + Vite): simulação de ataque/defesa, terminal interativo com registro central de 45 comandos, catálogo de 620 comandos, servidor Node zero-dependência para execução real no Termux (Android), módulo speedtest Ookla. |
| `lab/SYSTEM_PROMPT.md` | Prompt do sistema v2 | Regras do registro de comandos, confirmação [S/N], whitelist de execução real. |
| `lab/server/` | Servidor Termux | `servidor.mjs` (API /api/exec com whitelist + /api/speedtest) e `speedtest.mjs`. |

## Como rodar o NEXO Lab

```bash
cd lab
npm install
npm run build
node server/servidor.mjs 8080   # ou no Termux: bash install-termux.sh
```

> SIMULAÇÃO LOCAL — comandos reais só passam pela whitelist do servidor, nada destrutivo.
