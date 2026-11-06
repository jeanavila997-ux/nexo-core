# 📚 NEXO-CORE — Biblioteca Central do Laboratório

Hub de conhecimento do LabTest-X: comandos, prompts, skills, plugins e referências.

**Missão: APRENDER → ANALISAR → TESTAR → PROTEGER**

## Mapa de pastas

| Pasta | Conteúdo |
|---|---|
| `prompts/` | Prompts por área (red team, blue team, AI, tendências, pesquisa hacking) |
| `comandos/` | Comandos por plataforma (Kali, Ubuntu, Linux geral, Windows) |
| `skills/` | Skills e habilidades (Kimi, Claude Skills, custom) |
| `plugins/` | Plugins MCP e integrações |
| `llms/` | Outras LLMs e CLIs (Claude Code, Gemini, Ollama) |
| `terminais/` | Terminais agênticos e TUIs (Hyper, Warp, etc.) |
| `obsidian/` | Comandos e integração com vault Obsidian |
| `cloudflare/` | Cloudflare: Workers, DNS, Zero Trust |
| `seguranca/` | Studio de segurança: metodologias, checklists, CTF |
| `referencias/` | Sites e links de referência |
| `hyperframes/` | Hyperframes e frameworks de automação |

⚠️ Todo material é para uso em ambientes autorizados e de laboratório.

## Fronteira entre esta biblioteca e o catálogo MCP

Esta página continua sendo a biblioteca central versionada em Git. O índice abaixo guarda referências de aprendizado para achar e estudar. Ele não é o banco de produção do MCP. Esta mudança não criou registro de banco, não rodou migração e não fez deploy.

O catálogo executável segue em `data/catalog/commands.json`: comandos PowerShell, com as categorias que esse arquivo já tinha, expostos por `catalog_search`, `catalog_get` e `catalog_categories`. As skills que o processo MCP carrega seguem somente em `data/skills/` (`skills_list` e `skill_read`). Ler uma linha daqui não instala, não clona e não executa o projeto citado.

A numeração "Categoria N" e "N.M" é só ordem de exibição. Ela não substitui caminho de arquivo, id de comando, nome de skill instalada nem chave de API. A ordem é alfabética em português, sem diferenciar maiúsculas de minúsculas nem acentos, primeiro o rótulo da categoria e depois o título de cada item. O exemplo "Categoria 1 — Skills / 1.1" era formato, não uma ordem forçada: Skills ocupa a posição alfabética.

Três rótulos pedidos entram distintos, junto das áreas que a biblioteca já tinha: **Skills**, **Repositórios traders** e **Engenharia reversa**.

O mapa de pastas acima foi mantido. A pasta `plugins/` continua no mapa e não existe neste repositório; os plugins citados permanecem nos arquivos de origem e na categoria Plugins. Nenhum arquivo antigo foi movido, renomeado ou apagado. Quando a mesma URL já estava em mais de um arquivo, o índice a lista uma vez e os arquivos originais ficam como estavam.

Estado **documentação lida** quer dizer que o texto citado foi lido. Não quer dizer testado. **Auditoria de código: não auditado** em todo item externo: ler licença, README ou frontmatter não audita o código. Dado de mercado, paper trading, confirmação de ordem e "odds" de simulação são alegações dos projetos de origem. Este índice não os trata como tempo real, nem como prova de lucro, nem como permissão para operar.

## Índice por categoria

| Nº | Categoria | Itens |
|---|---|---|
| 1 | Cloudflare | 7 |
| 2 | Comandos | 24 |
| 3 | Engenharia reversa | 1 |
| 4 | Hyperframes | 8 |
| 5 | LLMs | 4 |
| 6 | Obsidian | 9 |
| 7 | Plugins | 6 |
| 8 | Prompts | 23 |
| 9 | Referências | 17 |
| 10 | Repositórios traders | 3 |
| 11 | Segurança | 8 |
| 12 | Skills | 31 |
| 13 | Terminais | 9 |

## Categoria 1 — Cloudflare

Itens já descritos em `cloudflare/comandos.md`. O índice não copia os comandos Wrangler nem pede deploy.

### 1.1 API de zonas DNS

- Tipo: referência
- Assunto: endpoint de zonas citado no guia local de Cloudflare
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- URL: https://api.cloudflare.com/client/v4/zones
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 1.2 R2

- Tipo: documento
- Assunto: armazenamento R2 via Wrangler, como anotado no guia local
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 1.3 R2 para backup de artefatos do lab

- Tipo: documento
- Assunto: caso de uso em aberto no guia local; não é um bucket criado por este índice
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 1.4 Túnel para expor serviços locais do pc2

- Tipo: documento
- Assunto: caso de uso em aberto no guia local; este índice não abre túnel nem porta
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 1.5 Worker como proxy de API para o MULT-CHAT-HUB

