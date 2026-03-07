"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Bot, CalendarDays, CheckCircle2, Clock3, Flame, Sparkles, Star, Target, TrendingUp } from "lucide-react"

const SCORES = [
  { matiere: "Mathématiques", date: "Hier", note: 14.5, max: 20, color: "text-teal" },
  { matiere: "Physique-Chimie", date: "Il y a 3j", note: 12, max: 20, color: "text-blue" },
  { matiere: "Français", date: "La semaine passée", note: 16, max: 20, color: "text-rose" },
]

const RECENTS = [
  { title: "Maths BAC 2024 - Série C", meta: "Consulté hier · 6 pages", emoji: "📐", href: "/catalogue" },
  { title: "Physique BEPC 2023", meta: "Téléchargé il y a 3j", emoji: "⚗️", href: "/catalogue" },
  { title: "Français BAC 2024", meta: "Correction IA achetée", emoji: "📖", href: "/catalogue" },
]

const RECOS = [
  { title: "Révise les intégrales", desc: "Tu as raté 3 questions sur 4 récemment.", cta: "Voir les sujets", href: "/catalogue" },
  { title: "Plan examen blanc demain", desc: "2h Maths + 1h Physique avant de dormir.", cta: "Lancer la session", href: "/etudiant/examens" },
  { title: "Nouveau sujet publié", desc: "Philosophie BAC Série A est disponible.", cta: "Consulter", href: "/catalogue" },
]

const ACTIVITY = [
  { day: "L", val: 3 },
  { day: "M", val: 5 },
  { day: "M", val: 2 },
  { day: "J", val: 6 },
  { day: "V", val: 4 },
  { day: "S", val: 7 },
  { day: "D", val: 1 },
]

