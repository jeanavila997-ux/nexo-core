import { Slider } from '@/components/ui/slider'
import type { SimStatus } from '@/hooks/useSimulation'
import type { Mode } from '@/lib/engine'
import { ROUND_LENGTH, intensityLabel } from '@/lib/engine'

interface Props {
  status: SimStatus
  mode: Mode
  intensity: number
  roundElapsed: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onMode: (m: Mode) => void
  onIntensity: (n: number) => void
}

const BTN =
  'min-h-[44px] border px-5 font-display text-lg uppercase tracking-[0.15em] transition-colors duration-150 active:translate-y-px'

export default function ControlDeck({
  status,
  mode,
  intensity,
  roundElapsed,
  onStart,
  onPause,
  onReset,
  onMode,
  onIntensity,
}: Props) {
  const running = status === 'running'
  const progress = Math.min(100, (roundElapsed / ROUND_LENGTH) * 100)

  return (
    <section className="border border-[#1a1a1e] bg-[#111114]">
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-8">
        {/* modos */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#8a877e]">
            MODO DE TESTE
          </span>
          <div className="flex">
            {(
              [
                ['prompt', 'TESTE DE PROMPT'],
                ['stress', 'ESTRESSE EXTREMO'],
              ] as [Mode, string][]
            ).map(([m, label]) => (
              <button
                key={m}
                onClick={() => onMode(m)}
                className={`min-h-[44px] border px-4 font-display text-base uppercase tracking-[0.12em] transition-colors ${
                  mode === m
                    ? 'border-[#ffaa00] bg-[#ffaa00]/10 text-[#ffaa00]'
                    : 'border-[#1a1a1e] text-[#8a877e] hover:text-[#c8c4ba]'
                } ${m === 'prompt' ? 'border-r-0' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* intensidade */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8a877e]">
              INTENSIDADE DO ATAQUE
            </span>
            <span className="font-display text-base text-[#ff0040]">
              {intensity}/10 · {intensityLabel(intensity)}
            </span>
          </div>
          <Slider
            value={[intensity]}
            min={1}
            max={10}
            step={1}
            onValueChange={([v]) => onIntensity(v)}
            className="py-3 [&_[data-slot=slider-range]]:bg-[#ff0040] [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:rounded-none [&_[data-slot=slider-thumb]]:border-[#ff0040] [&_[data-slot=slider-thumb]]:bg-[#0a0a0c] [&_[data-slot=slider-track]]:bg-[#1a1a1e]"
          />
          {/* progresso da rodada */}
          <div className="h-1 w-full bg-[#1a1a1e]">
            <div
              className="h-full bg-[#00aaff] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ações */}
        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <button
              onClick={onPause}
              className={`${BTN} border-[#ffaa00] text-[#ffaa00] hover:bg-[#ffaa00]/10`}
            >
              PAUSAR
            </button>
          ) : (
            <button
              onClick={onStart}
              className={`${BTN} border-[#00ff40] text-[#00ff40] hover:bg-[#00ff40]/10`}
            >
              {status === 'paused' ? 'RETOMAR' : 'INICIAR'}
            </button>
          )}
          <button
            onClick={onReset}
            className={`${BTN} border-[#1a1a1e] text-[#8a877e] hover:border-[#8a877e] hover:text-[#c8c4ba]`}
          >
            REINICIAR
          </button>
        </div>
      </div>
    </section>
  )
}
