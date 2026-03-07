"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Calendar,
  FileText,
  Filter,
  Grid3X3,
  LayoutList,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"

type Sujet = {
  id: string
  typeExamen: string
  matiere: string
  serie?: string | null
  annee: number
  titre?: string | null
  prixCredits: number
  notemoyenne?: number | null
  pages?: number | null
  createdAt?: string
}

const examTypes = ["BAC", "BEPC", "CEPE", "Concours"]

function EtudiantSujetsPageContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [subjects, setSubjects] = useState<Sujet[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [activeType, setActiveType] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "price-asc" | "price-desc">("recent")
  const [visibleCount, setVisibleCount] = useState(12)

  useEffect(() => {
    const q = searchParams.get("q") || ""
    const types = searchParams.get("types")
    const rating = Number(searchParams.get("minRating") || "0")
    const sort = searchParams.get("sort")
    const view = searchParams.get("view")

    setSearch(q)
    setActiveType(types ? types.split(",").filter(Boolean) : [])
    setMinRating(Number.isFinite(rating) ? rating : 0)
    setSortBy(sort === "rating" || sort === "price-asc" || sort === "price-desc" ? sort : "recent")
    setViewMode(view === "list" ? "list" : "grid")
  }, [searchParams])

  useEffect(() => {
    async function fetchSujets() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (activeType.length === 1) params.append("typeExamen", activeType[0])
        const res = await fetch(`/api/sujets?${params.toString()}`)
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : [])
      } catch {
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchSujets()
  }, [activeType])

  const filtered = useMemo(() => {
    const base = subjects.filter((s) => {
      const hay = `${s.matiere} ${s.typeExamen} ${s.annee} ${s.serie || ""} ${s.titre || ""}`.toLowerCase()
      if (search.trim() && !hay.includes(search.trim().toLowerCase())) return false
      if ((s.notemoyenne || 0) < minRating) return false
      return true
    })

    const sorted = [...base]
    if (sortBy === "recent") sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    if (sortBy === "rating") sorted.sort((a, b) => (b.notemoyenne || 0) - (a.notemoyenne || 0))
    if (sortBy === "price-asc") sorted.sort((a, b) => a.prixCredits - b.prixCredits)
    if (sortBy === "price-desc") sorted.sort((a, b) => b.prixCredits - a.prixCredits)
    return sorted
  }, [subjects, search, minRating, sortBy])

  const visibleSubjects = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  useEffect(() => {
    setVisibleCount(12)
  }, [search, minRating, sortBy, activeType, viewMode])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set("q", search.trim())
    if (activeType.length) params.set("types", activeType.join(","))
    if (minRating > 0) params.set("minRating", String(minRating))
    if (sortBy !== "recent") params.set("sort", sortBy)
    if (viewMode !== "grid") params.set("view", viewMode)
    const next = params.toString()
    const current = searchParams.toString()
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [search, activeType, minRating, sortBy, viewMode, pathname, router, searchParams])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && visibleCount < filtered.length) {
          setVisibleCount((prev) => Math.min(prev + 12, filtered.length))
        }
      },
      { rootMargin: "200px" },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [visibleCount, filtered.length])

  const topMatiere = useMemo(() => {
    const counts = new Map<string, number>()
    filtered.forEach((s) => counts.set(s.matiere, (counts.get(s.matiere) || 0) + 1))
    let winner = "—"
    let max = 0
    counts.forEach((v, k) => {
      if (v > max) {
        max = v
        winner = k
      }
    })
    return winner
  }, [filtered])

  const toggleType = (t: string) => {
    setActiveType((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="glass p-8 rounded-[28px] border border-white/10 bg-gradient-to-br from-bg2 to-bg3/70">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal font-mono mb-2">Espace Étudiant</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Bibliothèque des sujets</h1>
            <p className="text-sm text-muted mt-3 max-w-2xl">
              Version premium du catalogue: recherche rapide, tri intelligent, filtres dynamiques et accès direct aux détails.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted font-mono">Résultats</div>
              <div className="text-2xl font-black text-teal mt-1">{filtered.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted font-mono">Matière top</div>
              <div className="text-sm font-black mt-2 truncate">{topMatiere}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-12 gap-5">
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-24 self-start">
          <div className="glass p-5 rounded-[24px] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted font-mono">Filtres</h3>
              <SlidersHorizontal className="w-4 h-4 text-muted" />
            </div>

            <div className="space-y-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Type d'examen</div>
                <div className="flex flex-wrap gap-2">
                  {examTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold ${
                        activeType.includes(t) ? "bg-teal/10 border-teal/30 text-teal" : "bg-white/5 border-white/10 text-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Note minimale</div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted mt-1">{minRating.toFixed(1)} / 5</div>
              </div>

              <button
                onClick={() => {
                  setActiveType([])
                  setMinRating(0)
                }}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-muted hover:text-white"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="glass p-5 rounded-[24px] border border-teal/20 bg-teal/5">
            <div className="flex items-center gap-2 text-sm font-black">
              <Sparkles className="w-4 h-4 text-teal" />
              Astuce IA
            </div>
            <p className="text-xs text-muted mt-2">Filtre d'abord par type d'examen puis trie par note pour accélérer ta révision.</p>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-teal" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Recherche par matière, année, série..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-bg2 border border-white/10 outline-none focus:border-teal/40 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-12 px-4 rounded-2xl bg-bg2 border border-white/10 text-sm"
              >
                <option value="recent">Plus récents</option>
                <option value="rating">Mieux notés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <div className="flex bg-bg2 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-teal/10 text-teal" : "text-muted"}`}
                  aria-label="Vue grille"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? "bg-teal/10 text-teal" : "text-muted"}`}
                  aria-label="Vue liste"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-56 rounded-[24px] bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass p-12 rounded-[24px] border border-white/10 text-center">
              <Filter className="w-8 h-8 text-muted mx-auto" />
              <h3 className="text-lg font-black mt-3">Aucun sujet trouvé</h3>
              <p className="text-sm text-muted mt-1">Ajuste tes filtres ou ta recherche.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {visibleSubjects.map((s) => (
                <article
                  key={s.id}
                  className={`glass rounded-[24px] border border-white/10 hover:border-teal/30 transition-all ${
                    viewMode === "grid" ? "p-5 flex flex-col" : "p-4 flex items-center gap-4"
                  }`}
                >
                  <div className={`${viewMode === "grid" ? "w-12 h-12 mb-4" : "w-14 h-14"} rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                    <span className="text-xl">{s.matiere.toLowerCase().includes("math") ? "📐" : s.matiere.toLowerCase().includes("phys") ? "⚗️" : "📝"}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 font-black uppercase tracking-widest">{s.typeExamen}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 font-black uppercase tracking-widest">{s.annee}</span>
                      {s.serie ? <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 font-black uppercase tracking-widest">{s.serie}</span> : null}
                    </div>
                    <h3 className="text-base font-black leading-tight">{s.titre || `${s.matiere} ${s.annee}`}</h3>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-muted font-mono">
                      <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> {s.notemoyenne ?? "N/A"}</span>
                      <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> {s.pages || 0}p</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {s.annee}</span>
                    </div>
                  </div>

                  <div className={`${viewMode === "grid" ? "mt-5 pt-4 border-t border-white/10" : "text-right"}`}>
                    <div className="text-sm font-black text-teal">{s.prixCredits} crédits</div>
                    <Link
                      href={`/etudiant/sujets/${s.id}`}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-teal hover:text-bg hover:border-teal"
                    >
                      Ouvrir
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && visibleCount < filtered.length && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filtered.length))}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-teal hover:text-bg hover:border-teal"
              >
                Charger plus
              </button>
            </div>
          )}
          <div ref={sentinelRef} />

          <section className="glass p-5 rounded-[20px] border border-white/10 flex flex-wrap items-center gap-3 text-xs">
            <TrendingUp className="w-4 h-4 text-teal" />
            <span className="text-muted">Conseil:</span>
            <span className="font-bold">Commence par les sujets à note haute et prix faible pour un gain rapide.</span>
            <Link href="/etudiant" className="ml-auto text-teal font-black uppercase tracking-widest text-[10px]">Retour dashboard</Link>
          </section>
        </main>
      </section>
    </div>
  )
}

export default function EtudiantSujetsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Chargement des sujets...</div>}>
      <EtudiantSujetsPageContent />
    </Suspense>
  )
}