export default function EtudiantDashboardPage() {
  const [progress, setProgress] = useState(0)
  const [counters, setCounters] = useState({ sujets: 0, score: 0, streak: 0, exams: 0, credits: 0 })

  useEffect(() => {
    const target = { sujets: 24, score: 14.2, streak: 12, exams: 7, credits: 12, progress: 62 }
    const start = Date.now()
    const duration = 1300
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const e = 1 - (1 - p) ** 3
      setCounters({
        sujets: Math.floor(target.sujets * e),
        score: Math.round(target.score * e * 10) / 10,
        streak: Math.floor(target.streak * e),
        exams: Math.floor(target.exams * e),
        credits: Math.floor(target.credits * e),
      })
      setProgress(Math.floor(target.progress * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  const maxActivity = Math.max(...ACTIVITY.map((a) => a.val))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="glass p-8 rounded-[28px] border border-white/10 bg-gradient-to-br from-bg2 to-bg3/70">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal font-mono mb-2">Dashboard Étudiant</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Bonjour, prêt pour ta révision ?</h1>
            <p className="text-sm text-muted mt-3">BAC dans <span className="text-teal font-black">47 jours</span> · continue ton plan de préparation.</p>
          </div>
          <Link href="/catalogue" className="px-6 py-3 rounded-2xl bg-teal text-bg text-sm font-black inline-flex items-center gap-2">
            Explorer le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Sujets consultés", value: counters.sujets, icon: "📚", color: "text-teal" },
          { label: "Score moyen", value: `${counters.score}/20`, icon: "🏆", color: "text-gold" },
          { label: "Streak", value: `${counters.streak}j`, icon: "🔥", color: "text-rose" },
          { label: "Examens blancs", value: counters.exams, icon: "📝", color: "text-blue" },
          { label: "Crédits", value: counters.credits, icon: "💎", color: "text-teal" },
        ].map((stat) => (
          <div key={stat.label} className="glass p-5 rounded-[22px] border border-white/10">
            <div className="text-lg">{stat.icon}</div>
            <div className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.value}</div>
            <div className="text-[11px] text-muted font-mono uppercase mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass p-6 rounded-[24px] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black flex items-center gap-2"><Target className="w-4 h-4 text-teal" /> Préparation BAC 2025</h2>
            <span className="text-xl font-black text-teal">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-5">
            <div className="h-full bg-gradient-to-r from-teal to-green transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-3">
            {[
              { name: "Mathématiques", pct: 68, color: "bg-teal" },
              { name: "Physique-Chimie", pct: 55, color: "bg-blue" },
              { name: "Français", pct: 73, color: "bg-rose" },
              { name: "SVT", pct: 49, color: "bg-green" },
            ].map((m) => (
              <div key={m.name} className="grid grid-cols-[100px_1fr_36px] items-center gap-3">
                <span className="text-[11px] font-mono text-muted">{m.name}</span>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-[11px] font-mono text-muted">{m.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-[24px] border border-gold/20 bg-gold/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted font-mono">Compte à rebours</p>
          <div className="text-5xl font-black tracking-tighter text-gradient mt-2">47</div>
          <p className="text-xs text-muted">jours avant le BAC</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["🎓", "📐", "⚗️"].map((i) => (
              <div key={i} className="h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">{i}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="glass p-6 rounded-[24px] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black flex items-center gap-2"><Star className="w-4 h-4 text-gold" /> Derniers scores</h3>
              <Link href="/etudiant/sujets" className="text-[11px] text-teal font-mono">Voir tout</Link>
            </div>
            <div className="space-y-2">
              {SCORES.map((s) => (
                <div key={s.matiere} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <div className={`text-xs font-black w-[64px] ${s.color}`}>{s.note}/{s.max}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{s.matiere}</div>
                    <div className="text-[10px] text-muted font-mono">{s.date}</div>
                  </div>
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-teal" style={{ width: `${(s.note / s.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black flex items-center gap-2"><TrendingUp className="w-4 h-4 text-teal" /> Activité semaine</h3>
              <span className="text-[10px] text-muted font-mono uppercase">sujets / jour</span>
            </div>
            <div className="h-24 flex items-end gap-2">
              {ACTIVITY.map((a) => (
                <div key={a.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-teal/50 hover:bg-teal transition-all"
                    style={{ height: `${Math.max(10, (a.val / maxActivity) * 90)}px` }}
                    title={`${a.val} sujets`}
                  />
                  <span className="text-[10px] text-muted font-mono">{a.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black flex items-center gap-2"><Clock3 className="w-4 h-4 text-teal" /> Récents</h3>
              <Link href="/etudiant/sujets" className="text-[11px] text-teal font-mono">Tous mes sujets</Link>
            </div>
            <div className="space-y-2">
              {RECENTS.map((r) => (
                <Link key={r.title} href={r.href} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:border-teal/20">
                  <span className="text-xl">{r.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{r.title}</div>
                    <div className="text-[10px] text-muted font-mono">{r.meta}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-[24px] border border-teal/20 bg-gradient-to-br from-blue/10 to-teal/5">
            <h3 className="text-sm font-black flex items-center gap-2"><Bot className="w-4 h-4 text-teal" /> Recommandations IA</h3>
            <div className="space-y-2 mt-4">
              {RECOS.map((r) => (
                <Link key={r.title} href={r.href} className="block p-3 rounded-xl border border-white/10 bg-white/5 hover:border-teal/20">
                  <div className="text-sm font-bold">{r.title}</div>
                  <div className="text-xs text-muted mt-1">{r.desc}</div>
                  <div className="text-[10px] uppercase tracking-widest font-black text-teal mt-2">{r.cta}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-gold/20 bg-gold/5">
            <h3 className="text-sm font-black flex items-center gap-2"><Flame className="w-4 h-4 text-gold" /> Streak de révision</h3>
            <div className="text-5xl font-black tracking-tighter text-gold mt-3">{counters.streak}</div>
            <p className="text-xs text-muted">jours consécutifs</p>
            <div className="grid grid-cols-7 gap-1 mt-4">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <div key={d + i} className={`h-8 rounded-md text-[10px] font-mono flex items-center justify-center ${i < 5 ? "bg-gold/20 text-gold" : "bg-white/10 text-muted"}`}>
                  {i === 6 ? "🔥" : d}
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-white/10">
            <h3 className="text-sm font-black flex items-center gap-2"><CalendarDays className="w-4 h-4 text-teal" /> Juin 2025</h3>
            <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] font-mono text-muted">
              {["L", "M", "M", "J", "V", "S", "D"].map((d) => <div key={d} className="text-center">{d}</div>)}
              {Array.from({ length: 35 }).map((_, idx) => {
                const day = idx - 1
                const isToday = day === 24
                const isExam = [12, 18].includes(day)
                return (
                  <div
                    key={idx}
                    className={`h-7 rounded-md flex items-center justify-center ${day <= 0 ? "opacity-0" : ""} ${isToday ? "bg-teal text-bg" : isExam ? "bg-gold/20 text-gold" : "bg-white/5"}`}
                  >
                    {day > 0 ? day : ""}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="glass p-5 rounded-[20px] border border-white/10 flex flex-wrap items-center gap-3 text-xs">
        <CheckCircle2 className="w-4 h-4 text-green" />
        <span className="text-muted">Plan du jour recommandé:</span>
        <span className="font-bold">1 sujet Maths + 1 correction IA + 1 mini-examen</span>
        <Link href="/etudiant/examens" className="ml-auto text-teal font-black uppercase tracking-widest text-[10px]">Lancer maintenant</Link>
      </section>
    </div>
  )
}
