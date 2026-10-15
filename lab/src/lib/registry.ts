// ============================================================
// Registro central de comandos do NEXO CORE (terminal)
// Fonte única da verdade: help, man e o parser consultam ESTA
// lista — nada é hardcoded em outro lugar.
// ============================================================

export type Category = 'nucleo' | 'diagnostico' | 'rede' | 'defesa' | 'pacotes' | 'utilidades' | 'nexo'

export type OutputMode = 'texto' | 'tabela' | 'real'

export interface CommandDef {
  name: string
  aliases: string[]
  category: Category
  description: string
  usage: string
  examples: string[]
  permissions: 'user' | 'admin'
  danger: boolean
  requires_confirmation: boolean
  output: OutputMode
  // 'sim' = handler simulado no frontend · 'real:<bin>' = whitelist Termux
  // 'special' = tratado pelo próprio console (help, clear…)
  handler: string
  // saída simulada (handler 'sim')
  sim?: string[] | ((args: string[], cwd?: string) => string[])
}

export const CATEGORY_LABEL: Record<Category, string> = {
  nucleo: 'núcleo',
  diagnostico: 'diagnóstico',
  rede: 'rede',
  defesa: 'defesa',
  pacotes: 'pacotes',
  utilidades: 'utilidades',
  nexo: 'nexo core',
}

const c = (def: Omit<CommandDef, 'aliases' | 'permissions' | 'danger' | 'requires_confirmation' | 'output'> &
  Partial<CommandDef>): CommandDef => ({
  aliases: [],
  permissions: 'user',
  danger: false,
  requires_confirmation: false,
  output: 'texto',
  ...def,
})

