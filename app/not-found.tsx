'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type VariantKey = '404' | '403' | '500' | 'session'

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentVariant, setCurrentVariant] = useState<VariantKey>('404')
  const [searchQuery, setSearchInput] = useState('')

  const variants = {
    '404': { code: '404', errCode: 'PAGE_NOT_FOUND', title: "Cette page n'existe <em>pas encore</em>", sub: "Le sujet que vous cherchez a peut-être été déplacé, supprimé ou n'a jamais existé. L'IA a cherché partout — sans succès." },
    '403': { code: '403', errCode: 'ACCESS_FORBIDDEN', title: "Accès <em>refusé</em>", sub: "Ce contenu est réservé aux abonnés Premium. Rechargez vos crédits pour y accéder." },
    '500': { code: '500', errCode: 'SERVER_ERROR', title: "Erreur <em>inattendue</em>", sub: "Nos serveurs rencontrent un problème temporaire. L'équipe a été notifiée automatiquement." },
    'session': { code: '⏳', errCode: 'SESSION_EXPIRED', title: "Session <em>expirée</em>", sub: "Votre session a expiré pour des raisons de sécurité. Reconnectez-vous pour continuer." }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = window.innerWidth, H = window.innerHeight, pts: any[] = []
    let mousePos = { x: W / 2, y: H / 2 }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      pts = []
      for (let i = 0; i < 90; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
          a: Math.random()
        })
      }
    }

    window.addEventListener('resize', resize)
    resize()

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const isDark = document.documentElement.classList.contains('dark')
      const gold = isDark ? '201, 168, 76' : '168, 120, 42'

      pts.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        const d = Math.hypot(p.x - mousePos.x, p.y - mousePos.y)
        const alpha = d < 200 ? p.a * (1 - d / 200) * 0.6 : p.a * 0.12

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${gold}, ${alpha})`
        ctx.fill()
      })

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 90) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(${gold}, ${(1 - d / 90) * 0.04})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const variant = variants[currentVariant]

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/catalogue?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --void:#F8F4EE; --depth:#F2EDE4; --surface:#EDE6DA; --card:#FFFFFF; --lift:#EDE6DA;
          --gold:#A8782A; --gold-hi:#C9A84C; --gold-lo:#D4A855;
          --gold-dim:rgba(168,120,42,.08); --gold-glow:rgba(168,120,42,.12); --gold-line:rgba(168,120,42,.25);
          --text:#1A1714; --text-2:rgba(26,23,20,.62); --text-3:rgba(26,23,20,.38); --text-4:rgba(26,23,20,.15);
          --ruby:#9B2335; --b1:rgba(26,23,20,.1); --b2:rgba(26,23,20,.07); --b3:rgba(26,23,20,.04);
          --cursor-blend: multiply; --noise-op: 0.018;
          --nav-bg: rgba(248,244,238,.85);
          --display: 'Cormorant Garamond', serif;
          --body: 'Outfit', sans-serif;
          --mono: 'DM Mono', monospace;
        }
        .dark {
          --void:#080705; --depth:#0E0C0A; --surface:#141210; --card:#1A1714; --lift:#252118;
          --gold:#C9A84C; --gold-hi:#E8C96A; --gold-lo:#8A6E2A;
          --gold-dim:rgba(201,168,76,.08); --gold-glow:rgba(201,168,76,.18); --gold-line:rgba(201,168,76,.22);
          --text:#F0EBE3; --text-2:rgba(240,235,227,.62); --text-3:rgba(240,235,227,.32); --text-4:rgba(240,235,227,.1);
          --b1:rgba(201,168,76,.14); --b2:rgba(201,168,76,.08); --b3:rgba(240,235,227,.06);
          --cursor-blend: screen; --noise-op: 0.04;
          --nav-bg: rgba(8,7,5,.7);
        }
        body { cursor: none !important; overflow-x: hidden; overflow-y: auto; background: var(--void); color: var(--text); font-family: var(--body); }

        .four-text {
          font-family: var(--display);
          font-size: clamp(6rem, 18vw, 14rem);
          font-weight: 300;
          letter-spacing: -0.06em;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px var(--gold-line);
          position: relative;
          z-index: 1;
          animation: glitch 6s ease-in-out infinite;
        }
        .four-text::before, .four-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          font-family: var(--display);
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          line-height: inherit;
        }
        .four-text::before { color: var(--gold-lo); -webkit-text-stroke: 0; opacity: 0.35; animation: gb1 6s ease-in-out infinite; }
        .four-text::after { color: var(--ruby); -webkit-text-stroke: 0; opacity: 0.2; animation: gb2 6s ease-in-out infinite; }

        .sand-icon { display: inline-block; animation: flipSand 4s ease-in-out infinite; }

        @keyframes flipSand { 0%, 80% { transform: rotate(0); } 90%, 100% { transform: rotate(180deg); } }
        @keyframes glitch { 0%, 90%, 100% { transform: none; } 91% { transform: skewX(-2deg) translateX(3px); } 92% { transform: skewX(1deg) translateX(-3px); } 93% { transform: none; } }
        @keyframes gb1 { 0%, 90%, 100% { transform: none; clip-path: none; } 91% { transform: translateX(-4px); clip-path: inset(20% 0 60% 0); } 92% { transform: translateX(3px); clip-path: inset(60% 0 10% 0); } 93% { transform: none; clip-path: none; } }
        @keyframes gb2 { 0%, 90%, 100% { transform: none; clip-path: none; } 91% { transform: translateX(5px); clip-path: inset(40% 0 30% 0); } 92% { transform: translateX(-2px); clip-path: inset(10% 0 70% 0); } 93% { transform: none; clip-path: none; } }
        @keyframes gp { 0%, 100% { box-shadow: 0 0 8px var(--gold-glow); } 50% { box-shadow: 0 0 20px rgba(168,120,42,0.4); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="relative min-h-screen bg-void transition-colors duration-500">
        <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none opacity-35" />
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[var(--noise-op)]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <nav className="fixed top-0 left-0 right-0 z-[300] border-b border-b1 backdrop-blur-xl" style={{ backgroundColor: 'var(--nav-bg)' }}>
          <div className="max-w-[1200px] mx-auto px-6 h-[62px] flex items-center">
            <Link href="/" style={{ color: 'var(--text)', textDecoration: 'none', fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Mah<span style={{ width: '7px', height: '7px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 10px var(--gold-glow)', animation: 'gp 3s ease-in-out infinite' }} />AI
            </Link>
          </div>
        </nav>

        <div className="relative z-[2] flex flex-col items-center justify-center py-20 px-8 text-center min-h-screen">
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div className="four-text" data-text={variant.code}>
              <span className={variant.code === '⏳' ? 'sand-icon' : ''}>{variant.code}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', justifyContent: 'center', marginBottom: '1.25rem', width: '100%' }}>
            <div style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold-line))' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.8rem', animation: 'spin 8s linear infinite' }}>✦</span>
            <div style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'linear-gradient(90deg, var(--gold-line), transparent)' }} />
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: '2px', padding: '0.22rem 0.65rem', display: 'inline-block', marginBottom: '0.85rem' }}>
            ERREUR · {variant.errCode}
          </div>

          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.4rem, 4vw, 2.4rem)', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.65rem', lineHeight: 1.2 }} dangerouslySetInnerHTML={{ __html: variant.title }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.75, maxWidth: '480px', margin: '0 auto 2.5rem' }} dangerouslySetInnerHTML={{ __html: variant.sub }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {[
              { label: 'Accueil', icon: '🏠', href: '/' },
              { label: 'Catalogue', icon: '📚', href: '/catalogue' },
              { label: 'Mon dashboard', icon: '📊', href: '/dashboard' },
              { label: 'Se connecter', icon: '🔑', href: '/auth/login' }
            ].map((link) => (
              <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '8px', padding: '0.65rem 1.1rem', fontSize: '0.8rem', color: 'var(--text-2)', textDecoration: 'none', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '0.95rem' }}>{link.icon}</span> {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, maxWidth: '440px', width: '100%', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Rechercher un sujet, matière, niveau…"
              style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '4px 0 0 4px', padding: '0.7rem 1rem', fontFamily: 'var(--body)', fontSize: '0.85rem', color: 'var(--text)', outline: 'none' }}
              value={searchQuery}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              style={{ background: 'var(--gold)', color: 'var(--void)', border: 'none', padding: '0.7rem 1.1rem', borderRadius: '0 4px 4px 0', fontFamily: 'var(--body)', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap' }}
            >Rechercher →</button>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: '2rem', display: 'flex', gap: '0.5rem', zIndex: 10, width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }}>
          {(['404', '403', '500', 'session'] as VariantKey[]).map(k => (
            <button
              key={k}
              onClick={() => setCurrentVariant(k)}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.32rem 0.75rem', borderRadius: '2px', border: '1px solid var(--b1)', background: currentVariant === k ? 'var(--gold-dim)' : 'var(--surface)', color: currentVariant === k ? 'var(--gold)' : 'var(--text-3)', transition: 'all 0.2s' }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
