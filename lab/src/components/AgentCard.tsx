import type { SimStatus } from '@/hooks/useSimulation'

interface Props {
  team: 'red' | 'blue'
  status: SimStatus
  action: string | null
  meterLabel: string
  meterValue: number // 0..100
  subLabel: string
  subValue: number // 0..100
}

const THEME = {
  red: {
    name: 'AGENTE VERMELHO',
    role: '// ATAQUE',
    motto: '“MOSTRA SEU MELHOR”',
    color: '#ff0040',
    dim: 'rgba(255,0,64,0.25)',
    actionPrefix: 'executando',
  },
  blue: {
    name: 'AGENTE AZUL',
    role: '// DEFESA',
    motto: '“APRENDER E DEFENDER”',
    color: '#00aaff',
    dim: 'rgba(0,170,255,0.25)',
    actionPrefix: 'contra-medida',
  },
} as const

export default function AgentCard({
  team,
  status,
  action,
  meterLabel,
  meterValue,
  subLabel,
  subValue,
}: Props) {
  const t = THEME[team]
  const running = status === 'running'

  return (
    <section className="flex flex-col border border-[#1a1a1e] bg-[#111114]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-[#1a1a1e] bg-[#0d0d10] px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2"
            style={{
              background: t.color,
              boxShadow: `0 0 6px ${t.dim}`,
              animation: running ? 'pulse-node 1s ease-in-out infinite' : 'none',
              opacity: running ? 1 : 0.4,
            }}
          />
          <span className="font-display text-xl leading-none" style={{ color: t.color }}>
            {t.name}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a877e]">{t.role}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8a877e]">{t.motto}</p>

        {/* medidor principal */}
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a877e]">
              {meterLabel}
            </span>
            <span className="font-display text-lg leading-none" style={{ color: t.color }}>
              {Math.round(meterValue)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1a1a1e]">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${Math.min(100, meterValue)}%`, background: t.color }}
            />
          </div>
        </div>

        {/* medidor secundário */}
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a877e]">{subLabel}</span>
            <span className="font-display text-sm leading-none text-[#c8c4ba]">
              {Math.round(subValue)}%
            </span>
          </div>
          <div className="h-1 w-full bg-[#1a1a1e]">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${Math.min(100, subValue)}%`, background: t.dim }}
            />
          </div>
        </div>

        {/* ação corrente */}
        <div className="mt-auto border border-[#1a1a1e] bg-[#0a0a0c] px-2.5 py-2">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8a877e]">
            {t.actionPrefix}
          </span>
          <span
            className="font-display block truncate text-lg leading-tight"
            style={{ color: action ? t.color : '#8a877e' }}
          >
            {action ?? (status === 'idle' ? 'aguardando…' : '—')}
          </span>
          {running && (
            <div className="relative mt-1 h-px overflow-hidden bg-[#1a1a1e]">
              <div
                className="scan-sweep absolute inset-y-0 w-1/3"
                style={{ background: `linear-gradient(90deg, transparent, ${t.color}, transparent)` }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
