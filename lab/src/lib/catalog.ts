// Catálogo real de comandos (NEXO 620) — carregado de /data/catalogo.json
export interface CatalogEntry {
  id: string
  title: string
  cmd: string
  cat: string
  destructive: boolean
  risk: string
}

export interface Catalog {
  total: number
  categories: Record<string, number>
  commands: CatalogEntry[]
}

let cache: Catalog | null = null

export async function loadCatalog(): Promise<Catalog | null> {
  if (cache) return cache
  try {
    const res = await fetch('/data/catalogo.json')
    if (!res.ok) return null
    cache = (await res.json()) as Catalog
    return cache
  } catch {
    return null
  }
}
