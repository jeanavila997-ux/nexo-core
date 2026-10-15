import { useEffect, useMemo, useState } from 'react'
import { loadCatalog, type Catalog } from '@/lib/catalog'

export default function CatalogPanel() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<string>('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void loadCatalog().then(setCatalog)
  }, [])

  const results = useMemo(() => {
    if (!catalog) return []
    const q = query.trim().toLowerCase()
    return catalog.commands
      .filter(
        (c) =>
          (!cat || c.cat === cat) &&
          (!q ||
            c.title.toLowerCase().includes(q) ||
            c.cmd.toLowerCase().includes(q) ||
            c.id.includes(q)),
      )
      .slice(0, 40)
  }, [catalog, query, cat])

  if (!catalog) return null

  return (
    <section className="border border-[#1a1a1e] bg-[#111114]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a877e]">
          CATÁLOGO NEXO :: {catalog.total} comandos · {Object.keys(catalog.categories).length}{' '}
          categorias
        </span>
        <span className="font-display text-lg text-[#ffaa00]">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="border-t border-[#1a1a1e] px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="buscar comando… (ex: firewall, winget, docker)"
              spellCheck={false}
              className="min-h-[44px] flex-1 border border-[#1a1a1e] bg-[#0a0a0c] px-3 font-display text-base text-[#e0ddd5] outline-none placeholder:text-[#8a877e]/50 focus:border-[#00aaff]/50"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="min-h-[44px] border border-[#1a1a1e] bg-[#0a0a0c] px-3 font-display text-base text-[#c8c4ba] outline-none"
            >
              <option value="">todas as categorias</option>
              {Object.entries(catalog.categories).map(([name, n]) => (
                <option key={name} value={name}>
                  {name} ({n})
                </option>
              ))}
            </select>
          </div>

          <div className="scroll-slim mt-2 max-h-[280px] overflow-y-auto">
            {results.length === 0 && (
              <p className="py-3 text-center text-xs text-[#8a877e]">
                nenhum comando encontrado
              </p>
            )}
            {results.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-0.5 border-b border-[#1a1a1e]/60 py-1.5 last:border-0"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-base leading-tight text-[#e0ddd5]">
                    {c.title}
                    {c.destructive && (
                      <span className="ml-2 text-[#ff0040]" title="comando destrutivo">
                        ⚠
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.15em] text-[#8a877e]">
                    {c.cat}
                  </span>
                </div>
                <code className="font-display break-all text-sm text-[#6ecfff]">$ {c.cmd}</code>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#8a877e]/60">
            mostrando {results.length} de {catalog.total} — fonte: 127.xlsx · nexo-core
          </p>
        </div>
      )}
    </section>
  )
}
