# Auditoria REA — Pacote Dev (120 comandos)

**Data:** 2026-10-27 · **Pacote:** `data/catalog/packs/rea-dev-pack.json` · **Origem:** lista de 120 comandos (Python, Git, Docker, Node/TS, utilitários Linux, Ollama)

**Base legal/escopo:** ferramentas públicas de código aberto + repositórios próprios (nexo-core, Mestre-do-PC-V10). Análise estática local; o MCP do REA não estava conectado na sessão, então a evidência vem de leitura direta do código (`catalog.mjs`, `tools.mjs`, `operation-registry.js`).

## Resumo executivo

- 120 comandos analisados: **40 novos**, **24 adaptados** (Linux/streaming → PowerShell/snapshot), **21 já existiam**, **35 bloqueados**.
- Resultado: **63 registros** entraram no catálogo (33 fixos + 30 parametrizados) → catálogo foi de 451 para 514.
- O nexo ganhou suporte a `params` com regex (antes executava `{{NOME}}` literal). Placeholder sem definição agora bloqueia a execução.
- Todo parâmetro rejeita `$ ` ( ) ; | & ' " \n`, path traversal (`..`) e query string em URL. Modelos `:cloud` bloqueados (dado privado não sai da máquina).

## Achados da engenharia reversa (evidência)

| Conclusão | Evidência | Confiança | Ação |
|---|---|---|---|
| `catalog_run` não substituía parâmetros | `tools.mjs` passava `cmd.cmd` direto ao executor; 4+ comandos legados com `{{NOME}}` (ex.: `encerrar_processo`) | alta | `resolveCommand()` + bloqueio de placeholder órfão |
| `catalog convert` apagaria qualquer import | `saveCatalog()` sobrescreve `commands.json` a partir do xlsx | alta | `convert` reaplica `data/catalog/packs/*.json` |
| `pip freeze > req.txt` gera UTF-16 no PowerShell 5.1 | comportamento do operador `>` no Windows PowerShell 5.1 | alta | `Out-File -Encoding utf8` |
| `curl` no PS 5.1 é alias do `Invoke-WebRequest` | `curl -I` falha por parâmetro ambíguo | alta | usar `curl.exe` |
| `find` no Windows é outro programa (busca texto) | `find.exe` nativo do Windows | alta | `Get-ChildItem -Filter` |
| `docker-compose` (v1) está descontinuado | Compose v2 é subcomando `docker compose` | alta | migrado para v2 |
| `ollama run nimble --ask` não é verificável | sem modelo/flag correspondente conhecidos | média (hipótese) | bloqueado; provável alucinação da lista |
| `ollama launch` / `launch claude --model` | sintaxe recente; não confirmada aqui | baixa | bloqueado até conferir doc oficial |
| `tail -f`, `docker logs -f`, `docker stats`, `journalctl -f` travam o executor | executor tem timeout e não segura stream | alta | snapshot (`-Tail N`, `--no-stream`) |

## Mapa completo (comando → destino)


### Python

| # | Comando original | Status | Destino / motivo |
|---|---|---|---|
| 1 | `python -c "..."` | ⛔ BLOQUEADO | execução de código arbitrário = bypass total da whitelist |
| 2 | `python --version` | ✔️ EXISTE | verificar_versao_python |
| 3 | `python -i script.py` | ⛔ BLOQUEADO | interativo; executor do Mestre não tem TTY |
| 4 | `python -m http.server 8000` | ⛔ BLOQUEADO | expõe a pasta na rede (bind 0.0.0.0); só no lab, manual |
| 5 | `python -m pip list` | ✔️ EXISTE | listar_pacotes_pip_instalados |
| 6 | `pip freeze > requirements.txt` | 🆕 NOVO | python_pip_freeze_requirements |
| 7 | `pip install pacote` | ✔️ EXISTE | instalar_pacote_pip_interativo (já valida regex) |
| 8 | `python -m py_compile script.py` | 🆕 NOVO | python_checar_sintaxe |
| 9 | `python -m pdb script.py` | ⛔ BLOQUEADO | depurador interativo |
| 10 | `python -m timeit "codigo"` | ⛔ BLOQUEADO | executa código arbitrário (mesmo risco do -c) |
| 11 | `python -m json.tool arquivo.json` | 🆕 NOVO | python_validar_json |
| 12 | `python -m zipfile -l arquivo.zip` | 🔁 ADAPTADO | listar_conteudo_zip (nativo .NET) |
| 13 | `python -m venv .venv` | ✔️ EXISTE | criar_ambiente_virtual_venv_interativo |
| 14 | `python -m unittest discover` | 🆕 NOVO | python_rodar_testes_unittest |
| 15 | `python -O script.py` | ⛔ BLOQUEADO | executa script arbitrário; usar só via agente de código com revisão |
| 16 | `python -W error script.py` | ⛔ BLOQUEADO | executa script arbitrário; usar só via agente de código com revisão |
| 17 | `python -X dev script.py` | ⛔ BLOQUEADO | executa script arbitrário; usar só via agente de código com revisão |
| 18 | `pip install -e .` | ⛔ BLOQUEADO | roda setup.py do projeto (código arbitrário); manual |
| 19 | `python -m site` | 🆕 NOVO | python_info_site_packages |
| 20 | `python -m ensurepip --upgrade` | 🆕 NOVO | python_reparar_pip_ensurepip |

