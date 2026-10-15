# NEXO Lab no Termux (Android)

Guia rápido para rodar o dashboard **Red vs Blue** no celular.

## 1. Instalar o Termux

O Termux é um app Android — instale no celular:

- **F-Droid (recomendado):** https://f-droid.org/packages/com.termux/
- **GitHub (APK oficial):** https://github.com/termux/termux-app/releases

> Evite a versão da Play Store — está desatualizada.

## 2. Levar o projeto para o celular

Opção A — enviar o zip `nexo-lab-termux.zip` para o celular e, no Termux:

```bash
pkg install -y unzip
termux-setup-storage
cd ~/storage/downloads        # ou onde o zip foi salvo
unzip nexo-lab-termux.zip -d ~/nexo-lab
cd ~/nexo-lab
```

Opção B — se o código estiver no GitHub:

```bash
pkg install -y git
git clone <url-do-repo> ~/nexo-lab
cd ~/nexo-lab
```

## 3. Instalar e rodar

```bash
bash install-termux.sh
```

O script atualiza o Termux, instala `nodejs` e ferramentas de rede, usa o
build pronto em `dist/` (ou compila do zero, se necessário) e sobe o site em:

```
http://localhost:8080
```

Abra esse endereço no navegador do celular.

## 3.1 Execução REAL de comandos

O servidor Node (`server/servidor.mjs`) expõe `POST /api/exec` com uma
**whitelist estrita e segura**. No console do azul do dashboard, estes
comandos rodam de verdade no Linux do Android e a saída real aparece no
terminal do site:

| comando | executa no Termux | o que mostra |
| --- | --- | --- |
| `scan` | `ss -tulpn` | conexões e portas abertas |
| `net` | `ip addr show` | interfaces de rede |
| `status` | `uptime` | tempo ligado e carga |
| `mem` | `free -h` | memória do dispositivo |
| `ps` | `ps aux` | processos em execução |
| `disk` | `df -h` | uso de disco |
| `sys` | `uname -a` | kernel do Android/Linux |
| `whoami` | `whoami` | usuário da sessão Termux |
| `pkg` | `pkg list-upgradable` | atualizações disponíveis |

Os comandos de defesa (`patch`, `block`, `isolate`, `harden`) continuam com
efeito na simulação da rodada — executá-los de verdade exigiria root.

## 3.2 Speedtest real (Ookla CLI)

O comando `speedtest` no console do azul mede o link **de verdade**
(download/upload/ping/jitter/perda), via CLI oficial da Ookla. O teste
trafega ~100 MB e pode levar até 1 minuto; o resultado fica em cache por 5
minutos (`speedtest force` ignora o cache).

Instalação do binário no Termux:

```bash
# ARM64 (celulares modernos)
pkg install -y curl
curl -LO https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-aarch64.tgz
tar xzf ookla-speedtest-1.2.0-linux-aarch64.tgz
mv speedtest $PREFIX/bin/
# ARM 32-bit: troque aarch64 por armhf no URL
```

Sem o binário instalado, o comando responde
"speedtest não instalado (veja TERMUX.md)" — nada quebra.

Endpoints: `POST /api/speedtest` (body `{server_id?, force?}`) e
`GET /api/speedtest/servers` (lista servidores próximos).

Qualquer comando fora da whitelist é recusado pelo servidor com a lista dos
permitidos. Nada destrutivo passa.

## 4. Rodar de novo depois

```bash
cd ~/nexo-lab
bash servir.sh
```

## Observações

- O site é 100% local: a simulação roda no navegador do celular, sem internet
  e sem tocar em nenhum sistema real.
- O layout é responsivo — no celular os painéis empilham e os botões têm
  tamanho de toque adequado.
- `Ctrl+C` no Termux para o servidor.
