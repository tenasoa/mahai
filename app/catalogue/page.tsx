'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type ViewMode = 'grid' | 'list'
type ExamenType = 'BAC' | 'BEPC' | 'CEPE'
type Difficulte = 'FACILE' | 'MOYEN' | 'DIFFICILE'
type Langue = 'FRANCAIS' | 'MALGACHE'
type Format = 'PDF' | 'INTERACTIF' | 'GRATUIT'

interface Subject {
  id: string
  titre: string
  exam: string
  year: string
  info: string
  rating: number
  reviews: number
  price: number | 'free'
  badge: 'gold' | 'ai' | 'free' | 'inter'
  glyph: string
  featured?: boolean
}

const mockSubjects: Subject[] = [
  { id: '1', titre: 'Algèbre & Fonctions — Session officielle', exam: 'BAC · Mathématiques', year: '2024', info: '18 pages · 3h · Difficile', rating: 4, reviews: 124, price: 15, badge: 'gold', glyph: '∑', featured: true },
  { id: '2', titre: 'Mécanique & Électricité', exam: 'BEPC · Physique-Chimie', year: '2023', info: '12 pages · 2h · Moyen', rating: 4, reviews: 87, price: 10, badge: 'ai', glyph: 'φ' },
  { id: '3', titre: 'Compréhension & Expression écrite', exam: 'CEPE · Français', year: '2022', info: '8 pages · 2h · Facile', rating: 5, reviews: 212, price: 'free', badge: 'free', glyph: '∂' },
  { id: '4', titre: 'Biologie Cellulaire & Génétique', exam: 'BAC · SVT', year: '2023', info: '16 pages · 3h · Difficile', rating: 4, reviews: 65, price: 20, badge: 'inter', glyph: 'Ω' },
  { id: '5', titre: 'Géographie de Madagascar', exam: 'BEPC · Histoire-Géo', year: '2022', info: '10 pages · 2h · Moyen', rating: 3, reviews: 43, price: 8, badge: 'ai', glyph: 'π' },
  { id: '6', titre: 'Dissertation & Argumentation', exam: 'BAC · Philosophie', year: '2024', info: '6 pages · 4h · Difficile', rating: 5, reviews: 98, price: 25, badge: 'gold', glyph: 'λ' },
]

