// Ponte com o servidor Termux (server/servidor.mjs).
// Quando o site é servido por ele, os comandos do console
// executam DE VERDADE no Linux do Android. Sem servidor,
// retorna null e o frontend cai na simulação local.

export interface RealResult {
  ok: boolean
  cmd: string
  desc?: string
  output: string
}

let cached: boolean | null = null

export async function backendAvailable(): Promise<boolean> {
  if (cached !== null) return cached
  try {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 1500)
    const res = await fetch('/api/health', { signal: ctrl.signal })
    clearTimeout(to)
    cached = res.ok
  } catch {
    cached = false
  }
  return cached
}

export interface SpeedtestResult {
  ok: boolean
  error?: string
  cached?: boolean
  age_ms?: number
  ping_ms?: number | null
  jitter_ms?: number | null
  packet_loss?: number | null
  download_mbps?: number | null
  upload_mbps?: number | null
  isp?: string | null
  server?: { name?: string; location?: string; country?: string } | null
  interface?: { external_ip?: string; is_vpn?: boolean } | null
  result_url?: string | null
  timestamp?: string
}

export async function runSpeedtest(force = false): Promise<SpeedtestResult | null> {
  if (!(await backendAvailable())) return null
  try {
    // speedtest real pode levar até ~90s
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 95_000)
    const res = await fetch('/api/speedtest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ force }),
      signal: ctrl.signal,
    })
    clearTimeout(to)
    if (!res.ok) return null
    return (await res.json()) as SpeedtestResult
  } catch {
    return null
  }
}

export async function execReal(cmd: string): Promise<RealResult | null> {
  if (!(await backendAvailable())) return null
  try {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 7000)
    const res = await fetch('/api/exec', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cmd }),
      signal: ctrl.signal,
    })
    clearTimeout(to)
    if (!res.ok) return null
    return (await res.json()) as RealResult
  } catch {
    return null
  }
}
