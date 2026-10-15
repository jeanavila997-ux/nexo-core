import { useCallback, useEffect, useRef, useState } from 'react'
import type { Exchange, LogEvent, Mode, Team } from '@/lib/engine'
import { DEFENSE_EFFECTS, ROUND_LENGTH, VECTORS, tick } from '@/lib/engine'
import { execReal, runSpeedtest } from '@/lib/backend'
import { findCommand, helpDetail, helpOverview } from '@/lib/registry'
import { loadCatalog, type Catalog } from '@/lib/catalog'

export type SimStatus = 'idle' | 'running' | 'paused' | 'roundEnd'

export interface HistoryPoint {
  t: number
  v: number
}

export interface SimState {
  status: SimStatus
  mode: Mode
  intensity: number
  integrity: number
  history: HistoryPoint[]
  round: number
  roundElapsed: number
  sessionT: number
  score: Record<Team, number>
  log: LogEvent[]
  exchanges: Exchange[]
  lastAction: { red: string; blue: string; breached: boolean } | null
  blocked: number
  breached: number
  peakStress: number
  adaptation: number
  momentum: number
  banner: { winner: Team; round: number } | null
}

const INITIAL: SimState = {
  status: 'idle',
  mode: 'prompt',
  intensity: 5,
  integrity: 100,
  history: [{ t: 0, v: 100 }],
  round: 1,
  roundElapsed: 0,
  sessionT: 0,
  score: { red: 0, blue: 0 },
  log: [
    { id: 0, t: 0, kind: 'sys', text: 'NEXO CORE :: laboratório pronto — aguardando início' },
  ],
  exchanges: [],
  lastAction: null,
  blocked: 0,
  breached: 0,
  peakStress: 0,
  adaptation: 0,
  momentum: 0,
  banner: null,
}

const MAX_LOG = 180
const MAX_HISTORY = 160