export default function CataloguePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeFilters, setActiveFilters] = useState<string[]>(['BAC', 'Français', 'PDF'])
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [navBlur, setNavBlur] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLangues, setSelectedLangues] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedDifficultes, setSelectedDifficultes] = useState<string[]>([])

  useEffect(() => {
    const handleScroll = () => setNavBlur(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    setCurrentTheme(root.getAttribute('data-theme') || 'dark')
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', newTheme)
    root.classList.toggle('dark')
    setCurrentTheme(newTheme)
  }

  const toggleType = (type: string) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  const toggleLangue = (langue: string) => setSelectedLangues(prev => prev.includes(langue) ? prev.filter(l => l !== langue) : [...prev, langue])
  const toggleFormat = (format: string) => setSelectedFormats(prev => prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format])
  const toggleDifficulte = (diff: string) => setSelectedDifficultes(prev => prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    let animationId: number
    let currentPos = { ...cursorPos }
    const animate = () => {
      currentPos.x += (mousePos.x - currentPos.x) * 0.12
      currentPos.y += (mousePos.y - currentPos.y) * 0.12
      setCursorPos(currentPos)
      animationId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationId)
  }, [mousePos])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = window.innerWidth, H = window.innerHeight, particles: any[] = []
    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      particles = []
      for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.4 + 0.1), o: Math.random() * 0.4 + 0.1 })
    }
    window.addEventListener('resize', resize)
    resize()
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(201, 168, 76, ${p.o})`; ctx.fill(); p.x += p.vx; p.y += p.vy; if (p.y < -5) p.y = H + 5; if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5 })
      requestAnimationFrame(draw)
    }
    draw()
    return () => window.removeEventListener('resize', resize)
  }, [])

  const toggleFavorite = (id: string) => setFavorites(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  const removeFilter = (filter: string) => setActiveFilters(prev => prev.filter(f => f !== filter))
  const openPreview = (s: Subject) => { setCurrentSubject(s); setPreviewPage(1); setPreviewModalOpen(true) }
  const openBuy = (s: Subject) => { setCurrentSubject(s); setBuyModalOpen(true) }
  const confirmBuy = () => { setBuyModalOpen(false); setCurrentSubject(null) }
  const filteredSubjects = mockSubjects.filter(s => !searchQuery || s.titre.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      <style jsx global>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;overflow-x:hidden}
        body{font-family:var(--body);background:var(--void);color:var(--text);-webkit-font-smoothing:antialiased;transition:background 0.3s, color 0.3s}
        body::before{content:'';position:fixed;inset:0;z-index:9997;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--void)}::-webkit-scrollbar-thumb{background:var(--gold-lo);border-radius:2px}
        .sidebar-scroll::-webkit-scrollbar{width:2px}.sidebar-scroll::-webkit-scrollbar-track{background:var(--void)}.sidebar-scroll::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}.sidebar-scroll::-webkit-scrollbar-thumb:hover{background:var(--gold-line)}
        .filter-scroll::-webkit-scrollbar{width:2px}.filter-scroll::-webkit-scrollbar-track{background:var(--surface)}.filter-scroll::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}.filter-scroll::-webkit-scrollbar-thumb:hover{background:var(--gold-line)}
      `}</style>

      <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--void)' }}>
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300, background: navBlur ? 'var(--card)' : 'transparent', borderBottom: `1px solid ${navBlur ? 'var(--b1)' : 'transparent'}`, backdropFilter: navBlur ? 'blur(24px)' : 'none', transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease', boxShadow: navBlur ? '0 4px 24px rgba(0,0,0,0.1)' : 'none' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 1.5rem', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.3rem' }}>Mah<span style={{ width: 7, height: 7, background: 'linear-gradient(135deg, var(--gold-hi), var(--gold))', borderRadius: '50%', boxShadow: '0 0 10px var(--gold-glow)', animation: 'gp 3s ease-in-out infinite' }} />AI</Link>
            <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '.8rem', pointerEvents: 'none' }}>🔍</span>
              <input type="text" placeholder="Chercher un sujet, matière, année…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '.5rem 1rem .5rem 2.6rem', fontSize: '.82rem', fontFamily: 'var(--body)', color: 'var(--text)', outline: 'none', transition: 'border-color .2s' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 'var(--r)', padding: '.38rem .85rem', fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--gold)' }}><span>◆</span>1 200 cr</div>
              <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ fontFamily: 'var(--body)', fontSize: '.76rem', fontWeight: 500, padding: '.42rem 1rem', borderRadius: 'var(--r)', cursor: 'none', letterSpacing: '.03em', transition: 'all .2s', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--text-2)' }}>+ Recharger</button>
              <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={toggleTheme} style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', background: 'var(--surface)', border: '1px solid var(--b1)', color: 'var(--gold)', fontSize: '1.1rem', transition: 'all .2s' }}>{currentTheme === 'dark' ? '☀️' : '🌙'}</button>
              <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '.9rem', color: 'var(--gold)', cursor: 'none', background: 'linear-gradient(135deg, var(--gold-lo), var(--gold-dim))', border: '1px solid var(--gold-line)' }}>A</div>
            </div>
          </div>
        </nav>

        {/* PAGE LAYOUT */}
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 1.5rem 1.5rem 1.5rem', paddingTop: '78px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.75rem', alignItems: 'start' }}>
          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: '78px', height: 'fit-content' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', overflow: 'hidden', maxHeight: 'calc(100vh - 94px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'var(--surface)', padding: '.75rem 1.1rem', borderBottom: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.16em', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '.45rem' }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />Filtres</div>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'none', transition: 'opacity .2s' }}>Réinitialiser</button>
              </div>
              <div style={{ padding: '1.1rem', overflowY: 'auto', flex: 1 }}>
                {/* Type */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text-3)', marginBottom: '.65rem' }}>Type d'examen</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>{(['BAC', 'BEPC', 'CEPE'] as ExamenType[]).map((t) => <button key={t} onClick={() => toggleType(t)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.26rem .65rem', border: selectedTypes.includes(t) ? '1px solid transparent' : '1px solid var(--b1)', borderRadius: 2, background: selectedTypes.includes(t) ? 'linear-gradient(135deg, var(--gold), var(--gold-hi))' : 'transparent', color: selectedTypes.includes(t) ? 'var(--void)' : 'var(--text-3)', cursor: 'none', transition: 'all .15s' }}>{t}</button>)}</div>
                </div>
                {/* Difficulté */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text-3)', marginBottom: '.65rem' }}>Difficulté</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.35rem' }}>{([{ l: 'Facile', c: 'rgba(74,107,90,0.15)', t: '#6EAA8C', b: 'rgba(74,107,90,0.4)' }, { l: 'Moyen', c: 'rgba(201,168,76,0.1)', t: 'var(--gold)', b: 'var(--gold-line)' }, { l: 'Difficile', c: 'rgba(155,35,53,0.1)', t: '#E05575', b: 'rgba(155,35,53,0.3)' }] as const).map(d => <button key={d.l} onClick={() => toggleDifficulte(d.l as Difficulte)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ textAlign: 'center', fontSize: '.7rem', padding: '.35rem .25rem', border: selectedDifficultes.includes(d.l as Difficulte) ? '1px solid transparent' : '1px solid var(--b1)', borderRadius: 2, cursor: 'none', background: selectedDifficultes.includes(d.l as Difficulte) ? d.c : 'transparent', color: selectedDifficultes.includes(d.l as Difficulte) ? d.t : 'var(--text-3)', borderColor: selectedDifficultes.includes(d.l as Difficulte) ? d.b : 'var(--b1)', transition: 'all .15s', fontFamily: 'var(--body)' }}>{d.l}</button>)}</div>
                </div>
                {/* Année */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text-3)', marginBottom: '.65rem' }}>Année — <span style={{ color: 'var(--gold)' }}>2003 – 2024</span></div>
                  <div style={{ padding: '.25rem 0' }}><input type="range" min="2003" max="2024" defaultValue="2003" onChange={() => setIsHovering(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: '100%', height: 2, background: 'var(--b1)', borderRadius: 1, outline: 'none', cursor: 'none' }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)', marginTop: '.4rem' }}><span>2003</span><span>2024</span></div>
                </div>
                {/* Langue */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text-3)', marginBottom: '.65rem' }}>Langue</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>{(['FRANCAIS', 'MALGACHE'] as Langue[]).map((l) => <button key={l} onClick={() => toggleLangue(l)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.26rem .65rem', border: selectedLangues.includes(l) ? '1px solid transparent' : '1px solid var(--b1)', borderRadius: 2, background: selectedLangues.includes(l) ? 'var(--gold-dim)' : 'transparent', borderColor: selectedLangues.includes(l) ? 'var(--gold-line)' : 'var(--b1)', color: selectedLangues.includes(l) ? 'var(--gold)' : 'var(--text-3)', cursor: 'none', transition: 'all .15s' }}>{l === 'FRANCAIS' ? 'Français' : 'Malgache'}</button>)}</div>
                </div>
                {/* Format */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text-3)', marginBottom: '.65rem' }}>Format</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>{(['PDF', 'INTERACTIF', 'GRATUIT'] as Format[]).map((f) => <button key={f} onClick={() => toggleFormat(f)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.26rem .65rem', border: selectedFormats.includes(f) ? '1px solid transparent' : '1px solid var(--b1)', borderRadius: 2, background: selectedFormats.includes(f) ? 'var(--gold-dim)' : 'transparent', borderColor: selectedFormats.includes(f) ? 'var(--gold-line)' : 'var(--b1)', color: selectedFormats.includes(f) ? 'var(--gold)' : 'var(--text-3)', cursor: 'none', transition: 'all .15s' }}>{f === 'PDF' ? 'PDF' : f === 'INTERACTIF' ? 'Interactif' : 'Gratuit'}</button>)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <main style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.85rem', flexWrap: 'wrap', gap: '.65rem' }}><h1 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-.02em', color: 'var(--text)', lineHeight: 1 }}>Catalogue <em style={{ fontStyle: 'italic', color: 'var(--text-3)', fontSize: '.7em' }}>des sujets</em></h1></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>{activeFilters.map(f => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 2, padding: '.22rem .65rem', fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--gold)', letterSpacing: '.06em' }}>{f}<button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => removeFilter(f)} style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--gold-lo)', fontSize: '.7rem', padding: 0, lineHeight: 1, transition: 'color .15s' }}>✕</button></div>)}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.72rem', color: 'var(--text-3)', letterSpacing: '.06em' }}><strong style={{ color: 'var(--text)' }}>{filteredSubjects.length}</strong> sujets trouvés</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <select onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '.42rem .8rem', fontSize: '.78rem', fontFamily: 'var(--body)', color: 'var(--text-2)', outline: 'none', transition: 'border-color .2s', cursor: 'none' }}><option>Pertinence</option><option>Plus récents</option><option>Mieux notés</option><option>Prix croissant</option><option>Prix décroissant</option></select>
                <div style={{ display: 'flex', border: '1px solid var(--b1)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setViewMode('grid')} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === 'grid' ? 'var(--gold-dim)' : 'transparent', border: 'none', cursor: 'none', color: viewMode === 'grid' ? 'var(--gold)' : 'var(--text-3)', fontSize: '.85rem', transition: 'all .15s' }}>⊞</button>
                  <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setViewMode('list')} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === 'list' ? 'var(--gold-dim)' : 'transparent', border: 'none', cursor: 'none', color: viewMode === 'list' ? 'var(--gold)' : 'var(--text-3)', fontSize: '.85rem', transition: 'all .15s' }}>☰</button>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr', gap: '1.1rem' }}>
              {filteredSubjects.map(s => (
                <div key={s.id} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ background: s.featured ? 'linear-gradient(160deg, #0E1828 0%, var(--card) 70%)' : 'var(--card)', border: `1px solid ${s.featured ? 'var(--gold-line)' : 'var(--b1)'}`, borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'all .3s', position: 'relative' }}>
                  {s.featured && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />}
                  <div style={{ height: 130, background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 22px, var(--b3) 22px, var(--b3) 23px)' }} />
                    <div style={{ fontFamily: 'var(--display)', fontSize: '4.5rem', fontWeight: 300, color: 'var(--gold-lo)', position: 'relative', zIndex: 1, letterSpacing: '-.05em', lineHeight: 1 }}>{s.glyph}</div>
                    <div style={{ position: 'absolute', top: '.75rem', left: '.75rem', fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.12em', padding: '.2rem .55rem', borderRadius: 2, zIndex: 2, background: s.badge === 'gold' ? 'linear-gradient(135deg, var(--gold), var(--gold-hi))' : s.badge === 'ai' ? 'rgba(28,43,74,0.9)' : s.badge === 'free' ? 'rgba(74,107,90,0.9)' : 'rgba(155,35,53,0.85)', color: s.badge === 'gold' ? 'var(--void)' : s.badge === 'free' ? '#8ECAAC' : s.badge === 'inter' ? '#F5A0B0' : 'var(--gold)', border: s.badge !== 'gold' ? `1px solid ${s.badge === 'ai' ? 'var(--gold-line)' : s.badge === 'free' ? 'rgba(74,107,90,0.5)' : 'rgba(155,35,53,0.5)'}` : 'none' }}>{s.badge === 'gold' ? 'Premium' : s.badge === 'ai' ? '✦ IA' : s.badge === 'free' ? 'Gratuit' : 'Interactif'}</div>
                    <button onClick={() => toggleFavorite(s.id)} style={{ position: 'absolute', top: '.75rem', right: '.75rem', width: 28, height: 28, background: 'rgba(8,7,5,0.7)', border: '1px solid var(--b1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', fontSize: '.75rem', transition: 'all .2s', zIndex: 2 }}>{favorites.has(s.id) ? '♥' : '♡'}</button>
                  </div>
                  <div style={{ padding: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem' }}><span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--text-3)' }}>{s.exam}</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--gold)' }}>{s.year}</span></div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 500, color: 'var(--text)', letterSpacing: '-.01em', marginBottom: '.3rem', lineHeight: 1.3 }}>{s.titre}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-3)', fontFamily: 'var(--mono)', letterSpacing: '.04em', marginBottom: '.65rem' }}>{s.info}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}><div style={{ display: 'flex', gap: '2px' }}>{[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: '.65rem', color: i < s.rating ? 'var(--gold)' : 'var(--text-4)' }}>★</span>)}</div><span style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--text-3)' }}>({s.reviews})</span></div>
                  </div>
                  <div style={{ padding: '.85rem 1.1rem', borderTop: `1px solid var(--b3)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: s.price === 'free' ? 'var(--mono)' : 'var(--display)', fontSize: s.price === 'free' ? '.88rem' : '1.15rem', color: s.price === 'free' ? '#6EAA8C' : 'var(--gold)', fontWeight: s.price === 'free' ? 'normal' : 500, lineHeight: 1, letterSpacing: s.price === 'free' ? '.08em' : 'normal' }}>{s.price === 'free' ? 'Gratuit' : <>{s.price} <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--gold-lo)', fontWeight: 400, marginLeft: '.25rem' }}>cr</span></>}</div>
                    <div style={{ display: 'flex', gap: '.4rem' }}><button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => openPreview(s)} style={{ fontFamily: 'var(--body)', fontSize: '.7rem', fontWeight: 400, padding: '.35rem .75rem', borderRadius: 'var(--r)', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--text-2)', cursor: 'none', transition: 'all .18s' }}>Aperçu</button><button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => openBuy(s)} style={{ fontFamily: 'var(--body)', fontSize: '.7rem', fontWeight: 500, padding: '.35rem .85rem', borderRadius: 'var(--r)', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', border: 'none', cursor: 'none', transition: 'all .18s' }}>Acheter</button></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem', marginTop: '1.75rem' }}>
              <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--b1)', borderRadius: 'var(--r)', background: 'transparent', color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: '.72rem', cursor: 'none', transition: 'all .15s' }}>‹</button>
              {[1, 2, 3].map(p => <button key={p} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--b1)', borderRadius: 'var(--r)', background: p === 1 ? 'var(--gold-dim)' : 'transparent', borderColor: p === 1 ? 'var(--gold-line)' : 'var(--b1)', color: p === 1 ? 'var(--gold)' : 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: '.72rem', cursor: 'none', transition: 'all .15s' }}>{p}</button>)}
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--text-4)', padding: '0 .25rem' }}>…</span>
              <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--b1)', borderRadius: 'var(--r)', background: 'transparent', color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: '.72rem', cursor: 'none', transition: 'all .15s' }}>48</button>
              <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--b1)', borderRadius: 'var(--r)', background: 'transparent', color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: '.72rem', cursor: 'none', transition: 'all .15s' }}>›</button>
            </div>
          </main>
        </div>

        {/* PREVIEW MODAL */}
        {previewModalOpen && currentSubject && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', opacity: 1, pointerEvents: 'all', transition: 'opacity .3s', backdropFilter: 'blur(8px)' }} onClick={() => setPreviewModalOpen(false)}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '2rem', maxWidth: 680, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'mIn 0.35s ease both' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--text)', letterSpacing: '-.01em' }}>{currentSubject.titre}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.2rem', fontFamily: 'var(--mono)', letterSpacing: '.04em' }}>{currentSubject.exam} · {currentSubject.year}</div>
                </div>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPreviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text-3)', fontSize: '1.2rem', padding: '.25rem', transition: 'color .2s', flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--b3)', borderRadius: 'var(--r)', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ background: '#fff', width: 240, height: 300, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  <div style={{ height: 4, borderRadius: 1, background: '#C8C2B8', width: '70%' }} />
                  {[...Array(7)].map((_, i) => <div key={i} style={{ height: '2.5px', borderRadius: 1, background: '#E8E3DC', width: i % 2 === 0 ? '85%' : '55%' }} />)}
                </div>
                {previewPage > 4 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,7,5,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.65rem', backdropFilter: 'blur(4px)' }}><div style={{ fontSize: '2rem', opacity: 0.4 }}>🔒</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text-3)' }}>Achetez pour débloquer</div></div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPreviewPage(p => Math.max(1, p - 1))} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 2, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', color: 'var(--text-2)', transition: 'all .15s', fontSize: '.8rem' }}>‹</button>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--text-3)' }}>Page {previewPage} / 18</span>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPreviewPage(p => Math.min(18, p + 1))} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 2, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', color: 'var(--text-2)', transition: 'all .15s', fontSize: '.8rem' }}>›</button>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--b3)', borderRadius: 'var(--r)', padding: '.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.65rem' }}>
                <div style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>{currentSubject.info}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.75rem', color: 'var(--gold)' }}>{currentSubject.price === 'free' ? 'Gratuit' : `${currentSubject.price} cr`}</div>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => { setPreviewModalOpen(false); openBuy(currentSubject); }} style={{ flex: 1, fontFamily: 'var(--body)', fontSize: '.84rem', fontWeight: 500, padding: '.7rem 1.5rem', borderRadius: 'var(--r)', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', border: 'none', cursor: 'none', transition: 'all .2s', letterSpacing: '.03em' }}>Acheter — {currentSubject.price === 'free' ? 'Gratuit' : `${currentSubject.price} cr`}</button>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPreviewModalOpen(false)} style={{ fontFamily: 'var(--body)', fontSize: '.84rem', padding: '.7rem 1.25rem', borderRadius: 'var(--r)', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--text-2)', cursor: 'none', transition: 'all .2s' }}>Fermer</button>
              </div>
            </div>
          </div>
        )}

        {/* BUY MODAL */}
        {buyModalOpen && currentSubject && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', opacity: 1, pointerEvents: 'all', transition: 'opacity .3s', backdropFilter: 'blur(8px)' }} onClick={() => setBuyModalOpen(false)}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '2rem', maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'mIn 0.35s ease both' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--text)', letterSpacing: '-.01em' }}>Confirmer l'achat</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.2rem', fontFamily: 'var(--mono)', letterSpacing: '.04em' }}>{currentSubject.titre}</div>
                </div>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setBuyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text-3)', fontSize: '1.2rem', padding: '.25rem', transition: 'color .2s', flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}><span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Prix du sujet</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--gold)' }}>{currentSubject.price === 'free' ? 'Gratuit' : `${currentSubject.price} cr`}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}><span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Votre solde actuel</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--text)' }}>1 200 cr</span></div>
                <div style={{ height: 1, background: 'var(--b1)', margin: '.75rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text)' }}>Solde après achat</span><span style={{ fontFamily: 'var(--display)', fontSize: '1.25rem', color: 'var(--gold)' }}>{currentSubject.price === 'free' ? '1 200 cr' : `${1200 - (currentSubject.price as number)} cr`}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={confirmBuy} style={{ flex: 1, fontFamily: 'var(--body)', fontSize: '.84rem', fontWeight: 500, padding: '.7rem 1.5rem', borderRadius: 'var(--r)', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', border: 'none', cursor: 'none', transition: 'all .2s', letterSpacing: '.03em' }}>Confirmer l'achat</button>
                <button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setBuyModalOpen(false)} style={{ fontFamily: 'var(--body)', fontSize: '.84rem', padding: '.7rem 1.25rem', borderRadius: 'var(--r)', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--text-2)', cursor: 'none', transition: 'all .2s' }}>Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`@keyframes gp{0%,100%{box-shadow:0 0 8px var(--gold-glow)}50%{box-shadow:0 0 20px rgba(201,168,76,0.4)}}@keyframes mIn{from{opacity:0;transform:scale(0.96) translateY(16px)}to{opacity:1;transform:none}}`}</style>
    </>
  )
}