### Git

| # | Comando original | Status | Destino / motivo |
|---|---|---|---|
| 1 | `git log --oneline --graph --decorate` | 🆕 NOVO | git_log_grafico (complementa git_log_ultimos_10) |
| 2 | `git diff` | 🆕 NOVO | git_diff_nao_preparado |
| 3 | `git diff --staged` | 🆕 NOVO | git_diff_staged |
| 4 | `git branch / -a` | 🔁 ADAPTADO | git_listar_branches_todas (ver_branch_atual já cobre locais) |
| 5 | `git switch -c nova-branch` | 🆕 NOVO | git_criar_branch |
| 6 | `git merge outra-branch` | ⛔ BLOQUEADO | gera conflito que exige resolução humana; fica com o agente de código, não com o executor |
| 7 | `git rebase main` | ⛔ BLOQUEADO | gera conflito que exige resolução humana; fica com o agente de código, não com o executor |
| 18 | `git cherry-pick <hash>` | ⛔ BLOQUEADO | gera conflito que exige resolução humana; fica com o agente de código, não com o executor |
| 8 | `git stash` | ✔️ EXISTE | git_stash_salvar_mudancas_temporariamente |
| 9 | `git stash pop` | ✔️ EXISTE | git_stash_pop_restaurar_mudancas |
| 10 | `git reset --soft HEAD~1` | 🆕 NOVO | git_desfazer_ultimo_commit_soft (com tag de backup) |
| 11 | `git reset --hard HEAD~1` | ⛔ BLOQUEADO | perda de dados irreversível para mudanças não commitadas; só manual |
| 12 | `git restore arquivo.txt` | 🆕 NOVO | git_descartar_alteracoes_arquivo (com backup no stash) |
| 13 | `git rm arquivo.txt` | ⛔ BLOQUEADO | apaga do disco; usar remoção via agente com confirmação |
| 14 | `git remote -v` | 🆕 NOVO | git_listar_remotos |
| 15 | `git remote add origin <url>` | ⛔ BLOQUEADO | troca o destino do push (risco de exfiltração); manual |
| 16 | `git tag -a v1.0 -m "..."` | 🆕 NOVO | git_criar_tag_versao |
| 17 | `git fetch --all` | 🆕 NOVO | git_fetch_todos |
| 19 | `git reflog` | 🆕 NOVO | git_reflog |
| 20 | `git config --global user.name "Seu Nome"` | ✔️ EXISTE | configurar_git_nome_email (⚠️ tem nome/e-mail fixos — virar template) |

### Docker

