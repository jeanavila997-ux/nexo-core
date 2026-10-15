// server/speedtest.mjs
import { spawn } from 'node:child_process'

const BIN = process.env.SPEEDTEST_BIN ?? 'speedtest'
const TIMEOUT_MS = 90_000 // Ookla pode demorar em rede ruim

// Cache: 5 min. O teste é caro (trafega ~100 MB), evita spam.
let cache = null
let cachedAt = 0
const CACHE_TTL = 5 * 60_000
let inflight = null

function runSpeedtest({ serverId, acceptLicense = true } = {}) {
  return new Promise((resolve) => {
    const args = ['-f', 'json']
    if (acceptLicense) args.push('--accept-license', '--accept-gdpr')
    if (serverId) args.push('-s', String(serverId))

    const p = spawn(BIN, args, {
      shell: false,
      timeout: TIMEOUT_MS,
      killSignal: 'SIGKILL',
      env: { PATH: process.env.PATH, HOME: process.env.HOME ?? '/' },
    })

    let out = '',
      err = ''
    p.stdout.on('data', (c) => (out += c))
    p.stderr.on('data', (c) => (err += c))

    p.on('error', (e) => {
      resolve({
        ok: false,
        error:
          e.code === 'ENOENT' ? 'speedtest não instalado (veja TERMUX.md)' : e.message,
      })
    })

    p.on('close', (code) => {
      // Ookla imprime JSON no stdout; stderr traz progresso e avisos
      const jsonStart = out.indexOf('{')
      if (jsonStart === -1) {
        return resolve({
          ok: false,
          error: `saída inválida (exit ${code})`,
          raw: out.slice(0, 400),
          err,
        })
      }
      let raw
      try {
        raw = JSON.parse(out.slice(jsonStart))
      } catch (e) {
        return resolve({ ok: false, error: 'parse json: ' + e.message })
      }
      resolve({ ok: true, raw })
    })
  })
}

// Converte o payload cru da Ookla num shape estável pra UI
function normalize(raw) {
  const toMbps = (bw) => (bw != null ? +((bw * 8) / 1_000_000).toFixed(2) : null)
  const toMs = (v) => (v != null ? +Number(v).toFixed(1) : null)

  return {
    // ─── latência ───
    ping_ms: toMs(raw.ping?.latency),
    jitter_ms: toMs(raw.ping?.jitter),
    ping_low: toMs(raw.ping?.low),
    ping_high: toMs(raw.ping?.high),
    packet_loss: raw.packetLoss ?? null,

    // ─── throughput (bandwidth é bytes/s) ───
    download_mbps: toMbps(raw.download?.bandwidth),
    upload_mbps: toMbps(raw.upload?.bandwidth),

    // ─── latência sob carga ("bufferbloat") ───
    download_latency_iqm: toMs(raw.download?.latency?.iqm),
    upload_latency_iqm: toMs(raw.upload?.latency?.iqm),

    // ─── metadados ───
    isp: raw.isp ?? null,
    server: raw.server
      ? {
          id: raw.server.id,
          name: raw.server.name,
          location: raw.server.location,
          country: raw.server.country,
          host: raw.server.host,
        }
      : null,
    interface: raw.interface
      ? {
          name: raw.interface.name,
          internal_ip: raw.interface.internalIp,
          external_ip: raw.interface.externalIp,
          is_vpn: raw.interface.isVpn,
          mac: raw.interface.macAddr,
        }
      : null,
    result_url: raw.result?.url ?? null,
    result_id: raw.result?.id ?? null,
    timestamp: raw.timestamp ?? new Date().toISOString(),
  }
}

export async function speedtest({ serverId, force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cachedAt < CACHE_TTL) {
    return { ok: true, cached: true, age_ms: now - cachedAt, ...cache }
  }
  if (inflight) return inflight // dedupe concorrente

  inflight = (async () => {
    const r = await runSpeedtest({ serverId })
    if (!r.ok) return r
    const normalized = normalize(r.raw)
    cache = normalized
    cachedAt = Date.now()
    return { ok: true, cached: false, age_ms: 0, ...normalized }
  })().finally(() => {
    inflight = null
  })

  return inflight
}

// Lista servidores próximos (útil pra UI "escolher servidor")
export function listServers() {
  return new Promise((resolve) => {
    const p = spawn(BIN, ['-L', '-f', 'json', '--accept-license', '--accept-gdpr'], {
      shell: false,
      timeout: 10_000,
    })
    let out = ''
    p.stdout.on('data', (c) => (out += c))
    p.on('error', () => resolve({ ok: false, error: 'binário não encontrado' }))
    p.on('close', () => {
      try {
        const j = JSON.parse(out.slice(out.indexOf('{')))
        resolve({ ok: true, servers: j.servers ?? [] })
      } catch (e) {
        resolve({ ok: false, error: 'parse: ' + e.message })
      }
    })
  })
}
