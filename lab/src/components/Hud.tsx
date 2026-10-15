import type { SimStatus } from '@/hooks/useSimulation'
import { formatClock } from '@/lib/engine'

interface Props {
  status: SimStatus
  sessionT: number
}

const STATUS_LABEL: Record<SimStatus, string> = {
  idle: 'EM ESPERA',
  running: 'SIMULAÇÃO ATIVA',
  paused: 'PAUSADO',
  roundEnd: 'FIM DE RODADA',
}

export default function Hud({ status, sessionT }: Props) {
  const active = status === 'running'
  return (
    <header
      className="sticky top-0 z-50 border-b border-[#1a1a1e] bg-[#0a0a0c]/85 backdrop-blur-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-display chroma shrink-0 text-2xl leading-none tracking-wide text-[#e0ddd5] lg:text-3xl">
            NEXO_CORE
          </span>
          <span className="hidden truncate text-[11px] uppercase tracking-[0.2em] text-[#8a877e] sm:inline">
            LAB-01 :: defesa adaptativa
          </span>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          <span
            className={`hidden text-[11px] uppercase tracking-[0.2em] md:inline ${
              active ? 'text-[#00ff40]' : 'text-[#8a877e]'
            }`}
          >
            {STATUS_LABEL[status]}
          </span>
          <span className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                active ? 'blink-rec bg-[#ff0040]' : 'bg-[#8a877e]'
              }`}
            />
            <span className="font-display text-xl leading-none text-[#ffaa00]">
              {formatClock(sessionT)}
            </span>
          </span>
        </div>
      </div>
    </header>
  )
}
