#!/data/data/com.termux/files/usr/bin/node
// ============================================================
// NEXO Lab — servidor Termux (Node, zero dependências)
//
// Serve o dashboard (./dist) e expõe POST /api/exec, que roda
// comandos REAIS no Linux do Android (Termux), com whitelist
// estrita — nada destrutivo passa.
//
// Uso:  node server/servidor.mjs [porta]     (padrão 8080)
// ============================================================
import http from 'node:http'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listServers, speedtest } from './speedtest.mjs'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(ROOT, '..', 'dist')
const PORT = Number(process.argv[2] || process.env.PORT || 8080)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

// ---------- whitelist: o que o terminal pode executar de verdade ----------
// Cada chave é o comando digitado no console do azul.
// Valor: [binário, args, descrição]. Timeout 5s, saída limitada.
const WHITELIST = {
  scan: ['ss', ['-tulpn'], 'conexões e portas abertas'],
  net: ['ip', ['addr', 'show'], 'interfaces de rede'],
  route: ['ip', ['route', 'show'], 'tabela de rotas'],
  status: ['uptime', [], 'tempo ligado + carga'],
  mem: ['free', ['-h'], 'memória do dispositivo'],
  ps: ['ps', ['aux'], 'processos em execução'],
  disk: ['df', ['-h'], 'uso de disco'],
  sys: ['uname', ['-a'], 'kernel do Android/Linux'],
  whoami: ['whoami', [], 'usuário da sessão Termux'],
  id: ['id', [], 'uid, gid e grupos'],
  pkg: ['pkg', ['list-upgradable'], 'pacotes com atualização disponível'],
}

const TIMEOUT_MS = 5000
const MAX_OUT = 4000

function runReal(name) {
  return new Promise((resolve) => {
    const entry = WHITELIST[name]
    if (!entry) return resolve(null)
    const [bin, args, desc] = entry
    execFile(bin, args, { timeout: TIMEOUT_MS, maxBuffer: 128 * 1024 }, (err, stdout, stderr) => {
      const out = (stdout || stderr || '').toString().slice(0, MAX_OUT)
      if (err && !out) {
        return resolve({
          ok: false,
          desc,
          output: `ERRO :: "${bin}" falhou neste dispositivo (${err.code ?? err.message})`,
        })
      }
      resolve({ ok: true, desc, output: out.trim() || '(sem saída)' })
    })
  })
}

function json(res, code, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  })
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')

  // ---------- API ----------
  if (url.pathname === '/api/exec' && req.method === 'POST') {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 2048) req.destroy()
    })
    req.on('end', async () => {
      let cmd = ''
      try {
        cmd = String(JSON.parse(raw).cmd ?? '').trim().toLowerCase().split(/\s+/)[0]
      } catch {
        return json(res, 400, { ok: false, output: 'JSON inválido' })
      }
      if (!cmd || !(cmd in WHITELIST)) {
        return json(res, 200, {
          ok: false,
          whitelisted: false,
          output: `comando fora da whitelist: "${cmd || '(vazio)'}"\npermitidos: ${Object.keys(WHITELIST).join(' · ')}`,
        })
      }
      const result = await runReal(cmd)
      json(res, 200, { cmd, ...result })
    })
    return
  }

  if (url.pathname === '/api/health') {
    return json(res, 200, { ok: true, env: 'termux', whitelist: Object.keys(WHITELIST) })
  }

  // ---------- speedtest (Ookla CLI) ----------
  if (url.pathname === '/api/speedtest' && req.method === 'POST') {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 2048) req.destroy()
    })
    req.on('end', async () => {
      let serverId
      let force = false
      try {
        const body = JSON.parse(raw || '{}')
        serverId = body.server_id ?? body.serverId
        force = Boolean(body.force)
      } catch {
        /* body opcional */
      }
      const result = await speedtest({ serverId, force })
      json(res, 200, result)
    })
    return
  }

  if (url.pathname === '/api/speedtest/servers') {
    const result = await listServers()
    return json(res, 200, result)
  }

  // ---------- estático ----------
  let path = normalize(decodeURIComponent(url.pathname))
  if (path === '/' || path === '\\') path = '/index.html'
  const file = join(DIST, path)
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end('forbidden')
    return
  }
  try {
    const data = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    // SPA fallback
    try {
      const data = await readFile(join(DIST, 'index.html'))
      res.writeHead(200, { 'content-type': MIME['.html'] })
      res.end(data)
    } catch {
      res.writeHead(404).end('dist/index.html não encontrado — rode o build ou o install-termux.sh')
    }
  }
})

server.listen(PORT, () => {
  console.log('============================================================')
  console.log(` NEXO Lab :: servidor Termux ativo em http://localhost:${PORT}`)
  console.log(` API real: POST /api/exec  (whitelist: ${Object.keys(WHITELIST).join(', ')})`)
  console.log('============================================================')
})
