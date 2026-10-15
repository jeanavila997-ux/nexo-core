import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts'
import type { HistoryPoint } from '@/hooks/useSimulation'

export default function IntegrityChart({ history }: { history: HistoryPoint[] }) {
  return (
    <section className="border border-[#1a1a1e] bg-[#111114]">
      <div className="flex items-center justify-between border-b border-[#1a1a1e] bg-[#0d0d10] px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a877e]">
          INTEGRIDADE DO SISTEMA :: sessão
        </span>
        <span className="font-display text-sm text-[#00aaff]">0–100%</span>
      </div>
      <div className="h-[130px] px-1 py-2 lg:h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="integ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00aaff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00aaff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <ReferenceLine y={40} stroke="#ffaa00" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={20} stroke="#ff0040" strokeDasharray="4 4" strokeOpacity={0.6} />
            <Area
              type="stepAfter"
              dataKey="v"
              stroke="#00aaff"
              strokeWidth={1.6}
              fill="url(#integ)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
