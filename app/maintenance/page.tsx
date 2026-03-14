'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type VariantKey = 'maintenance' | 'overload' | 'scheduled'

export default function MaintenancePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [totalSeconds, setTotalSeconds] = useState(37 * 60)
  const [currentVariant, setCurrentVariant] = useState<VariantKey>('maintenance')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const variants = {
    maintenance: { code: '503', label: 'MAINTENANCE', title: 'Mise à jour <em>en cours</em>', sub: 'Mah.AI procède à une maintenance planifiée pour améliorer votre expérience. Le service sera rétabli très bientôt.', progress: 'Mise à jour de la base de données…' },
    overload: { code: '503', label: 'SURCHARGE', title: 'Serveur <em>surchargé</em>', sub: 'Mah.AI connaît un trafic inhabituel en ce moment. Nos équipes travaillent à augmenter la capacité. Veuillez réessayer dans quelques minutes.', progress: 'Redimensionnement des serveurs…' },
    scheduled: { code: '🛠', label: 'PLANIFIÉE', title: 'Maintenance <em>planifiée</em>', sub: 'Une maintenance planifiée est en cours ce soir de 22h à 02h. Vos données et crédits sont intacts. Le service reprend automatiquement.', progress: 'Optimisation des performances…' },
  }

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
    const timer = setInterval(() => setTotalSeconds(prev => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = window.innerWidth, H = window.innerHeight, particles: any[] = []
    const resize = () => {
      W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; particles = []
      for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + .5, vx: (Math.random() - .5) * .3, vy: -(Math.random() * .4 + .1), o: Math.random() * .4 + .1 })
    }
    window.addEventListener('resize', resize); resize()
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const isDark = document.documentElement.classList.contains('dark')
      const gold = isDark ? '201, 168, 76' : '168, 134, 58'
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${gold}, ${p.o})`; ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.y < -5) p.y = H + 5; if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5
      })
      requestAnimationFrame(draw)
    }
    draw()
    return () => window.removeEventListener('resize', resize)
  }, [])

  const formatTime = (total: number) => {
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60
    return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') }
  }

  const time = formatTime(totalSeconds)
  const variant = variants[currentVariant]

  return (
    <>
      <style jsx global>{`
        :root {
          --void:#F8F4EE; --depth:#F2EDE4; --surface:#EDE6DA; --card:#FFFFFF; --lift:#EDE6DA;
          --gold:#A8863A; --gold-hi:#C9A84C; --gold-lo:#D4B87A; --gold-dim:rgba(168,134,58,.08); --gold-line:rgba(168,134,58,.28); --gold-glow:rgba(168,134,58,.15);
          --text:#1A1714; --text-2:rgba(26,23,20,.65); --text-3:rgba(26,23,20,.38); --text-4:rgba(26,23,20,.16);
          --amber:#C9843C; --amber-dim:rgba(201,132,60,.10); --amber-line:rgba(201,132,60,.22);
          --b1:rgba(26,23,20,.10); --b2:rgba(26,23,20,.06); --b3:rgba(26,23,20,.04);
          --cursor-blend: multiply;
          --display: 'Cormorant Garamond', serif;
          --body: 'Outfit', sans-serif;
          --mono: 'DM Mono', monospace;
        }
        .dark {
          --void:#080705; --depth:#0E0C0A; --surface:#141210; --card:#1A1714;
          --gold:#C9A84C; --gold-hi:#E8C96A; --gold-lo:#8A6E2A; --gold-dim:rgba(201,168,76,.08); --gold-line:rgba(201,168,76,.22); --gold-glow:rgba(201,168,76,.18);
          --text:#F0EBE3; --text-2:rgba(240,235,227,.62); --text-3:rgba(240,235,227,.32); --text-4:rgba(240,235,227,.14);
          --amber:#C9843C; --amber-dim:rgba(201,132,60,.12); --amber-line:rgba(201,132,60,.28);
          --b1:rgba(201,168,76,.14); --b2:rgba(201,168,76,.08); --b3:rgba(240,235,227,.06);
          --cursor-blend: screen;
        }
        body { cursor: none !important; overflow: hidden; background: var(--void); color: var(--text); font-family: var(--body); }
        * { cursor: none !important; outline: none !important; border: none !important; box-shadow: none !important; }
        
        .code-num {
          font-family: var(--display);
          font-size: clamp(5rem, 16vw, 9rem);
          font-weight: 300;
          color: transparent;
          -webkit-text-stroke: 1px rgba(201,168,76,0.3);
          letter-spacing: -0.06em;
          line-height: 1;
          position: relative;
          user-select: none;
        }
        .code-num::before, .code-num::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          font-family: var(--display);
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          line-height: inherit;
        }
        .glitch::before { color: var(--gold); -webkit-text-stroke: 0; opacity: 0.3; animation: glitchAnim 3s ease-in-out infinite; }
        
        .tool-icon {
          display: inline-block;
          animation: workAnim 2s ease-in-out infinite;
        }

        @keyframes workAnim {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(20deg); }
        }

        @keyframes glitchAnim {
          0%, 90%, 100% { transform: none; opacity: 0.3; }
          91% { transform: translateX(-3px); opacity: 0.6; }
          92% { transform: translateX(3px); opacity: 0.4; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        @keyframes gp { 0%, 100% { box-shadow: 0 0 8px var(--gold-glow); } 50% { box-shadow: 0 0 24px rgba(201,168,76,0.5); } }
        @keyframes progressAnim { 0% { width: 62% } 50% { width: 85% } 100% { width: 62% } }
      `}</style>

      <div className="fixed inset-0 bg-void transition-colors duration-500 overflow-hidden">
        <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
        <div className="fixed inset-0 z-[1] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--b3) 1px, transparent 1px), linear-gradient(90deg, var(--b3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="fixed inset-0 z-[2] pointer-events-none opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <div className="fixed w-2 h-2 bg-gold rounded-full z-[9999] pointer-events-none" style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)', mixBlendMode: 'var(--cursor-blend)' as any }} />
        <div className="fixed w-9 h-9 border border-gold/40 rounded-full z-[9998] pointer-events-none transition-all duration-350" style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center animate-[fadeUp_0.7s_ease_both]">
          <div style={{ marginBottom: '2.5rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Mah<span style={{ width: '9px', height: '9px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 12px var(--gold-glow)', animation: 'gp 3s ease-in-out infinite' }} />AI
            </Link>
          </div>

          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.75rem' }}>
            <div className={`code-num glitch`} data-text={variant.code}>
              <span className={variant.code === '🛠' ? 'tool-icon' : ''}>{variant.code}</span>
            </div>
            <span style={{ position: 'absolute', bottom: '-0.25rem', right: '-0.5rem', fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--amber)', background: 'var(--amber-dim)', border: '1px solid var(--amber-line)', padding: '0.2rem 0.65rem', borderRadius: '2px' }}>
              {variant.label}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.75rem' }} dangerouslySetInnerHTML={{ __html: variant.title }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.85, marginBottom: '2rem', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }} dangerouslySetInnerHTML={{ __html: variant.sub }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '8px', padding: '1rem 1.75rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{time.h}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-4)', marginTop: '0.2rem' }}>Heures</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'var(--b1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--amber)', letterSpacing: '-0.04em', lineHeight: 1 }}>{time.m}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-4)', marginTop: '0.2rem' }}>Minutes</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'var(--b1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{time.s}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-4)', marginTop: '0.2rem' }}>Secondes</div>
            </div>
          </div>

          <div style={{ maxWidth: '380px', margin: '0 auto 2rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
              <span>{variant.progress}</span>
              <span>~73%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--b2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--amber))', borderRadius: '3px', animation: 'progressAnim 4s ease-in-out infinite', width: '73%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxWidth: '320px', margin: '0 auto 2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-2)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', shrink: 0 }} />Serveurs en ligne · Trafic redirigé</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-2)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', shrink: 0 }} />Sauvegardes complètes · Données sécurisées</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-2)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)', animation: 'blink 1.5s ease-in-out infinite', shrink: 0 }} />Migration base de données en cours</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-2)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--b2)', border: '1px solid var(--b1)', shrink: 0 }} />Déploiement · En attente</div>
          </div>

          <div style={{ maxWidth: '340px', margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
            <input type="email" placeholder="votre@email.com" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: '4px', padding: '0.55rem 0.85rem', fontFamily: 'var(--body)', fontSize: '0.82rem', color: 'var(--text)', outline: 'none' }} value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
            <button onClick={() => { setIsSubscribed(true); setTimeout(() => setIsSubscribed(false), 3000) }} style={{ fontFamily: 'var(--body)', fontSize: '0.8rem', fontWeight: 500, padding: '0.55rem 1rem', borderRadius: '4px', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: '#fff', border: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{isSubscribed ? '✓ Inscrit !' : 'Me notifier'}</button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/auth/login" style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-4)', textDecoration: 'none' }}>Connexion</Link>
            <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-4)', textDecoration: 'none' }}>Accueil</Link>
            <button onClick={() => alert('Support: support@mah.ai')} style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-4)', textDecoration: 'none', background: 'none', border: 'none' }}>Support</button>
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '0.4rem', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '8px', padding: '0.35rem', backdropFilter: 'blur(12px)' }}>
          {(['maintenance', 'overload', 'scheduled'] as VariantKey[]).map(key => (
            <button key={key} onClick={() => setCurrentVariant(key)} style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.28rem 0.75rem', borderRadius: '4px', border: '1px solid transparent', background: currentVariant === key ? 'var(--amber)' : 'transparent', color: currentVariant === key ? '#fff' : 'var(--text-3)', transition: 'all 0.2s' }}>{key === 'maintenance' ? '503 Main.' : key === 'overload' ? '503 Sur.' : 'Planifiée'}</button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  )
}