export function useSimulation() {
  const [state, setState] = useState<SimState>(INITIAL)
  const adaptation = useRef(0)
  const momentum = useRef(0)
  const exchangeId = useRef(1)
  const logId = useRef(1)
  const warned40 = useRef(false)
  const warned20 = useRef(false)
  const resumeAfterRound = useRef(false)
  const endTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const catalog = useRef<Catalog | null>(null)

  // carrega o catálogo real (620 comandos) para enriquecer o terminal
  useEffect(() => {
    void loadCatalog().then((c) => {
      catalog.current = c
    })
  }, [])

  const catalogCmd = useCallback((team: 'red' | 'blue'): string | null => {
    const c = catalog.current
    if (!c || c.commands.length === 0) return null
    const isDef = (cat: string) =>
      /segurança|auditoria|defender|firewall|privacidade|backup|reparo|monitoramento/i.test(cat)
    const pool = c.commands.filter((x) => (team === 'blue' ? isDef(x.cat) : !isDef(x.cat)))
    if (pool.length === 0) return null
    const pick = pool[Math.floor(Math.random() * pool.length)]
    const flag = pick.destructive ? '  ⚠' : ''
    return team === 'red'
      ? `$ pwsh -c "${pick.cmd}"  :: ${pick.title} [${pick.cat}]${flag}`
      : `$ pwsh -c "${pick.cmd}"  :: ${pick.title} [${pick.cat}]${flag}`
  }, [])

  const sysLog = (text: string, t: number): LogEvent => ({
    id: logId.current++,
    t,
    kind: 'sys',
    text,
  })

  const endRound = useCallback((winner: Team, s: SimState) => {
    resumeAfterRound.current = true
    const events: LogEvent[] = [
      {
        id: logId.current++,
        t: s.sessionT,
        kind: winner === 'red' ? 'alert' : 'sys',
        text:
          winner === 'red'
            ? `FIM DA RODADA ${s.round} :: SISTEMA COMPROMETIDO — ponto do VERMELHO`
            : `FIM DA RODADA ${s.round} :: PERÍMETRO MANTIDO — ponto do AZUL`,
      },
    ]
    setState((prev) => ({
      ...prev,
      status: 'roundEnd',
      banner: { winner, round: prev.round },
      score: { ...prev.score, [winner]: prev.score[winner] + 1 },
      log: [...prev.log, ...events].slice(-MAX_LOG),
    }))

    endTimeout.current = setTimeout(() => {
      setState((prev) => {
        if (!resumeAfterRound.current) return { ...prev, banner: null }
        const round = prev.round + 1
        warned40.current = false
        warned20.current = false
        return {
          ...prev,
          status: 'running',
          banner: null,
          round,
          roundElapsed: 0,
          integrity: 100,
          log: [
            ...prev.log,
            sysLog(`LAB-01 :: rodada ${round} iniciada — integridade restaurada a 100%`, prev.sessionT),
          ].slice(-MAX_LOG),
        }
      })
    }, 3000)
  }, [])

  // laço principal
  useEffect(() => {
    if (state.status !== 'running') return
    const ms = Math.max(100, 1050 - state.intensity * 95)
    const iv = setInterval(() => {
      setState((prev) => {
        if (prev.status !== 'running') return prev
        const dt = ms / 1000
        const sessionT = prev.sessionT + dt
        const roundElapsed = prev.roundElapsed + dt

        const result = tick({
          mode: prev.mode,
          intensity: prev.intensity,
          integrity: prev.integrity,
          adaptation: adaptation.current,
          momentum: momentum.current,
          exchangeId: exchangeId.current,
          t: sessionT,
        })
        adaptation.current = result.adaptation
        momentum.current = result.momentum

        const vector0 = VECTORS.find((v) => v.id === result.exchange.vectorId)!
        const fromCat =
          Math.random() < 0.5
            ? [catalogCmd('red'), catalogCmd('blue')]
            : [null, null]
        const cmdEvents: LogEvent[] = [
          { id: logId.current++, t: sessionT, kind: 'cmd', text: fromCat[0] ?? vector0.cmdRed },
          { id: logId.current++, t: sessionT, kind: 'cmd', text: fromCat[1] ?? vector0.cmdBlue },
        ]
        const events = [
          ...cmdEvents,
          ...result.events.map((e) => ({ ...e, id: logId.current++ })),
        ]
        exchangeId.current += 1

        if (!warned40.current && result.integrity < 40) {
          warned40.current = true
          events.push({
            id: logId.current++,
            t: sessionT,
            kind: 'alert',
            text: 'ALERTA :: integridade abaixo de 40% — defesa sob pressão',
          })
        }
        if (!warned20.current && result.integrity < 20) {
          warned20.current = true
          events.push({
            id: logId.current++,
            t: sessionT,
            kind: 'alert',
            text: 'CRÍTICO :: falha iminente do perímetro',
          })
        }

        const vector = vector0
        const stress = 100 - result.integrity

        const next: SimState = {
          ...prev,
          sessionT,
          roundElapsed,
          integrity: result.integrity,
          history: [...prev.history, { t: sessionT, v: result.integrity }].slice(-MAX_HISTORY),
          log: [...prev.log, ...events].slice(-MAX_LOG),
          exchanges: [...prev.exchanges.slice(-40), result.exchange],
          lastAction: {
            red: vector.name,
            blue: vector.counter,
            breached: result.breached,
          },
          blocked: prev.blocked + (result.breached ? 0 : 1),
          breached: prev.breached + (result.breached ? 1 : 0),
          peakStress: Math.max(prev.peakStress, stress),
          adaptation: result.adaptation,
          momentum: result.momentum,
        }

        if (result.integrity <= 0 || roundElapsed >= ROUND_LENGTH) {
          const winner: Team = result.integrity <= 0 ? 'red' : 'blue'
          // agenda fim de rodada fora do setState
          setTimeout(() => endRound(winner, next), 0)
          return { ...next, status: 'roundEnd' }
        }
        return next
      })
    }, ms)
    return () => clearInterval(iv)
  }, [state.status, state.intensity, state.mode, endRound])

  const start = useCallback(() => {
    resumeAfterRound.current = true
    setState((prev) => {
      if (prev.status === 'running') return prev
      const restarting = prev.status === 'idle'
      return {
        ...prev,
        status: 'running',
        log: [
          ...prev.log,
          sysLog(
            restarting
              ? `LAB-01 :: rodada ${prev.round} iniciada — modo ${prev.mode === 'prompt' ? 'TESTE DE PROMPT' : 'ESTRESSE EXTREMO'}, intensidade ${prev.intensity}`
              : 'LAB-01 :: simulação retomada',
            prev.sessionT,
          ),
        ].slice(-MAX_LOG),
      }
    })
  }, [])

  const pause = useCallback(() => {
    setState((prev) =>
      prev.status === 'running'
        ? { ...prev, status: 'paused', log: [...prev.log, sysLog('LAB-01 :: simulação pausada', prev.sessionT)].slice(-MAX_LOG) }
        : prev,
    )
  }, [])

  const reset = useCallback(() => {
    if (endTimeout.current) clearTimeout(endTimeout.current)
    resumeAfterRound.current = false
    adaptation.current = 0
    momentum.current = 0
    exchangeId.current = 1
    logId.current = 1
    warned40.current = false
    warned20.current = false
    setState({ ...INITIAL, mode: state.mode, intensity: state.intensity })
  }, [state.mode, state.intensity])

  const setMode = useCallback((mode: Mode) => setState((p) => ({ ...p, mode })), [])
  const setIntensity = useCallback(
    (intensity: number) => setState((p) => ({ ...p, intensity })),
    [],
  )

  // ============ console do defensor — dirigido pelo registro central ============
  const pendingConfirm = useRef<string | null>(null)
  const cwd = useRef('/home/nexo')
  const sessionHistory = useRef<string[]>([])
  const opMode = useRef('defense')

  const runCommand = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    sessionHistory.current.push(trimmed)

    const push = (fn: (prev: SimState) => LogEvent[]) =>
      setState((prev) => ({ ...prev, log: [...prev.log, ...fn(prev)].slice(-MAX_LOG) }))
    const echoLine = (t: number): LogEvent => ({ id: logId.current++, t, kind: 'in', text: `$ ${trimmed}` })
    const line = (t: number, kind: LogEvent['kind'], text: string): LogEvent => ({ id: logId.current++, t, kind, text })
    const lines = (t: number, kind: LogEvent['kind'], texts: string[]): LogEvent[] =>
      texts.map((text) => line(t, kind, text))

    const [firstRaw, ...args] = trimmed.split(/\s+/)
    const first = firstRaw.toLowerCase()

    // ── confirmação pendente [S/N] ──
    if (pendingConfirm.current) {
      const answer = first
      const pending = pendingConfirm.current
      if (answer === 's' || answer === 'sim') {
        pendingConfirm.current = null
        executeDefensive(pending)
      } else {
        pendingConfirm.current = null
        push((prev) => [line(prev.sessionT, 'sys', `· execução de "${pending}" cancelada`)])
      }
      return
    }

    // ── especiais do console ──
    if (first === 'clear') {
      setState((prev) => ({ ...prev, log: [echoLine(prev.sessionT)] }))
      return
    }
    if (first === 'history') {
      push((prev) => [echoLine(prev.sessionT), ...lines(prev.sessionT, 'sys', sessionHistory.current.map((h, i) => `${String(i + 1).padStart(3, ' ')}  ${h}`))])
      return
    }
    if (first === 'pwd') {
      push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'sys', cwd.current)])
      return
    }
    if (first === 'cd') {
      const target = args[0] ?? '/home/nexo'
      if (target === '..') cwd.current = cwd.current.split('/').slice(0, -1).join('/') || '/'
      else if (target.startsWith('/')) cwd.current = target
      else cwd.current = `${cwd.current}/${target}`.replace(/\/+/g, '/')
      push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'sys', cwd.current)])
      return
    }
    if (first === 'exit') {
      push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'sys', '· sessão do console encerrada — a simulação continua na arena')])
      return
    }
    if (first === 'help' || first === 'man') {
      const topic = (first === 'man' ? args[0] : args[0])?.toLowerCase()
      push((prev) => {
        const t = prev.sessionT
        if (!topic) return [echoLine(t), ...lines(t, 'sys', helpOverview().split('\n')), line(t, 'sys', '· detalhe: help [comando]')]
        const def = findCommand(topic)
        if (!def) return [echoLine(t), line(t, 'alert', `· comando não reconhecido: "${topic}" — digite help`)]
        return [echoLine(t), ...lines(t, 'sys', helpDetail(def))]
      })
      return
    }
    if (first === 'mode') {
      const m = (args[0] ?? '').toLowerCase()
      if (['defense', 'diag', 'net'].includes(m)) {
        opMode.current = m
        push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'sys', `· modo de operação: ${m}`)])
      } else {
        push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'alert', 'uso: mode [defense|diag|net]')])
      }
      return
    }

    // ── registro central ──
    const def = findCommand(first)
    if (!def) {
      push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'alert', `· comando não reconhecido: "${first}" — digite help`)])
      return
    }

    // confirmação para comandos perigosos
    if (def.requires_confirmation) {
      pendingConfirm.current = def.name
      push((prev) => [echoLine(prev.sessionT), line(prev.sessionT, 'alert', `[S/N] Confirmar execução de "${def.name}"? (${def.description.toLowerCase()})`)])
      return
    }
    dispatch(def, args)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
  }, [])

  // defesa com efeito na rodada
  const executeDefensive = (name: string) => {
    const fx = DEFENSE_EFFECTS[name]
    const labels: Record<string, string> = {
      patch: 'apt-get install --only-upgrade nexo-core :: hotfix aplicado — integridade restaurada (simulado, requer root)',
      block: 'iptables -A INPUT -s <atacante> -j DROP :: embalo do vermelho cortado (simulado, requer root)',
      isolate: 'kill -9 <pid> && unshare -n :: sessão hostil encerrada (simulado, requer root)',
      harden: 'chmod 444 policy.json && setenforce 1 :: perímetro endurecido (simulado, requer root)',
    }
    setState((prev) => {
      let integrity = prev.integrity
      if (prev.status === 'running' && fx) {
        if (fx.adaptationDelta) adaptation.current = Math.min(1.5, adaptation.current + fx.adaptationDelta)
        if (fx.momentumDelta) momentum.current = Math.max(0, momentum.current + fx.momentumDelta)
        if (fx.integrityDelta) integrity = Math.min(100, prev.integrity + fx.integrityDelta)
      }
      return {
        ...prev,
        integrity,
        log: [...prev.log, { id: logId.current++, t: prev.sessionT, kind: 'blue' as const, text: labels[name] ?? `◂ defesa: ${name} executado` }].slice(-MAX_LOG),
      }
    })
  }

  // despacha handlers do registro
  const dispatch = (def: NonNullable<ReturnType<typeof findCommand>>, args: string[]) => {
    const push = (fn: (prev: SimState) => LogEvent[]) =>
      setState((prev) => ({ ...prev, log: [...prev.log, ...fn(prev)].slice(-MAX_LOG) }))
    const line = (t: number, kind: LogEvent['kind'], text: string): LogEvent => ({ id: logId.current++, t, kind, text })

    if (def.handler === 'defense') {
      executeDefensive(def.name)
      return
    }

    if (def.handler.startsWith('real:speedtest')) {
      push((prev) => [line(prev.sessionT, 'sys', '· medindo link real… (Ookla CLI, até ~1 min, ~100 MB)')])
      void runSpeedtest(args[0]?.toLowerCase() === 'force').then((r) => {
        if (!r) {
          push((prev) => [line(prev.sessionT, 'alert', '· speedtest indisponível — sirva o site pelo servidor Termux (node server/servidor.mjs)')])
          return
        }
        if (!r.ok) {
          push((prev) => [line(prev.sessionT, 'alert', `· speedtest falhou: ${r.error ?? 'erro desconhecido'}`)])
          return
        }
        const srv = r.server ? `${r.server.name ?? ''} (${r.server.location ?? ''}, ${r.server.country ?? ''})` : '?'
        push((prev) => [
          line(prev.sessionT, 'sys', `[SPEEDTEST REAL${r.cached ? ' · cache' : ''}]`),
          line(prev.sessionT, 'blue', `↓ ${r.download_mbps ?? '?'} Mbps · ↑ ${r.upload_mbps ?? '?'} Mbps · ping ${r.ping_ms ?? '?'} ms · jitter ${r.jitter_ms ?? '?'} ms · perda ${r.packet_loss ?? 0}%`),
          line(prev.sessionT, 'sys', `isp: ${r.isp ?? '?'} · servidor: ${srv}${r.interface?.is_vpn ? ' · VPN ativa' : ''}`),
          ...(r.result_url ? [line(prev.sessionT, 'sys', `resultado: ${r.result_url}`)] : []),
        ])
      })
      return
    }

    if (def.handler.startsWith('real:')) {
      void execReal(def.name).then((real) => {
        if (real) {
          push((prev) => [
            line(prev.sessionT, real.ok ? 'sys' : 'alert', real.ok ? `[TERMUX :: ${real.cmd}]` : real.output),
            ...(real.ok ? real.output.split('\n').slice(0, 14).map((l) => line(prev.sessionT, 'sys' as const, l)) : []),
          ])
        } else {
          push((prev) => [line(prev.sessionT, 'alert', `· "${def.name}" precisa do servidor Termux para saída real — sem ele, nada é executado`)])
        }
      })
      return
    }

    // handler simulado
    const out = typeof def.sim === 'function' ? def.sim(args, '/home/nexo') : def.sim ?? ['(sem saída)']
    push((prev) => out.map((text) => line(prev.sessionT, 'sys', text)))
  }

  // parâmetro de depuração: ?autostart inicia a simulação ao carregar
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('autostart')) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { state, start, pause, reset, setMode, setIntensity, runCommand }
}