- Tipo: documento
- Assunto: caso de uso em aberto no guia local; este índice não faz deploy
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 1.6 Wrangler CLI

- Tipo: documento
- Assunto: anotações locais de Workers (login, dev, deploy, tail)
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 1.7 Zero Trust e túnel

- Tipo: documento
- Assunto: anotações locais de cloudflared (login, create, route dns)
- Origem: [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 2 — Comandos

Folhas de comando e o catálogo de nomes de ferramentas que já estavam na biblioteca. O índice cita o arquivo e o uso já escrito lá. Não reproduz a linha de comando. Uso somente em laboratório autorizado.

### 2.1 aircrack-ng

- Tipo: ferramenta
- Assunto: auditoria Wi-Fi; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.2 amass

- Tipo: ferramenta
- Assunto: enumeração de subdomínios; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.3 Blue Team — comandos de defesa

- Tipo: documento
- Assunto: portas, autenticação e eventos do Windows; o procedimento continua no arquivo
- Origem: [comandos/blue-team.md](comandos/blue-team.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.4 burpsuite

- Tipo: ferramenta
- Assunto: proxy de interceptação; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.5 ettercap

- Tipo: ferramenta
- Assunto: MITM em laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.6 ffuf

- Tipo: ferramenta
- Assunto: fuzzing de diretórios; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.7 gobuster

- Tipo: ferramenta
- Assunto: fuzzing de diretórios; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.8 hashcat

- Tipo: ferramenta
- Assunto: crack de hash em GPU; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.9 hydra

- Tipo: ferramenta
- Assunto: força bruta de serviços; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.10 john

- Tipo: ferramenta
- Assunto: crack de hash em CPU; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.11 Linux — referência geral de comandos

- Tipo: documento
- Assunto: sistema, rede, arquivos e auditoria; o procedimento continua no arquivo
- Origem: [comandos/linux.md](comandos/linux.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.12 maltego

- Tipo: ferramenta
- Assunto: inteligência relacional
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.13 metasploit

- Tipo: ferramenta
- Assunto: framework de exploração; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.14 nikto

- Tipo: ferramenta
- Assunto: scanner web; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.15 nmap

- Tipo: ferramenta
- Assunto: varredura de portas e serviços; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.16 recon-ng

- Tipo: ferramenta
- Assunto: framework de recon web; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.17 Red Team — comandos de recon

- Tipo: documento
- Assunto: recon em alvo autorizado; o procedimento continua no arquivo
- Origem: [comandos/recon-kali.md](comandos/recon-kali.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.18 searchsploit

- Tipo: ferramenta
- Assunto: busca local de exploits; somente laboratório autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.19 sqlmap

- Tipo: ferramenta
- Assunto: SQL injection; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.20 subfinder

- Tipo: ferramenta
- Assunto: subdomínios; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.21 theHarvester

- Tipo: ferramenta
- Assunto: e-mails, hosts e OSINT; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.22 Ubuntu — setup e administração

- Tipo: documento
- Assunto: pacotes, UFW, serviços e WSL; o procedimento continua no arquivo
- Origem: [comandos/ubuntu.md](comandos/ubuntu.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.23 wireshark

- Tipo: ferramenta
- Assunto: análise de pacotes
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 2.24 wpscan

- Tipo: ferramenta
- Assunto: auditoria WordPress; somente alvo autorizado
- Origem: [comandos/kali-ferramentas.md](comandos/kali-ferramentas.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 3 — Engenharia reversa

Categoria de referência de aprendizado. Não instala o projeto e não executa o construtor.

Escopo deste registro: engenharia reversa autorizada e reconstrução de interface quando há direito de examinar o alvo. O modo documentado como clean-room trabalha com o que se vê — captura, texto visível e layout medido — e depois compara o que foi construído.

Ficam de fora deste índice, de propósito: contornar autenticação, DRM ou anti-cheat; copiar marca, logotipo, texto, foto ou código de terceiros sem direito; reconstruir jogo de terceiro. O README upstream descreve outros modos além do clean-room; esses fluxos não são reproduzidos aqui.

O pacote executável `rea-dev-pack` já vive no catálogo MCP de comandos PowerShell. Ele não foi copiado nem renumerado nesta categoria.

### 3.1 Craft Anything

- Tipo: repositório
- Assunto: construtor local para Claude Code, descrito no README como early alpha, da ArtCraft Team; estudo clean-room por captura, texto visível e layout, seguido de build e checagem
- Origem: registro novo neste índice
- URL: https://github.com/storytold/craft-anything
- Licença: verificada na documentação (MIT OU Apache-2.0: LICENSE-MIT e LICENSE-APACHE lidos; o README declara a escolha do usuário)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: o uso registrado é exame autorizado e reconstrução de interface com direito. Bypass de autenticação, DRM ou anti-cheat, cópia de marca, texto, foto ou código sem direito, e rebuild de jogo de terceiro ficam fora deste registro. A frase do README de que o programa não contorna DRM, login ou anti-cheat é alegação da documentação, não auditoria feita aqui.
- Notas: Proveniência: o ponteiro chegou por captura de tela associada ao perfil noxprojectsx no Instagram. Esse perfil não está estabelecido como autor do código. A autoria documentada no repositório é ArtCraft Team (copyright 2026), com contribuidores. Commit observado de main: a0cd99325d2d2fcba0f12ad3a29a708a84a63283. O link usa /tree/main e não fixa o hash. Marca ArtCraft, wordmark e logos são tratados no README como fora da licença de código.

## Categoria 4 — Hyperframes

Setup e ideias já escritas em `hyperframes/hyper-setup.md`. Hyper como produto de terminal também aparece no levantamento de terminais; o registro único do produto fica aqui.

### 4.1 Frame de monitoramento

- Tipo: documento
- Assunto: ideia em aberto: btop, tail de logs e agente
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.2 Frame de recon

- Tipo: documento
- Assunto: ideia em aberto no setup local; não é um job configurado
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.3 Hyper Terminal

- Tipo: terminal
- Assunto: terminal extensível; config de exemplo para o pc2 no arquivo de setup
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md); também [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.4 hyper-pane

- Tipo: plugin
- Assunto: plugin de painéis citado no setup do Hyper
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.5 hyper-search

- Tipo: plugin
- Assunto: plugin de busca no buffer citado no setup do Hyper
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.6 hyperborder

- Tipo: plugin
- Assunto: plugin de borda citado no setup do Hyper
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.7 hyperpower

- Tipo: plugin
- Assunto: plugin de efeito de digitação citado no setup do Hyper
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 4.8 Integração com agentes

- Tipo: documento
- Assunto: Hyper como host de Kimi Code CLI, Claude Code e Gemini CLI
- Origem: [hyperframes/hyper-setup.md](hyperframes/hyper-setup.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 5 — LLMs

CLIs e fluxos já anotados em `llms/`. O site do Ollama, como link de referência, está na categoria Referências.

### 5.1 Claude Code

- Tipo: documento
- Assunto: instalação, comandos de sessão e prompts locais
- Origem: [llms/claude-code.md](llms/claude-code.md); também [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 5.2 Gemini CLI

- Tipo: documento
- Assunto: CLI, NotebookLM e prompts locais no mesmo arquivo
- Origem: [llms/gemini.md](llms/gemini.md); também [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 5.3 NotebookLM

- Tipo: documento
- Assunto: fluxo local para infográfico, mapa mental e aula
- Origem: [llms/gemini.md](llms/gemini.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 5.4 Ollama (CLI local)

- Tipo: documento
- Assunto: comandos locais list, run e pull; não afirma velocidade nem modelo padrão do laboratório
- Origem: [llms/gemini.md](llms/gemini.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 6 — Obsidian

Comandos, plugins de vault e fluxo já descritos em `obsidian/comandos.md`.

### 6.1 Atalhos e comandos de voz do lab

- Tipo: documento
- Assunto: obsidian daily, search e daily:append
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.2 COFRE REMOTO

- Tipo: documento
- Assunto: vault de referências e PDFs
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.3 Dataview

- Tipo: plugin
- Assunto: plugin de queries nas notas
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.4 Excalidraw

- Tipo: plugin
- Assunto: plugin de diagramas
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.5 Obsidian Sandbox

- Tipo: documento
- Assunto: vault de testes e rascunhos
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.6 Plugin Git do Obsidian

- Tipo: plugin
- Assunto: backup do vault por Git
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.7 Plugin Templater

- Tipo: plugin
- Assunto: templates dinâmicos
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.8 URI scheme do Obsidian

- Tipo: documento
- Assunto: open, search e new para automação do vault
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 6.9 Workflow Kimi para Obsidian

- Tipo: documento
- Assunto: gerar markdown, gravar e versionar o vault
- Origem: [obsidian/comandos.md](obsidian/comandos.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 7 — Plugins

Plugins MCP já citados em `skills/kimi-habilidades.md`. A pasta `plugins/` do mapa não existe no repositório; nada foi criado lá. O plugin MCP da Cloudflare também é mencionado em `cloudflare/comandos.md` e entra uma vez só, aqui.

### 7.1 Cloudflare (plugin MCP)

- Tipo: plugin
- Assunto: API Cloudflare citada como plugin MCP no laboratório
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md); também [cloudflare/comandos.md](cloudflare/comandos.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 7.2 context7

- Tipo: plugin
- Assunto: documentação de bibliotecas citada como plugin MCP
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 7.3 Geração de mídia

- Tipo: plugin
- Assunto: image, video e audio generation citados como plugins MCP
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 7.4 github

- Tipo: plugin
- Assunto: issues, PRs e busca de código citados como plugin MCP
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 7.5 scholar

- Tipo: plugin
- Assunto: busca acadêmica citada como plugin MCP
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 7.6 supabase

- Tipo: plugin
- Assunto: Postgres, migrations e Edge Functions citados como plugin MCP
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 8 — Prompts

Cada prompt já existente vira um item pelo título. O texto do prompt permanece no arquivo de origem; este índice não o copia.

### 8.1 Agente de QA de segurança

- Tipo: prompt
- Assunto: revisão de scripts do Mestre do PC em laboratório
- Origem: [prompts/hackbots-agentes.md](prompts/hackbots-agentes.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.2 Análise de .env exposto

- Tipo: prompt
- Assunto: classificar credencial em ambiente autorizado de teste
- Origem: [prompts/red-team-recon.md](prompts/red-team-recon.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.3 Análise de logs (SOC)

- Tipo: prompt
- Assunto: leitura de log de acesso em cenário de defesa
- Origem: [prompts/blue-team.md](prompts/blue-team.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.4 Análise de writeup de CTF

- Tipo: prompt
- Assunto: extrair técnicas e estudo a partir de um writeup
- Origem: [prompts/pesquisa-hacking.md](prompts/pesquisa-hacking.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.5 Auditoria de system prompt

- Tipo: prompt
- Assunto: pontos fracos de um system prompt contra injeção, com mitigação
- Origem: [prompts/attacking-ai.md](prompts/attacking-ai.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.6 Cenário de tool abuse em lab

- Tipo: prompt
- Assunto: cenário local de abuso de ferramenta e defesa
- Origem: [prompts/attacking-ai.md](prompts/attacking-ai.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.7 Checklist DMARC/SPF/DKIM

- Tipo: prompt
- Assunto: análise de autenticação de e-mail do domínio autorizado
- Origem: [prompts/red-team-recon.md](prompts/red-team-recon.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.8 Expansão de escopo via aquisições

- Tipo: prompt
- Assunto: expansão legítima de escopo em programa de bug bounty
- Origem: [prompts/red-team-recon.md](prompts/red-team-recon.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.9 Explicação didática de técnica ou CVE

- Tipo: prompt
- Assunto: causa, condição e mitigação em tom de estudo
- Origem: [prompts/pesquisa-hacking.md](prompts/pesquisa-hacking.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.10 Formato de saída de tendências

- Tipo: prompt
- Assunto: tabela, sinais fracos e três apostas de laboratório
- Origem: [prompts/analise-tendencias.md](prompts/analise-tendencias.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.11 Frameworks de agentes autônomos

- Tipo: prompt
- Assunto: comparar arquitetura, ecossistema e maturidade
- Origem: [prompts/analise-tendencias.md](prompts/analise-tendencias.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.12 Hackbot de recon autônomo

- Tipo: prompt
- Assunto: desenho de agente local com recon passivo e guardrails
- Origem: [prompts/hackbots-agentes.md](prompts/hackbots-agentes.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.13 Hardening pós-recon

- Tipo: prompt
- Assunto: plano de hardening a partir de varredura autorizada
- Origem: [prompts/blue-team.md](prompts/blue-team.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.14 Jogo ataque/defesa

- Tipo: prompt
- Assunto: loop red, blue e juiz somente em laboratório
- Origem: [prompts/hackbots-agentes.md](prompts/hackbots-agentes.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.15 LLMs open-weight para desenvolvimento local

- Tipo: prompt
- Assunto: comparar modelos locais por tamanho, licença e tool calling
- Origem: [prompts/analise-tendencias.md](prompts/analise-tendencias.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.16 Metodologia de recon em cinco fases

- Tipo: prompt
- Assunto: recon metodológico no domínio autorizado
- Origem: [prompts/red-team-recon.md](prompts/red-team-recon.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.17 Metodologia PTES para laboratório pessoal

- Tipo: prompt
- Assunto: adaptar o PTES a um laboratório pessoal
- Origem: [prompts/pesquisa-hacking.md](prompts/pesquisa-hacking.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.18 Plano de estudos de 30 dias

- Tipo: prompt
- Assunto: trilha com recursos gratuitos e labs
- Origem: [prompts/pesquisa-hacking.md](prompts/pesquisa-hacking.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.19 Regras de detecção Sigma

- Tipo: prompt
- Assunto: detecção para técnicas MITRE já nomeadas no prompt
- Origem: [prompts/blue-team.md](prompts/blue-team.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.20 Técnicas emergentes de ataque em 2026

- Tipo: prompt
- Assunto: panorama defensivo de técnicas emergentes
- Origem: [prompts/analise-tendencias.md](prompts/analise-tendencias.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.21 Tradução de pesquisa em defesa

- Tipo: prompt
- Assunto: detecção, hardening e exercício purple team
- Origem: [prompts/pesquisa-hacking.md](prompts/pesquisa-hacking.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.22 Trending de segurança ofensiva no GitHub

- Tipo: prompt
- Assunto: padrões em repositórios trending, como estudo
- Origem: [prompts/analise-tendencias.md](prompts/analise-tendencias.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 8.23 Vetores de ataque a agentes LLM

- Tipo: prompt
- Assunto: lista de vetores com exemplo defensivo, em laboratório
- Origem: [prompts/attacking-ai.md](prompts/attacking-ai.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 9 — Referências

Links que já estavam em `referencias/sites.md`, mais os repositórios de estudo que só apareciam em `.deploy/ideias-referencias.md`. Esse arquivo de deploy não foi movido. A coleção claude-skills entra uma vez, na categoria Skills. Labs nomeados de novo em `seguranca/studio-de-seguranca.md` (HackTheBox, TryHackMe, PortSwigger, PicoCTF) ficam aqui, com a URL uma vez só.

### 9.1 Arcanum Security

- Tipo: referência
- Assunto: metodologia de bug hunter, Attacking AI e Hackbots
- Origem: [referencias/sites.md](referencias/sites.md); também [SECURITY_LIBRARY.md](SECURITY_LIBRARY.md)
- URL: https://arcanum-sec.com
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.2 base-clientes-mcp

- Tipo: repositório
- Assunto: outro padrão de servidor MCP com dados, citado como estudo
- Origem: [.deploy/ideias-referencias.md](.deploy/ideias-referencias.md)
- URL: https://github.com/jeanavila997-ux/base-clientes-mcp
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.3 chat-ia

- Tipo: repositório
- Assunto: cliente MCP, RAG offline e multi-provedor
- Origem: [.deploy/ideias-referencias.md](.deploy/ideias-referencias.md)
- URL: https://github.com/jeanavila997-ux/chat-ia
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.4 dify-mestre-integration

- Tipo: repositório
- Assunto: workflows Dify via MCP
- Origem: [.deploy/ideias-referencias.md](.deploy/ideias-referencias.md)
- URL: https://github.com/jeanavila997-ux/dify-mestre-integration
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.5 FlipHTML5

- Tipo: referência
- Assunto: publicações digitais e flipbooks
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://fliphtml5.com
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.6 HackTheBox

- Tipo: referência
- Assunto: laboratório prático; também nomeado no studio de segurança
- Origem: [referencias/sites.md](referencias/sites.md); também [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- URL: https://hackthebox.com
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.7 Hugging Face

- Tipo: referência
- Assunto: modelos e conjuntos de dados
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://huggingface.co
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.8 materia-medica

- Tipo: repositório
- Assunto: projeto do laboratório citado na lista de referências
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://github.com/jeanavila997-ux/materia-medica
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.9 Mestre-do-PC-V10

- Tipo: repositório
- Assunto: origem do catálogo e launcher do pc2
- Origem: [referencias/sites.md](referencias/sites.md); também [.deploy/ideias-referencias.md](.deploy/ideias-referencias.md)
- URL: https://github.com/jeanavila997-ux/Mestre-do-PC-V10
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.10 MULT-CHAT-HUB

- Tipo: repositório
- Assunto: hub multi-chat do laboratório
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://github.com/avila2026/MULT-CHAT-HUB
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.11 nexo-core

- Tipo: repositório
- Assunto: este repositório
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://github.com/jeanavila997-ux/nexo-core
- Licença: verificada no package.json deste repositório (MIT)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.12 Ollama (site)

- Tipo: referência
- Assunto: site do projeto Ollama; o CLI local está na categoria LLMs
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://ollama.com
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.13 PicoCTF

- Tipo: referência
- Assunto: CTF introdutório; também nomeado no studio de segurança
- Origem: [referencias/sites.md](referencias/sites.md); também [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- URL: https://picoctf.org
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.14 PortSwigger Web Security Academy

- Tipo: referência
- Assunto: web security gratuito; também nomeado no studio de segurança
- Origem: [referencias/sites.md](referencias/sites.md); também [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- URL: https://portswigger.net/web-security
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.15 Tenor

- Tipo: referência
- Assunto: GIFs para apresentação e conteúdo
- Origem: [referencias/sites.md](referencias/sites.md)
- URL: https://tenor.com/pt-BR/explore/internet
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.16 The Book of Secret Knowledge

- Tipo: referência
- Assunto: coleção de ferramentas e listas
- Origem: [referencias/sites.md](referencias/sites.md); também [.deploy/ideias-referencias.md](.deploy/ideias-referencias.md)
- URL: https://github.com/trimstray/the-book-of-secret-knowledge
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 9.17 TryHackMe

- Tipo: referência
- Assunto: trilhas guiadas; também nomeado no studio de segurança
- Origem: [referencias/sites.md](referencias/sites.md); também [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- URL: https://tryhackme.com
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 10 — Repositórios traders

Repositórios distintos das skills. A skill aponta para um `SKILL.md`; o repositório aponta para a raiz. Nomes de pasta repetidos entre day-trader-skill e trader-skill não foram fundidos.

Nenhum destes repositórios foi clonado, instalado ou executado. Não há corretora, ordem nem dado de mercado ao vivo neste índice.

### 10.1 Claude Trading Skills

- Tipo: repositório
- Assunto: metodologia de análise, risco, revisão e backtest para investidor pessoa física; o README nega serviço de sinal e promessa de lucro
- Origem: registro novo neste índice
- URL: https://github.com/tradermonty/claude-trading-skills
- Licença: verificada na documentação (MIT no LICENSE; copyright 2026 TraderMonty; o README repete MIT e AS IS)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Na categoria Skills entram só technical-analyst e backtest-expert. As outras skills do repositório não foram enumeradas. Commit observado de main: ff8ca70d93f596caa216a61a183a66a1351ba138. O link não fixa o hash.

### 10.2 Day Trader skill

- Tipo: repositório
- Assunto: fluxo e simulação de day trading; o README descreve 11 skills Claude e a instalação como plugin do Claude Code
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill
- Licença: verificada na documentação (MIT no LICENSE; copyright 2026 Jake Schincariol; o README declara MIT)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: O README afirma paper trading como padrão e que nenhuma ordem segue sem um sim. A skill trader-broker, no mesmo repositório, documenta envio de ordem à corretora. As duas frases são alegações lidas, não auditoria. Risco financeiro e de ordem. Este índice não instala o pacote nem abre conta.
- Notas: As 11 skills estão na categoria Skills, cada uma no blob/main/<nome>/SKILL.md. Commit observado de main em 2026-11-06: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. Esse hash confirma a leitura; os links não o fixam, porque main pode avançar.

### 10.3 Trader skill

- Tipo: repositório
- Assunto: investimento: 13F, orçamento, notícias, congresso e rebalanceamento (a árvore tem trader-rebalance)
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/trader-skill
- Licença: verificada na documentação (MIT no LICENSE; copyright 2026 Jake Schincariol; a API de licença do GitHub e o README concordam com MIT)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem. A documentação também fala em ordem, no mesmo teor de confirmação ainda não auditado.
- Notas: Repositório diferente de day-trader-skill, embora vários nomes de pasta coincidam. Os SKILL.md dele não entram na categoria Skills, para não duplicar o caminho errado. O README descreve 11 skills, paper trading como padrão e ordem só com confirmação — alegação, não auditoria. Commit observado de main: 5189e79b9a480755a3733ac9713f5353981dbe18.

## Categoria 11 — Segurança

Frameworks, checklist e modelo de relatório de `seguranca/studio-de-seguranca.md`, mais o mapa curto `SECURITY_LIBRARY.md`. Os labs com URL estão na categoria Referências.

### 11.1 Checklist de ambiente de lab seguro

- Tipo: checklist
- Assunto: rede isolada, snapshot, alvo autorizado, log e relatório
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.2 Cyber Kill Chain

- Tipo: framework
- Assunto: fases de intrusão
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.3 Índice SECURITY_LIBRARY

- Tipo: documento
- Assunto: mapa curto dos prompts e dos comandos de segurança; o link da Arcanum está na categoria Referências
- Origem: [SECURITY_LIBRARY.md](SECURITY_LIBRARY.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.4 MITRE ATT&CK

- Tipo: framework
- Assunto: táticas e técnicas de adversários
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.5 Modelo de relatório de sessão

- Tipo: documento
- Assunto: objetivo, alvo autorizado, ferramentas, achados e mitigação
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.6 NIST CSF

- Tipo: framework
- Assunto: gestão de risco
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.7 OWASP Top 10

- Tipo: framework
- Assunto: riscos web
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 11.8 PTES

- Tipo: framework
- Assunto: padrão de teste de intrusão
- Origem: [seguranca/studio-de-seguranca.md](seguranca/studio-de-seguranca.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

## Categoria 12 — Skills

Skills de aprendizado e as duas skills já instaladas no runtime local. Guardar o link aqui não copia a pasta para `data/skills/` e não faz `skills_list` enxergar a skill externa.

As 11 skills de day-trader-skill foram conferidas: cada `SKILL.md` respondeu no raw de main. technical-analyst e backtest-expert são as duas skills metodológicas pedidas de claude-trading-skills. backtesting-trading-strategies entra porque o frontmatter declara metodologia de simulação histórica, com dependências Python, e o texto lido não descreve envio de ordem.

Nada desta categoria foi executado. Estado de todas: documentação lida.

### 12.1 backtest-expert

- Tipo: skill
- Assunto: metodologia de backtest: robustez, viés, slippage e leitura de resultado; o próprio texto diz que o objetivo não é a curva mais otimista
- Origem: registro novo neste índice
- URL: https://github.com/tradermonty/claude-trading-skills/blob/main/skills/backtest-expert/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório claude-trading-skills)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: URL do SKILL.md conferida. Pré-requisito documentado: Python 3.9+ e métricas fornecidas pelo usuário, sem API key. Commit observado do repositório: ff8ca70d93f596caa216a61a183a66a1351ba138.

### 12.2 backtesting-trading-strategies

- Tipo: skill
- Assunto: simulação histórica de estratégias (cripto e tradicionais), métricas e otimização de parâmetros; o texto lido diz que o resultado não é desempenho futuro
- Origem: registro novo neste índice
- URL: https://github.com/jeremylongshore/claude-code-plugins-plus-skills/blob/main/plugins/crypto/trading-strategy-backtester/skills/backtesting-trading-strategies/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório, copyright 2025 Jeremy Longshore; o frontmatter do SKILL.md também declara MIT)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Frontmatter lido: license MIT, allowed-tools com Bash(python), version 1.30.0. A documentação pede pacotes Python (pandas, numpy, yfinance, matplotlib e, noutra linha, ta-lib, scipy, scikit-learn). Não instalamos nada. Varredura do texto não achou envio de ordem nem corretora; isso não é auditoria do código. Commit observado do repositório: 070b3b141e2b6fa08e8fa6a22feef2a2afd43a7f.

### 12.3 claude-skills (coleção)

- Tipo: repositório
- Assunto: coleção de skills para Claude Code citada como referência de estrutura
- Origem: [skills/claude-skills.md](skills/claude-skills.md); também [referencias/sites.md](referencias/sites.md); também [.deploy/ideias-referencias.md](.deploy/ideias-referencias.md)
- URL: https://github.com/alirezarezvani/claude-skills
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Notas: O repositório externo não foi aberto nesta leitura. O arquivo local só guarda o link e um backlog. Também citado em `.deploy/ideias-referencias.md`, sem segunda ficha.

### 12.4 code-vuln-audit

- Tipo: skill
- Assunto: skill Kimi de auditoria de dependência, segredo e OWASP; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.5 database-scout

- Tipo: skill
- Assunto: skill Kimi para explorar SQLite ou Postgres; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.6 deep-research-v2

- Tipo: skill
- Assunto: skill Kimi de pesquisa com evidências; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.7 http-load-profiler

- Tipo: skill
- Assunto: skill Kimi de perfil de carga; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.8 incident-review-guide

- Tipo: skill
- Assunto: skill Kimi de postmortem; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.9 kimi-help-center

- Tipo: skill
- Assunto: skill Kimi de dúvidas de produto; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.10 labtest-recon

- Tipo: skill
- Assunto: backlog interno: workflow de recon; não existe pasta SKILL.md
- Origem: [skills/claude-skills.md](skills/claude-skills.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Notas: Item de lista de tarefas do arquivo local. Não é skill externa e não foi criada.

### 12.11 log-error-digest

- Tipo: skill
- Assunto: skill Kimi de agrupamento de erros em log; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.12 manutencao-windows

- Tipo: skill
- Assunto: skill já instalada: limpeza e atualização do Windows pelo catálogo, com confirmação para comando destrutivo
- Origem: [data/skills/manutencao-windows/SKILL.md](data/skills/manutencao-windows/SKILL.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Notas: Esta é skill do runtime. O índice só aponta o arquivo; não reinstala.

### 12.13 mestre-do-pc-audit

- Tipo: skill
- Assunto: backlog interno: revisão de scripts do Mestre do PC V10; não existe pasta SKILL.md
- Origem: [skills/claude-skills.md](skills/claude-skills.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.14 nexo-report

- Tipo: skill
- Assunto: backlog interno: relatórios padronizados; não existe pasta SKILL.md
- Origem: [skills/claude-skills.md](skills/claude-skills.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.15 obsidian-bridge

- Tipo: skill
- Assunto: backlog interno: ponte com o vault Obsidian; não existe pasta SKILL.md
- Origem: [skills/claude-skills.md](skills/claude-skills.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.16 pipeline-blueprint

- Tipo: skill
- Assunto: skill Kimi de templates de CI; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.17 relatorio-sistema

- Tipo: skill
- Assunto: skill já instalada: retrato do Windows só com comandos não destrutivos do catálogo
- Origem: [data/skills/relatorio-sistema/SKILL.md](data/skills/relatorio-sistema/SKILL.md)
- Licença: não se aplica (registro interno do nexo-core)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Notas: Esta é skill do runtime. O índice só aponta o arquivo; não reinstala.

### 12.18 repo-audit

- Tipo: skill
- Assunto: skill Kimi de histórico Git; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.19 secure-code-review

- Tipo: skill
- Assunto: skill Kimi de revisão OWASP; não instalada no NEXO
- Origem: [skills/kimi-habilidades.md](skills/kimi-habilidades.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 12.20 technical-analyst

- Tipo: skill
- Assunto: análise técnica de gráfico semanal fornecido pelo usuário, sem notícia nem fundamento, segundo o frontmatter
- Origem: registro novo neste índice
- URL: https://github.com/tradermonty/claude-trading-skills/blob/main/skills/technical-analyst/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório claude-trading-skills)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: URL do SKILL.md conferida. A documentação pede a imagem do gráfico e diz que não busca API. Cenário e alvo de preço no texto são método, não sinal verificável nem prova de lucro. Commit observado do repositório: ff8ca70d93f596caa216a61a183a66a1351ba138.

### 12.21 trader-alerts

- Tipo: skill
- Assunto: alertas de preço, stop ou abertura, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-alerts/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.22 trader-analyst

- Tipo: skill
- Assunto: leitura de resultados na SEC EDGAR (10-Q, 10-K, 8-K) e resumo do que mudou, segundo o frontmatter; não é feed em tempo real
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-analyst/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.23 trader-broker

- Tipo: skill
- Assunto: a documentação descreve envio de ordem aprovada à corretora (Alpaca e conector Interactive Brokers), paper como padrão e mais de uma confirmação
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-broker/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: financeiro e de ordem. O frontmatter e o corpo lido dizem que esta é a skill do pacote que pode levar a uma ordem real, com paper como padrão e confirmações. Isso continua sendo alegação da documentação: o código não foi auditado nem executado. Este índice não configura corretora, não lê chave e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.24 trader-budget

- Tipo: skill
- Assunto: tamanho de posição segundo orçamento e perda máxima, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-budget/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.25 trader-entry

- Tipo: skill
- Assunto: temporização de entrada a partir do setup, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-entry/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.26 trader-exit

- Tipo: skill
- Assunto: stop e alvo antes da entrada, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-exit/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.27 trader-news

- Tipo: skill
- Assunto: notícias dos ativos observados, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-news/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.28 trader-pelosi

- Tipo: skill
- Assunto: divulgações de operações de membros do Congresso, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-pelosi/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.29 trader-risk

- Tipo: skill
- Assunto: checagem da operação contra limites, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-risk/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.30 trader-scanner

- Tipo: skill
- Assunto: varredura de gráficos em busca de setups, segundo o README
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-scanner/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: material de estudo sobre mercado. Não é aconselhamento, não é dado em tempo real verificado aqui e não indica que um modelo ou simulação seja lucrativo. Paper trading e confirmações são alegações da documentação de origem, pendentes de auditoria de código. Este índice não instala a skill, não conecta corretora e não envia ordem.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

### 12.31 trader-timemachine

- Tipo: skill
- Assunto: simulação documentada: replays a partir de barras recentes e do histórico do mesmo setup; o texto lido diz que não é previsão
- Origem: registro novo neste índice
- URL: https://github.com/Jakeschincariol/day-trader-skill/blob/main/trader-timemachine/SKILL.md
- Licença: verificada na documentação (MIT no LICENSE do repositório day-trader-skill; copyright 2026 Jake Schincariol)
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
- Risco: de interpretação. A simulação não foi executada aqui. Um replay não é dado em tempo real nem evidência de lucro. Paper trading do pacote continua sendo alegação não auditada.
- Notas: Caminho conferido no raw de main (HTTP 200). Commit observado de main: 3d0f4ef6986f4984b7c6bd46f7ff4f87744c3abd. O link usa blob/main de propósito: o hash não fica fixado.

## Categoria 13 — Terminais

Terminais e TUIs do levantamento em `terminais/agenticos-tui.md`, sem repetir Hyper, Claude Code nem Gemini CLI, que têm ficha na categoria de origem.

### 13.1 Aider

- Tipo: terminal
- Assunto: pair programming com LLM no terminal
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.2 Alacritty

- Tipo: terminal
- Assunto: terminal minimalista
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.3 btop

- Tipo: terminal
- Assunto: monitor de sistema em TUI
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.4 k9s

- Tipo: terminal
- Assunto: TUI de Kubernetes
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.5 Kimi Code CLI

- Tipo: terminal
- Assunto: agente Kimi no terminal
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.6 lazygit

- Tipo: terminal
- Assunto: Git em TUI
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.7 Warp

- Tipo: terminal
- Assunto: blocos de comando e IA integrada
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.8 WezTerm

- Tipo: terminal
- Assunto: terminal acelerado por GPU, com multiplexador
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste

### 13.9 Windows Terminal

- Tipo: terminal
- Assunto: terminal padrão citado para o pc2 (WSL e PowerShell)
- Origem: [terminais/agenticos-tui.md](terminais/agenticos-tui.md)
- Licença: desconhecida
- Conferido em: 2026-11-06
- Estado: documentação lida
- Auditoria de código: não auditado — ler metadados ou a documentação não é auditoria de código nem teste