| # | Comando original | Status | Destino / motivo |
|---|---|---|---|
| 1 | `docker images` | 🆕 NOVO | docker_listar_imagens |
| 2 | `docker rmi nome` | 🆕 NOVO | docker_remover_imagem |
| 3 | `docker pull nome` | 🆕 NOVO | docker_baixar_imagem |
| 4 | `docker exec -it ctr bash` | ⛔ BLOQUEADO | shell interativo dentro do container = bypass da whitelist |
| 5 | `docker logs ctr (-f)` | 🔁 ADAPTADO | docker_logs_container (--tail N, sem -f) |
| 6 | `docker cp arquivo ctr:/caminho` | ⛔ BLOQUEADO | injeta arquivo arbitrário no container; manual |
| 7 | `docker cp ctr:/caminho .` | ⛔ BLOQUEADO | extração de arquivo; manual/agente com confirmação |
| 8 | `docker volume ls` | 🆕 NOVO | docker_listar_volumes |
| 9 | `docker volume create` | 🆕 NOVO | docker_criar_volume |
| 10 | `docker network ls` | 🆕 NOVO | docker_listar_redes |
| 11 | `docker network create` | 🆕 NOVO | docker_criar_rede |
| 12 | `docker system df` | 🆕 NOVO | docker_uso_disco |
| 13 | `docker system prune -af` | 🔁 ADAPTADO | docker_limpeza_segura (sem -a, sem volumes) |
| 14 | `docker stats` | 🔁 ADAPTADO | docker_stats_snapshot (--no-stream) |
| 15 | `docker inspect` | 🆕 NOVO | docker_inspecionar |
| 16 | `docker stop $(docker ps -q)` | 🔁 ADAPTADO | docker_parar_todos (sintaxe PowerShell) |
| 17 | `docker start` | 🆕 NOVO | docker_iniciar_container |
| 18 | `docker restart` | 🆕 NOVO | docker_reiniciar_container |
| 19 | `docker-compose logs -f` | 🔁 ADAPTADO | docker_compose_logs (Compose v2 'docker compose', sem -f) |
| 20 | `docker-compose ps` | 🔁 ADAPTADO | docker_compose_status (Compose v2) |

### Node.js

| # | Comando original | Status | Destino / motivo |
|---|---|---|---|
| 1 | `node -v` | ✔️ EXISTE | verificar_versao_node |
| 2 | `npm -v` | ✔️ EXISTE | verificar_versao_node |
| 3 | `npm init -y` | 🆕 NOVO | npm_iniciar_projeto (idempotente) |
| 4 | `npm install --save-dev pacote` | 🆕 NOVO | npm_instalar_dev_dependencia (--ignore-scripts) |
| 5 | `npm install -g pacote` | ⛔ BLOQUEADO | instalação global — política do Jean: só com aprovação explícita por comando |
| 6 | `npm update` | 🆕 NOVO | npm_atualizar_dependencias |
| 7 | `npm uninstall pacote` | 🆕 NOVO | npm_remover_pacote |
| 8 | `npm list` | 🆕 NOVO | npm_listar_dependencias |
| 9 | `npm list -g --depth=0` | ✔️ EXISTE | listar_pacotes_globais_npm |
| 10 | `npm run` | 🆕 NOVO | npm_listar_scripts |
| 11 | `npm test` | 🆕 NOVO | npm_rodar_testes |
| 12 | `npx pacote` | ⛔ BLOQUEADO | baixa e executa código remoto; política: só com aprovação explícita |
| 13 | `npm audit` | ✔️ EXISTE | auditar_seguranca_npm |
| 14 | `npm audit fix` | 🆕 NOVO | npm_audit_fix_seguro (sem --force, com backup) |
| 15 | `npm cache clean --force` | ✔️ EXISTE | limpar_cache_npm |
| 16 | `npm config list` | 🆕 NOVO | npm_ver_configuracao |
| 17 | `npm outdated` | ✔️ EXISTE | verificar_dependencias_desatualizadas_npm |
| 18 | `npm ci` | 🆕 NOVO | npm_ci_limpo |
| 19 | `node --inspect arquivo.js` | ⛔ BLOQUEADO | abre porta de debug (9229) = execução remota se exposta |
| 20 | `tsc --init` | 🆕 NOVO | ts_iniciar_tsconfig (tsc local) |

### Utilitários

