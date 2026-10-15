import { useEffect, useRef } from 'react'
import type { Exchange } from '@/lib/engine'
import type { SimStatus } from '@/hooks/useSimulation'

interface Props {
  exchanges: Exchange[]
  integrity: number
  status: SimStatus
  intensity: number
  round: number
}

interface Particle {
  x: number
  y: number
  vx: number
  breached: boolean
  phase: number
  dead: boolean
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: string
}

const RED = '#ff0040'
const CYAN = '#00aaff'
const DIM = '#8a877e'

function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

export default function Arena({ exchanges, integrity, status, intensity, round }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const sparks = useRef<Spark[]>([])
  const lastExchangeId = useRef(0)
  const shakeUntil = useRef(0)
  const propsRef = useRef({ exchanges, integrity, status, intensity, round })
  propsRef.current = { exchanges, integrity, status, intensity, round }

  // fila de novos ataques vindos do motor
  useEffect(() => {
    for (const ex of exchanges) {
      if (ex.id <= lastExchangeId.current) continue
      lastExchangeId.current = ex.id
      particles.current.push({
        x: 0,
        y: 0,
        vx: 0,
        breached: ex.breached,
        phase: Math.random() * Math.PI * 2,
        dead: false,
      })
    }
  }, [exchanges])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let w = 0
    let h = 0
    let raf = 0

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    const spawnSparks = (x: number, y: number, color: string, n: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const v = (0.4 + Math.random() * 0.6) * speed
        sparks.current.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 0,
          max: 24 + Math.random() * 22,
          color,
        })
      }
    }

    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      const { integrity: integ, status: st, intensity: inten, round: rd } = propsRef.current

      const redX = w * 0.08
      const midY = h * 0.5
      const shieldX = w * 0.84
      const coreX = w * 0.93
      const speed = (0.12 + inten * 0.02) * dt

      ctx.clearRect(0, 0, w, 10000)
      ctx.save()
      if (now < shakeUntil.current) {
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
      }

      // grade de fundo
      ctx.strokeStyle = 'rgba(255,255,255,0.035)'
      ctx.lineWidth = 1
      const grid = 42
      for (let gx = (w / 2) % grid; gx < w; gx += grid) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, h)
        ctx.stroke()
      }
      for (let gy = (h / 2) % grid; gy < h; gy += grid) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(w, gy)
        ctx.stroke()
      }

      // linha de trajetória
      ctx.strokeStyle = 'rgba(138,135,126,0.18)'
      ctx.setLineDash([3, 6])
      ctx.beginPath()
      ctx.moveTo(redX, midY)
      ctx.lineTo(coreX, midY)
      ctx.stroke()
      ctx.setLineDash([])

      // ---- nó vermelho ----
      const pulse = 0.6 + 0.4 * Math.sin(now / 280)
      ctx.save()
      ctx.shadowColor = RED
      ctx.shadowBlur = 18 * pulse
      ctx.fillStyle = RED
      ctx.globalAlpha = st === 'running' ? 0.95 : 0.35
      ctx.beginPath()
      ctx.arc(redX, midY, 7 + 2.5 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,0,64,0.4)'
      ctx.beginPath()
      ctx.arc(redX, midY, 15 + 4 * pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = DIM
      ctx.font = '15px VT323, monospace'
      ctx.textAlign = 'center'
      ctx.fillText('RED', redX, midY + 38)

      // ---- escudo azul ----
      const shieldAlpha = 0.2 + (integ / 100) * 0.8
      ctx.save()
      ctx.strokeStyle = CYAN
      ctx.globalAlpha = shieldAlpha
      ctx.shadowColor = CYAN
      ctx.shadowBlur = 14
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(coreX, midY, h * 0.3, Math.PI * 0.62, Math.PI * 1.38)
      ctx.stroke()
      ctx.restore()
      ctx.save()
      ctx.strokeStyle = 'rgba(0,170,255,0.3)'
      ctx.setLineDash([2, 5])
      ctx.beginPath()
      ctx.arc(coreX, midY, h * 0.38, Math.PI * 0.6, Math.PI * 1.4)
      ctx.stroke()
      ctx.restore()

      // ---- núcleo do sistema ----
      const coreColor = lerpColor([0, 170, 255], [255, 0, 64], (100 - integ) / 100)
      const corePulse = 1 + 0.12 * Math.sin(now / 200)
      ctx.save()
      ctx.translate(coreX, midY)
      ctx.rotate(now / 2400)
      ctx.scale(corePulse, corePulse)
      ctx.shadowColor = coreColor
      ctx.shadowBlur = 20
      ctx.strokeStyle = coreColor
      ctx.lineWidth = 2
      ctx.strokeRect(-8, -8, 16, 16)
      ctx.restore()
      ctx.fillStyle = DIM
      ctx.font = '15px VT323, monospace'
      ctx.textAlign = 'center'
      ctx.fillText('CORE', coreX, midY + 38)

      // ---- partículas de ataque ----
      for (const p of particles.current) {
        if (p.dead) continue
        if (p.x === 0 && p.vx === 0) {
          p.x = redX + 12
          p.y = midY + (Math.random() - 0.5) * 24
          p.vx = speed
        }
        p.x += p.vx * dt * 0.06 * 60
        p.phase += 0.004 * dt
        p.y += Math.sin(p.phase) * 0.6

        if (!p.breached && p.x >= shieldX) {
          p.dead = true
          spawnSparks(shieldX, p.y, CYAN, 10, 2.2)
          continue
        }
        if (p.breached && p.x >= coreX - 6) {
          p.dead = true
          spawnSparks(coreX - 6, p.y, RED, 18, 3.2)
          shakeUntil.current = now + 200
          continue
        }

        ctx.save()
        ctx.shadowColor = p.breached ? RED : '#ff5c85'
        ctx.shadowBlur = 8
        ctx.fillStyle = p.breached ? RED : '#ff5c85'
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
        // rastro
        ctx.globalAlpha = 0.35
        ctx.fillRect(p.x - 10, p.y - 1, 6, 2)
        ctx.restore()
      }
      particles.current = particles.current.filter((p) => !p.dead && p.x < w + 20)

      // ---- faíscas ----
      for (const s of sparks.current) {
        s.life += dt / 16.7
        s.x += s.vx * dt * 0.06
        s.y += s.vy * dt * 0.06
        s.vx *= 0.96
        s.vy *= 0.96
        const a = Math.max(0, 1 - s.life / s.max)
        ctx.globalAlpha = a
        ctx.fillStyle = s.color
        ctx.fillRect(s.x, s.y, 2.5, 2.5)
        ctx.globalAlpha = 1
      }
      sparks.current = sparks.current.filter((s) => s.life < s.max)

      // ---- leituras ----
      ctx.textAlign = 'left'
      ctx.font = '16px VT323, monospace'
      ctx.fillStyle = DIM
      ctx.fillText(`RODADA ${String(rd).padStart(2, '0')}`, 12, 22)
      ctx.textAlign = 'right'
      ctx.font = '30px VT323, monospace'
      ctx.fillStyle = coreColor
      ctx.fillText(`${Math.round(integ)}%`, w - 12, 32)
      ctx.font = '13px VT323, monospace'
      ctx.fillStyle = DIM
      ctx.fillText('INTEGRIDADE', w - 12, 46)

      ctx.restore()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <section className="relative border border-[#1a1a1e] bg-[#0d0d10]">
      <div className="flex items-center justify-between border-b border-[#1a1a1e] px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a877e]">
          ARENA DE CONFRONTO :: canal MCP
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a877e]">
          {status === 'running' ? 'ao vivo' : 'standby'}
        </span>
      </div>
      <div className="relative h-[280px] sm:h-[320px] lg:h-[400px]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
    </section>
  )
}
