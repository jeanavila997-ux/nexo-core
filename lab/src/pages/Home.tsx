import AgentCard from '@/components/AgentCard'
import Arena from '@/components/Arena'
import CatalogPanel from '@/components/CatalogPanel'
import ControlDeck from '@/components/ControlDeck'
import CrtOverlay from '@/components/CrtOverlay'
import EventLog from '@/components/EventLog'
import Hud from '@/components/Hud'
import IntegrityChart from '@/components/IntegrityChart'
import StatsBar from '@/components/StatsBar'
import { useSimulation } from '@/hooks/useSimulation'

export default function Home() {
  const { state, start, pause, reset, setMode, setIntensity, runCommand } = useSimulation()

  const total = state.blocked + state.breached
  const blockRate = total === 0 ? 100 : (state.blocked / total) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0ddd5]">
      <CrtOverlay />
      <Hud status={state.status} sessionT={state.sessionT} />

      {/* banner de fim de rodada */}
      {state.banner && (
        <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
          <div key={state.banner.round} className="banner-in text-center">
            <p
              className={`font-display text-5xl uppercase leading-none tracking-[0.08em] sm:text-7xl lg:text-8xl ${
                state.banner.winner === 'red'
                  ? 'chroma text-[#ff0040]'
                  : 'chroma text-[#00aaff]'
              }`}
            >
              {state.banner.winner === 'red' ? 'SISTEMA COMPROMETIDO' : 'PERÍMETRO MANTIDO'}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#8a877e]">
              rodada {String(state.banner.round).padStart(2, '0')} encerrada — próxima em 3s
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1600px] space-y-3 px-3 py-4 sm:px-4 lg:space-y-4 lg:px-8">
        <div className="wobble-in">
          <ControlDeck
            status={state.status}
            mode={state.mode}
            intensity={state.intensity}
            roundElapsed={state.roundElapsed}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onMode={setMode}
            onIntensity={setIntensity}
          />
        </div>

        {/* arena + agentes */}
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="order-2 grid grid-cols-2 gap-3 lg:order-none lg:col-span-3 lg:grid-cols-1 lg:grid-rows-2">
            <div className="wobble-in" style={{ animationDelay: '0.05s' }}>
              <AgentCard
                team="red"
                status={state.status}
                action={state.lastAction?.red ?? null}
                meterLabel="AGRESSIVIDADE"
                meterValue={state.intensity * 10}
                subLabel="EMBALO"
                subValue={(state.momentum / 1.5) * 100}
              />
            </div>
            <div className="wobble-in" style={{ animationDelay: '0.1s' }}>
              <AgentCard
                team="blue"
                status={state.status}
                action={state.lastAction?.blue ?? null}
                meterLabel="RESILIÊNCIA"
                meterValue={blockRate}
                subLabel="APRENDIZADO"
                subValue={(state.adaptation / 1.5) * 100}
              />
            </div>
          </div>

          <div className="order-1 wobble-in lg:order-none lg:col-span-9" style={{ animationDelay: '0.15s' }}>
            <Arena
              exchanges={state.exchanges}
              integrity={state.integrity}
              status={state.status}
              intensity={state.intensity}
              round={state.round}
            />
          </div>
        </div>

        {/* log + métricas */}
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="wobble-in lg:col-span-7" style={{ animationDelay: '0.2s' }}>
            <EventLog log={state.log} onCommand={runCommand} />
          </div>
          <div className="flex wobble-in flex-col gap-3 lg:col-span-5" style={{ animationDelay: '0.25s' }}>
            <IntegrityChart history={state.history} />
            <StatsBar
              score={state.score}
              blocked={state.blocked}
              breached={state.breached}
              peakStress={state.peakStress}
            />
          </div>
        </div>

        <div className="wobble-in" style={{ animationDelay: '0.3s' }}>
          <CatalogPanel />
        </div>

        <footer className="flex flex-col items-center gap-1 border-t border-[#1a1a1e] py-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a877e]">
            SIMULAÇÃO LOCAL — NENHUM SISTEMA REAL É AFETADO
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a877e]/60">
            base: nexo-core · MCP-first · gate determinístico · auditoria SHA-256
          </p>
        </footer>
      </main>
    </div>
  )
}