| # | Comando original | Status | Destino / motivo |
|---|---|---|---|
| 1 | `grep "texto" arquivo` | 🔁 ADAPTADO | buscar_texto_em_arquivo (Select-String) |
| 2 | `grep -r "texto" ./pasta` | 🔁 ADAPTADO | buscar_texto_em_pasta |
| 3 | `find . -name "*.py"` | 🔁 ADAPTADO | encontrar_arquivos_por_tipo (⚠️ find.exe do Windows é outra coisa) |
| 4 | `sed -i 's/a/b/g' arquivo` | ⛔ BLOQUEADO | edição em massa de arquivo arbitrário; usar agente de código com diff |
| 5 | `awk '{print $1}' arquivo` | ⛔ BLOQUEADO | baixo valor no Windows; o agente faz parsing direto |
| 6 | `tail -f arquivo.log` | 🔁 ADAPTADO | ver_final_de_log (snapshot; streaming via Monitor do agente) |
| 7 | `ps aux \| grep processo` | 🔁 ADAPTADO | procurar_processo_por_nome |
| 8 | `kill -9 PID` | 🔁 ADAPTADO | encerrar_processo_por_pid (bloqueia processos críticos) |
| 9 | `df -h` | ✔️ EXISTE | categoria Disco (Get-Volume) — já coberto |
| 10 | `du -sh pasta/` | 🔁 ADAPTADO | tamanho_de_pasta |
| 11 | `curl -I http://exemplo.com` | 🔁 ADAPTADO | http_ver_cabecalhos (curl.exe; regex sem ?&; — lição do url_teste) |
| 12 | `curl -X POST -d '{json}' ...` | ⛔ BLOQUEADO | corpo arbitrário = canal de exfiltração; usar tool MCP dedicada por API |
| 13 | `wget <url>` | ⛔ BLOQUEADO | download de arquivo arbitrário exige aprovação por arquivo |
| 14 | `ssh usuario@host` | ⛔ BLOQUEADO | credenciais + destino remoto; fica no fluxo VPS_DEPLOY, não no catálogo |
| 15 | `scp arquivo host:/` | ⛔ BLOQUEADO | credenciais + destino remoto; fica no fluxo VPS_DEPLOY, não no catálogo |
| 16 | `rsync -avz ... host:/` | ⛔ BLOQUEADO | credenciais + destino remoto; fica no fluxo VPS_DEPLOY, não no catálogo |
| 17 | `chmod +x script.sh` | ⛔ BLOQUEADO | não se aplica ao Windows; o análogo (Unblock-File) remove a marca de internet = risco |
| 18 | `systemctl status servico` | 🔁 ADAPTADO | status_servico_windows |
| 19 | `journalctl -u servico -f` | 🔁 ADAPTADO | eventos_de_servico (Event Log do SCM) |
| 20 | `history \| grep comando` | 🔁 ADAPTADO | buscar_historico_powershell |

### Ollama

| # | Comando original | Status | Destino / motivo |
|---|---|---|---|
| 1 | `ollama pull` | ✔️ EXISTE | pull_modelo_ollama (template) |
| 2 | `ollama rm` | ✔️ EXISTE | remover_modelo_ollama (template) |
| 3 | `ollama ls` | ✔️ EXISTE | listar_modelos_ollama |
| 4 | `ollama ps` | 🆕 NOVO | ollama_modelos_em_execucao |
| 5 | `ollama show` | ✔️ EXISTE | ver_info_modelo_ollama (template) |
| 6 | `ollama stop` | 🆕 NOVO | ollama_parar_modelo |
| 7 | `ollama create -f Modelfile` | ✔️ EXISTE | criar_modelo_ollama (template) |
| 8 | `ollama cp` | ✔️ EXISTE | copiar_modelo_ollama (template) |
| 9 | `ollama push` | ⛔ BLOQUEADO | publica modelo fora da máquina (dado privado → externo) |
| 10 | `ollama signin` | ⛔ BLOQUEADO | autenticação de conta; manual |
| 11 | `ollama signout` | ⛔ BLOQUEADO | autenticação de conta; manual |
| 12 | `ollama launch` | ⛔ BLOQUEADO | menu interativo; ⚠️ confirmar sintaxe na doc oficial do Ollama |
| 13 | `ollama launch claude --model qwen3.5` | ⛔ BLOQUEADO | altera config de outro agente; manual. Confirmar flag na doc oficial |
| 14 | `ollama run embeddinggemma "texto"` | 🔁 ADAPTADO | ollama_gerar_embedding (API /api/embed) |
| 15 | `echo "texto" \| ollama run nomic-embed-text` | 🔁 ADAPTADO | ollama_gerar_embedding (mesmo template, nome_modelo=nomic-embed-text) |
| 16 | `ollama run modelo "...imagem.png"` | 🔁 ADAPTADO | ollama_descrever_imagem (API local, base64) |
| 17 | `ollama run nimble --ask "..." < ticket.txt` | ⛔ BLOQUEADO | HIPÓTESE: não existe modelo/flag 'nimble --ask' verificável no Ollama — provável alucinação da lista |
| 18 | `ollama serve` | 🔁 ADAPTADO | ollama_verificar_servidor (o app Windows já sobe o serve; checar em vez de subir 2º processo) |
| 19 | `ollama serve --help` | 🔁 ADAPTADO | ollama_ver_variaveis_servidor (mostra o que está configurado, não o help) |
| 20 | `ollama run modelo (""")` | ✔️ EXISTE | run_modelo_ollama (template) — multilinha é recurso do REPL, não do executor |

