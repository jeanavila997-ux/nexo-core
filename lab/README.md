# NEXO Lab — Red × Blue

Dashboard de laboratório local de segurança: dois perfis agênticos em confronto —
**vermelho** (ataque, agressivo e adaptativo) vs **azul** (defesa, que aprende a cada rodada).

## Componentes

| Arquivo | Função |
|---|---|
| `src/lib/engine.ts` | Motor da simulação: vetores de ataque/defesa, adaptação do azul, momentum do vermelho |
| `src/lib/registry.ts` | Registro central de 45 comandos (7 categorias) — fonte única do console |
| `src/lib/catalog.ts` | Loader do catálogo NEXO de 620 comandos (`public/data/catalogo.json`) |
| `src/lib/backend.ts` | Ponte com o servidor Termux (`/api/health`, `/api/exec`, `/api/speedtest`) |
| `src/hooks/useSimulation.ts` | Loop principal, console interativo, confirmação [S/N], histórico |
| `server/servidor.mjs` | Servidor Node zero-dependência: estático + execução real com whitelist |
| `server/speedtest.mjs` | Speedtest Ookla CLI (cache 5 min, dedupe) |
| `install-termux.sh` | Instalador para Android/Termux |
| `SYSTEM_PROMPT.md` | System prompt v2 dos agentes |

## Rodar local

```bash
npm install
npm run build
node server/servidor.mjs 8080
```

## Android (Termux)

```bash
pkg install nodejs
bash install-termux.sh
# abra http://localhost:8080
```

Veja `TERMUX.md` para detalhes (inclui instalação do binário Ookla speedtest).

> SIMULAÇÃO LOCAL — NENHUM SISTEMA REAL É AFETADO. A execução real passa
> apenas pela whitelist do servidor (`scan`, `net`, `status`, `mem`, `ps`,
> `disk`, `sys`, `whoami`, `id`, `pkg`) — nada destrutivo.