export const REGISTRY: CommandDef[] = [
  // ─────────── núcleo ───────────
  c({ name: 'help', category: 'nucleo', description: 'Lista comandos ou detalha um comando.', usage: 'help [comando]', examples: ['help', 'help ps'], handler: 'special' }),
  c({ name: 'clear', category: 'nucleo', description: 'Limpa a tela.', usage: 'clear', examples: ['clear'], handler: 'special' }),
  c({ name: 'version', aliases: ['ver'], category: 'nucleo', description: 'Mostra versão do NEXO CORE.', usage: 'version', examples: ['version'], handler: 'sim', sim: ['NEXO CORE v1.4.0 (lab-01) · runtime Termux/Android · build estável'] }),
  c({ name: 'about', category: 'nucleo', description: 'Informações do laboratório.', usage: 'about', examples: ['about'], handler: 'sim', sim: ['NEXO CORE — laboratório local de segurança Red×Blue', 'base: nexo-core · MCP-first · gate determinístico · auditoria SHA-256', 'simulação 100% local — nenhum sistema real é afetado'] }),
  c({ name: 'echo', category: 'nucleo', description: 'Repete o texto.', usage: 'echo [texto]', examples: ['echo hello'], handler: 'sim', sim: (args) => [args.join(' ') || ''] }),
  c({ name: 'date', category: 'nucleo', description: 'Data e hora atuais.', usage: 'date', examples: ['date'], handler: 'sim', sim: () => [new Date().toLocaleString('pt-BR')] }),
  c({ name: 'history', category: 'nucleo', description: 'Histórico de comandos da sessão.', usage: 'history', examples: ['history'], handler: 'special' }),
  c({ name: 'pwd', category: 'nucleo', description: 'Diretório atual.', usage: 'pwd', examples: ['pwd'], handler: 'special' }),
  c({ name: 'ls', category: 'nucleo', description: 'Lista arquivos.', usage: 'ls [dir]', examples: ['ls', 'ls data/'], handler: 'sim', output: 'tabela', sim: (_args, cwd) => [`total 6  (${cwd ?? '/home/nexo'})`, 'drwxr-xr-x  data/         catalog  logs  policy.json  skills/', '-rw-r--r--  policy.json  188 bytes  mode 444', '-rw-------  audit.jsonl  12.4 KB  sha256 ok', '-rwxr-xr-x  nexo.mjs     31 KB'] }),
  c({ name: 'cd', category: 'nucleo', description: 'Muda de diretório.', usage: 'cd [dir]', examples: ['cd data', 'cd ..'], handler: 'special' }),
  c({ name: 'cat', category: 'nucleo', description: 'Exibe conteúdo de arquivo.', usage: 'cat [arquivo]', examples: ['cat policy.json'], handler: 'sim', sim: (args) => args[0] === 'policy.json' ? ['{', '  "destructive": "deny",', '  "shell_mode": "catalog_only",', '  "timeout_ms": 60000', '}'] : [`cat: ${args[0] ?? ''}: arquivo ou diretório inexistente`] }),
  c({ name: 'which', category: 'nucleo', description: 'Caminho do executável.', usage: 'which [comando]', examples: ['which node'], handler: 'sim', sim: (args) => [`/data/data/com.termux/files/usr/bin/${args[0] ?? ''}`] }),
  c({ name: 'man', category: 'nucleo', description: 'Manual do comando (alias de help [cmd]).', usage: 'man [comando]', examples: ['man block'], handler: 'special' }),
  c({ name: 'exit', category: 'nucleo', description: 'Encerra a sessão do console.', usage: 'exit', examples: ['exit'], handler: 'special' }),

  // ─────────── diagnóstico (REAL no Termux) ───────────
  c({ name: 'scan', category: 'diagnostico', description: 'Conexões e portas abertas.', usage: 'scan', examples: ['scan'], handler: 'real:scan', output: 'real' }),
  c({ name: 'net', category: 'diagnostico', description: 'Interfaces de rede.', usage: 'net', examples: ['net'], handler: 'real:net', output: 'real' }),
  c({ name: 'status', category: 'diagnostico', description: 'Tempo ligado e carga do sistema.', usage: 'status', examples: ['status'], handler: 'real:status', output: 'real' }),
  c({ name: 'mem', category: 'diagnostico', description: 'Uso de memória.', usage: 'mem', examples: ['mem'], handler: 'real:mem', output: 'real' }),
  c({ name: 'ps', aliases: ['proc'], category: 'diagnostico', description: 'Processos em execução.', usage: 'ps', examples: ['ps'], handler: 'real:ps', output: 'real' }),
  c({ name: 'disk', aliases: ['df'], category: 'diagnostico', description: 'Uso de disco.', usage: 'disk', examples: ['disk'], handler: 'real:disk', output: 'real' }),
  c({ name: 'sys', aliases: ['uname'], category: 'diagnostico', description: 'Kernel e plataforma.', usage: 'sys', examples: ['sys'], handler: 'real:sys', output: 'real' }),
  c({ name: 'whoami', category: 'diagnostico', description: 'Usuário da sessão.', usage: 'whoami', examples: ['whoami'], handler: 'real:whoami', output: 'real' }),
  c({ name: 'id', category: 'diagnostico', description: 'UID, GID e grupos.', usage: 'id', examples: ['id'], handler: 'real:id', output: 'real' }),
  c({ name: 'log', category: 'diagnostico', description: 'Logs do laboratório.', usage: 'log', examples: ['log'], handler: 'sim', sim: ['T+00:01:12 · BLUE segurou flood de requisições', 'T+00:01:13 · RED rompeu filtro semântico — dano 3.1', 'T+00:01:14 · auditoria SHA-256 verificada'] }),

  // ─────────── rede ───────────
  c({ name: 'ping', category: 'rede', description: 'Testa conectividade.', usage: 'ping [host]', examples: ['ping 8.8.8.8'], handler: 'sim', sim: (args) => { const h = args[0] ?? '127.0.0.1'; return [`PING ${h}: 56 bytes de dados`, `64 bytes de ${h}: icmp_seq=1 ttl=117 tempo=12.4 ms`, `64 bytes de ${h}: icmp_seq=2 ttl=117 tempo=11.9 ms`, `64 bytes de ${h}: icmp_seq=3 ttl=117 tempo=12.8 ms`, `--- estatísticas: 3 enviados, 3 recebidos, 0% perda ---`] } }),
  c({ name: 'speedtest', category: 'rede', description: 'Mede download/upload/ping (Ookla, real no Termux).', usage: 'speedtest [force]', examples: ['speedtest', 'speedtest force'], handler: 'real:speedtest', output: 'real' }),
  c({ name: 'route', category: 'rede', description: 'Tabela de rotas.', usage: 'route', examples: ['route'], handler: 'real:route', output: 'real' }),
  c({ name: 'curl', category: 'rede', description: 'Requisição HTTP (simulada).', usage: 'curl [url]', examples: ['curl http://127.0.0.1:8787/mcp'], handler: 'sim', sim: (args) => [`HTTP/1.1 200 OK`, `content-type: application/json`, ``, `{"status":"ok","target":"${args[0] ?? '/'}","simulado":true}`] }),
  c({ name: 'nslookup', aliases: ['dig'], category: 'rede', description: 'Consulta DNS (simulada).', usage: 'nslookup [host]', examples: ['nslookup lab.local'], handler: 'sim', sim: (args) => [`Servidor: 127.0.0.53`, `Nome: ${args[0] ?? 'lab.local'}`, `Endereço: 10.0.0.42  (registro simulado)`] }),
  c({ name: 'nmap', category: 'rede', description: 'Varredura de portas (simulada, alvo local).', usage: 'nmap [alvo]', examples: ['nmap 127.0.0.1'], handler: 'sim', danger: false, sim: (args) => [`Nmap 7.94 :: varredura em ${args[0] ?? '127.0.0.1'}`, `PORTA     ESTADO   SERVIÇO`, `22/tcp    closed   ssh`, `8080/tcp  open     nexo-lab`, `8787/tcp  open     nexo-mcp`, `varredura simulada — nenhum pacote enviado`] }),

  // ─────────── defesa (efeito na simulação da rodada) ───────────
  c({ name: 'patch', category: 'defesa', description: 'Aplica correções — restaura integridade.', usage: 'patch [alvo]', examples: ['patch', 'patch nexo-core'], handler: 'defense', danger: true, requires_confirmation: true }),
  c({ name: 'block', aliases: ['ban'], category: 'defesa', description: 'Bloqueia IP/domínio de origem do ataque.', usage: 'block [ip]', examples: ['block 10.0.0.66'], handler: 'defense', permissions: 'admin', danger: true, requires_confirmation: true }),
  c({ name: 'isolate', category: 'defesa', description: 'Isola processo/sessão suspeita.', usage: 'isolate [processo]', examples: ['isolate agent_run'], handler: 'defense', danger: true, requires_confirmation: true }),
  c({ name: 'harden', category: 'defesa', description: 'Endurece o perímetro (policy deny).', usage: 'harden [serviço]', examples: ['harden'], handler: 'defense', danger: true, requires_confirmation: true }),
  c({ name: 'firewall', aliases: ['ufw'], category: 'defesa', description: 'Status do firewall.', usage: 'firewall', examples: ['firewall'], handler: 'sim', sim: ['Status: ativo', 'Regras: 50/s limite na 8787 · drop 10.0.0.66 · default deny'] }),
  c({ name: 'audit', category: 'defesa', description: 'Auditoria de segurança (SHA-256).', usage: 'audit', examples: ['audit'], handler: 'sim', sim: ['audit.jsonl :: cadeia íntegra', 'sha256 a4f9…c21d  · 128 registros · nenhuma adulteração'] }),
  c({ name: 'hash', category: 'defesa', description: 'Gera hash SHA-256 (simulado).', usage: 'hash [arquivo]', examples: ['hash policy.json'], handler: 'sim', sim: (args) => [`sha256(${args[0] ?? 'arquivo'}) = 3b8f1a…e94c  (simulado)`] }),

  // ─────────── pacotes (simulado) ───────────
  c({ name: 'pkg', category: 'pacotes', description: 'Pacotes com atualização (real) ou gerenciador (simulado).', usage: 'pkg [list|install|update]', examples: ['pkg'], handler: 'real:pkg', output: 'real' }),
  c({ name: 'update', aliases: ['apt'], category: 'pacotes', description: 'Atualiza lista de pacotes (simulado).', usage: 'update', examples: ['update'], handler: 'sim', sim: ['Lendo listas de pacotes… pronto', '3 pacotes podem ser atualizados (simulado)'] }),
  c({ name: 'install', category: 'pacotes', description: 'Instala pacote (simulado).', usage: 'install [pacote]', examples: ['install htop'], handler: 'sim', sim: (args) => [`Instalando ${args[0] ?? 'pacote'}…`, `Configurando ${args[0] ?? 'pacote'} (1.0) …`, 'concluído (simulado — nada foi instalado)'] }),

  // ─────────── utilidades (simulado) ───────────
  c({ name: 'calc', category: 'utilidades', description: 'Calculadora.', usage: 'calc [expressão]', examples: ['calc 2**10'], handler: 'sim', sim: (args) => { try { const expr = args.join(' ').replace(/[^-()\d/*+.eE\s]/g, ''); if (!expr) return ['uso: calc [expressão]']; const v = Function(`"use strict"; return (${expr})`)(); return [`= ${v}`] } catch { return ['expressão inválida'] } } }),
  c({ name: 'uuid', category: 'utilidades', description: 'Gera UUID.', usage: 'uuid', examples: ['uuid'], handler: 'sim', sim: () => [crypto.randomUUID()] }),
  c({ name: 'random', category: 'utilidades', description: 'Número aleatório.', usage: 'random [min] [max]', examples: ['random 1 100'], handler: 'sim', sim: (args) => { const a = Number(args[0] ?? 0), b = Number(args[1] ?? 100); return [String(Math.floor(a + Math.random() * (b - a + 1)))] } }),
  c({ name: 'base64', category: 'utilidades', description: 'Codifica texto em base64.', usage: 'base64 [texto]', examples: ['base64 nexo'], handler: 'sim', sim: (args) => [btoa(unescape(encodeURIComponent(args.join(' ') || '')))] }),

  // ─────────── nexo core (simulado) ───────────
  c({ name: 'nexo', category: 'nexo', description: 'Controle do núcleo.', usage: 'nexo [status|init|reset]', examples: ['nexo status'], handler: 'sim', sim: ['núcleo: ativo · catálogo 620 cmds · política deny · MCP 8787', 'ollama: 127.0.0.1:11434 · modelo gemma4:e2b-it-qat (simulado)'] }),
  c({ name: 'lab', category: 'nexo', description: 'Gerencia o laboratório.', usage: 'lab [status]', examples: ['lab status'], handler: 'sim', sim: ['LAB-01 :: arena ativa · vermelho operante · azul aprendendo'] }),
  c({ name: 'report', category: 'nexo', description: 'Relatório da sessão.', usage: 'report', examples: ['report'], handler: 'sim', sim: ['relatório da sessão :: veja placar, taxa de bloqueio e pico de estresse no painel lateral'] }),
  c({ name: 'mode', category: 'nexo', description: 'Modo de operação (defense/diag/net).', usage: 'mode [defense|diag|net]', examples: ['mode diag'], handler: 'special' }),
]

// ---------- consultas ----------

const byName = new Map<string, CommandDef>()
for (const def of REGISTRY) {
  byName.set(def.name, def)
  for (const a of def.aliases) byName.set(a, def)
}

export function findCommand(name: string): CommandDef | undefined {
  return byName.get(name.toLowerCase())
}

export function helpOverview(): string {
  const groups = new Map<Category, string[]>()
  for (const def of REGISTRY) {
    const list = groups.get(def.category) ?? []
    list.push(def.name)
    groups.set(def.category, list)
  }
  const order: Category[] = ['nucleo', 'diagnostico', 'rede', 'defesa', 'pacotes', 'utilidades', 'nexo']
  return order
    .filter((k) => groups.has(k))
    .map((k) => `▸ ${CATEGORY_LABEL[k]}: ${groups.get(k)!.join(' · ')}`)
    .join('\n')
}

export function helpDetail(def: CommandDef): string[] {
  return [
    `${def.name} — ${def.description}`,
    `uso: ${def.usage}`,
    `exemplos: ${def.examples.join('  ·  ')}`,
    `categoria: ${CATEGORY_LABEL[def.category]} · permissões: ${def.permissions}${def.aliases.length ? ` · aliases: ${def.aliases.join(', ')}` : ''}`,
    def.danger ? 'PERIGOSO: sim — pede confirmação [S/N] antes de executar' : 'perigoso: não',
  ]
}