## Critérios de bloqueio (por que 35 ficaram fora)

- **Execução de código arbitrário** (`python -c`, `timeit`, `-O/-W/-X script`, `pip install -e .`, `npx`): seria um bypass da whitelist `catalog_only`.
- **Interativos** (`python -i`, `pdb`, `docker exec -it`, `ollama launch`): o executor não tem TTY.
- **Exposição de rede** (`python -m http.server`, `node --inspect`): abrem porta.
- **Perda irreversível** (`git reset --hard`, `git rm`, `docker system prune -af`): trocados por versões seguras quando possível.
- **Credenciais / destino remoto** (`ssh`, `scp`, `rsync`, `git remote add`, `ollama push/signin`, `curl -X POST`, `wget`): ficam no fluxo `VPS_DEPLOY.md` ou exigem aprovação por ação.
- **Política do Jean**: nada de `npm -g`/`npx` sem aprovação explícita; modelos `:cloud` contam como externos.

## Como usar

```powershell
node nexo.mjs catalog search "docker"
node nexo.mjs catalog get tamanho_de_pasta
# via MCP: catalog_run {"id":"tamanho_de_pasta","params":{"pasta":"C:\\Projetos"},"dry_run":true}
node nexo.mjs catalog import data/catalog/packs/rea-dev-pack.json   # reimportar (idempotente)
```

## Pendências

- Os comandos legados com `{{...}}` sem `params` (`encerrar_processo`, `desativar_servico`, `desinstalar_atualizacao`, etc.) agora **bloqueiam** em vez de rodar o placeholder literal. Próximo passo: portar as regexes do Mestre do PC (`allowed-operations.json → templates[].params`) para eles.
- Espelhar o pacote no Mestre do PC (`v10/allowed-operations.json`) — já validado contra o `OperationRegistry` real (63/63, 12 ataques por parâmetro).
- Testar no Windows real os comandos Docker/Ollama (aqui só dry-run + validação).

## Revisão 2 — achados do Codex (PR #2) e correções

| Achado | Gravidade | Correção | Teste de regressão |
|---|---|---|---|
| `pacote="--global"` virava `npm install -g` | P1 | regex npm não aceita `-` inicial + guarda global: nenhum parâmetro pode começar com `-` (injeção de argumento) | `--global`, `-g`, `--prefix=` rejeitados |
| `qwen3-vl:235b-cloud` escapava do bloqueio `:cloud` | P1 | regex bloqueia `cloud` em qualquer posição/caixa + checagem em execução via `/api/tags` (modelo instalado, sem `remote_host`/`remote_model`, > 10 MB) | 4 formatos de tag cloud rejeitados |
| `Set-Location` falho não parava o script (git reset em outro repo) | P1 | `-ErrorAction Stop` em todos os comandos de projeto | todos os comandos com `MESTRE_PROJETO_PATH` conferidos |
| Falha de comando nativo saía com exit 0 (auditoria registrava sucesso) | P2 | `exit $LASTEXITCODE` no ramo de falha; guardas `❌` usam `exit 1` | nenhum `❌ ...; return` restante |
| `git restore` aplicava stash antigo não relacionado | P2 | sem stash: confere `git status --porcelain`, copia o arquivo para `%TEMP%` e restaura | `stash` ausente do comando |

Achado extra (na validação contra o Mestre do PC): lookahead `(?!.*x)` vaza para o resto do comando no `OperationRegistry` do Mestre, que monta uma regex única para o comando inteiro. Corrigido para `(?![^"]*x)`, limitado ao valor entre aspas.
