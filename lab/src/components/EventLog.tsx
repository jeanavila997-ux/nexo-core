import { useEffect, useRef, useState } from 'react'
import type { LogEvent } from '@/lib/engine'
import { formatClock } from '@/lib/engine'

const KIND_STYLE: Record<LogEvent['kind'], string> = {
  red: 'text-[#ff5c85]',
  blue: 'text-[#6ecfff]',
  sys: 'text-[#8a877e]',
  alert: 'text-[#ffaa00]',
  cmd: 'text-[#e0ddd5]',
  in: 'text-[#e0ddd5]',
}

interface Props {
  log: LogEvent[]
  onCommand: (raw: string) => void
}

export default function EventLog({ log, onCommand }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log])

  const submit = () => {
    const v = input.trim()
    if (!v) return
    onCommand(v)
    setHistory((h) => [...h, v])
    setHistIdx(-1)
    setInput('')
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx)
      setInput(history[idx])
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const idx = histIdx + 1
      if (idx >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(idx)
        setInput(history[idx])
      }
    }
  }

  return (
    <section className="flex min-h-0 flex-col border border-[#1a1a1e] bg-[#111114]">
      <div className="flex items-center justify-between border-b border-[#1a1a1e] bg-[#0d0d10] px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a877e]">
          TERMINAL :: bash · audit.jsonl
        </span>
        <span className="font-display text-sm text-[#ffaa00]">{log.length} regs</span>
      </div>

      <div
        ref={bodyRef}
        className="scroll-slim h-[240px] overflow-y-auto px-3 py-2 lg:h-[300px]"
      >
        {log.map((e) => (
          <div key={e.id} className="log-line flex gap-2 py-[1px]">
            <span className="font-display shrink-0 text-sm text-[#ffaa00]/70">
              T+{formatClock(e.t)}
            </span>
            <span
              className={`font-display break-all text-sm leading-snug ${KIND_STYLE[e.kind]} ${
                e.kind === 'cmd' ? 'opacity-80' : ''
              }`}
            >
              {e.kind === 'red' ? '▸ ' : e.kind === 'blue' ? '◂ ' : e.kind === 'cmd' || e.kind === 'in' ? '' : '· '}
              {e.text}
            </span>
          </div>
        ))}
      </div>

      {/* console do defensor */}
      <div className="border-t border-[#1a1a1e] bg-[#0d0d10] px-3 py-2">
        <label className="mb-1 block text-[9px] uppercase tracking-[0.25em] text-[#00aaff]">
          CONSOLE DO AZUL — digite um comando (help)
        </label>
        <div className="flex items-center gap-2">
          <span className="font-display shrink-0 text-lg text-[#00aaff]">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="scan, patch, block, mem, ps, sys…"
            spellCheck={false}
            autoComplete="off"
            className="min-h-[44px] w-full bg-transparent font-display text-lg text-[#e0ddd5] caret-[#00ff40] outline-none placeholder:text-[#8a877e]/50"
          />
          <button
            onClick={submit}
            className="min-h-[44px] shrink-0 border border-[#00aaff]/50 px-4 font-display text-base uppercase tracking-[0.12em] text-[#00aaff] transition-colors hover:bg-[#00aaff]/10"
          >
            EXEC
          </button>
        </div>
      </div>
    </section>
  )
}
