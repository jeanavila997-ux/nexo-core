import type { Team } from '@/lib/engine'

interface Props {
  score: Record<Team, number>
  blocked: number
  breached: number
  peakStress: number
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 border border-[#1a1a1e] bg-[#111114] px-2 py-3">
      <span className="text-[9px] uppercase tracking-[0.25em] text-[#8a877e]">{label}</span>
      <div className="font-display text-2xl leading-none lg:text-3xl">{children}</div>
    </div>
  )
}

export default function StatsBar({ score, blocked, breached, peakStress }: Props) {
  const total = blocked + breached
  const blockRate = total === 0 ? 100 : (blocked / total) * 100

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="PLACAR :: RODADAS">
        <span className="text-[#ff0040]">{score.red}</span>
        <span className="mx-2 text-[#8a877e]">×</span>
        <span className="text-[#00aaff]">{score.blue}</span>
      </Stat>
      <Stat label="TAXA DE BLOQUEIO">
        <span className="text-[#e0ddd5]">{blockRate.toFixed(0)}%</span>
      </Stat>
      <Stat label="TROCAS TOTAIS">
        <span className="text-[#e0ddd5]">{total}</span>
      </Stat>
      <Stat label="PICO DE ESTRESSE">
        <span className={peakStress > 60 ? 'text-[#ff0040]' : 'text-[#ffaa00]'}>
          {peakStress.toFixed(0)}%
        </span>
      </Stat>
    </div>
  )
}
