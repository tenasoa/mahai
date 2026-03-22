'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, ArrowLeft, GraduationCap, PenTool, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [selectedMats, setSelectedMats] = useState<string[]>(['Mathématiques', 'Physique-Chimie'])
  const [selectedLevel, setSelectedLevel] = useState('Lycée Série C')
  const [selectedObj, setSelectedObj] = useState('Réussir le BAC')
  const [userName, setUserName] = useState('Étudiant')

  const totalSteps = 4

  const next = () => {
    if (step < totalSteps) setStep((prev) => (prev + 1) as Step)
  }

  const prev = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step)
  }

  const toggleMat = (mat: string) => {
    setSelectedMats(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    )
  }

  const finish = () => {
    router.push('/dashboard')
  }

  return (
    <div className="ob-wrap fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-void/80 backdrop-blur-xl">
      {/* Background Orbs */}
      <div className="orb orb-1 opacity-20"></div>
      <div className="orb orb-2 opacity-10"></div>

      {/* Progress Dots */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s}
            className={`h-2 rounded-full transition-all duration-500 ${
              s < step ? 'w-2 bg-gold shadow-[0_0_10px_var(--gold-glow)]' : 
              s === step ? 'w-6 bg-gold shadow-[0_0_8px_var(--gold-glow)]' : 
              'w-2 bg-gold-dim border border-gold-line'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="ob-card w-full max-w-[640px] bg-card border border-gold-line rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        <div className="p-10">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="text-center animate-in slide-in-from-right-10 duration-500">
              <div className="welcome-gem w-16 h-16 rounded-full bg-gradient-to-br from-gold-hi to-gold flex items-center justify-center text-2xl mb-6 mx-auto shadow-[0_0_40px_var(--gold-glow)] animate-pulse">
                ✦
              </div>
              <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center justify-center gap-4 mb-4">
                <span className="h-px w-10 bg-gold-line"></span>
                MahAI · Bienvenue
                <span className="h-px w-10 bg-gold-line"></span>
              </div>
              <h1 className="font-display text-4xl mb-4 leading-tight">
                Bonjour,<br /><em className="italic text-gold">{userName}</em> !
              </h1>
              <p className="text-sm text-text-2 leading-relaxed max-w-[420px] mx-auto mb-8">
                Votre compte est créé. Personnalisez votre expérience pour accéder aux meilleurs sujets d'examen malgaches.
              </p>
              
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-4 p-4 bg-surface border border-b2 rounded-xl text-left">
                  <div className="w-9 h-9 bg-gold-dim rounded-lg flex items-center justify-center">🎯</div>
                  <div>
                    <div className="text-sm font-medium">Catalogue personnalisé</div>
                    <div className="text-xs text-text-3">Sujets recommandés selon votre filière</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-surface border border-b2 rounded-xl text-left">
                  <div className="w-9 h-9 bg-sage-dim rounded-lg flex items-center justify-center">🤖</div>
                  <div>
                    <div className="text-sm font-medium">Correction IA instantanée</div>
                    <div className="text-xs text-text-3">Feedback détaillé en quelques secondes</div>
                  </div>
                </div>
              </div>

              <div className="bg-gold-dim border border-gold-line rounded-lg p-3 flex items-center gap-3">
                <span className="font-mono text-[10px] text-gold uppercase px-2 py-1 bg-gold/10 rounded">🎁 Bonus</span>
                <span className="text-xs text-text-2">10 crédits offerts pour votre première connexion</span>
              </div>
            </div>
          )}

          {/* STEP 2: Matières */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-10 duration-500">
              <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center gap-4 mb-3">
                Étape 1 · Matières
              </div>
              <h2 className="font-display text-3xl mb-2">Vos <em className="italic text-gold">matières</em></h2>
              <p className="text-xs text-text-3 mb-6">Sélectionnez au moins 2 matières pour personnaliser votre catalogue.</p>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                {['Mathématiques', 'Physique-Chimie', 'SVT', 'Français', 'Histoire-Géo', 'Anglais', 'Informatique', 'Économie', 'Autre'].map((mat) => (
                  <button 
                    key={mat}
                    onClick={() => toggleMat(mat)}
                    className={`p-3 rounded-lg border transition-all text-center cursor-none ${
                      selectedMats.includes(mat) 
                        ? 'border-gold bg-gold-dim text-gold shadow-[0_0_0_2px_var(--gold-dim)]' 
                        : 'border-b2 bg-surface hover:border-gold-line'
                    }`}
                  >
                    <div className="text-xl mb-1">{mat === 'Mathématiques' ? '📐' : mat === 'Physique-Chimie' ? '⚗️' : mat === 'SVT' ? '🌿' : mat === 'Français' ? '📚' : mat === 'Histoire-Géo' ? '🌍' : mat === 'Anglais' ? '🌐' : mat === 'Informatique' ? '💻' : mat === 'Économie' ? '💰' : '🎨'}</div>
                    <div className="text-[10px] font-medium truncate">{mat}</div>
                  </button>
                ))}
              </div>
              <div className="text-center font-mono text-[10px] text-text-4 uppercase tracking-wider">
                {selectedMats.length} matière{selectedMats.length > 1 ? 's' : ''} sélectionnée{selectedMats.length > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* STEP 3: Niveau */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-10 duration-500">
              <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center gap-4 mb-3">
                Étape 2 · Profil scolaire
              </div>
              <h2 className="font-display text-3xl mb-2">Votre <em className="italic text-gold">niveau</em></h2>
              <p className="text-xs text-text-3 mb-6">Pour vous proposer des sujets adaptés à votre parcours.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { id: 'bepc', name: 'Collège (BEPC)', desc: '3ème · Préparation au BEPC', icon: '📗' },
                  { id: 'bac-c', name: 'Lycée Série C', desc: 'Terminale · BAC Scientifique', icon: '📘' },
                  { id: 'bac-ad', name: 'Lycée Série A/D', desc: 'Terminale · BAC Littéraire/D', icon: '📙' },
                  { id: 'sup', name: 'Supérieur', desc: 'Université · Grandes écoles', icon: '🎓' }
                ].map((lvl) => (
                  <button 
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.name)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-none ${
                      selectedLevel === lvl.name 
                        ? 'border-gold bg-gold-dim shadow-[0_0_0_2px_var(--gold-dim)]' 
                        : 'border-b2 bg-surface hover:border-gold-line'
                    }`}
                  >
                    <div className="text-2xl mb-2">{lvl.icon}</div>
                    <div className={`text-sm font-medium ${selectedLevel === lvl.name ? 'text-gold' : ''}`}>{lvl.name}</div>
                    <div className="text-[10px] text-text-3">{lvl.desc}</div>
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-mono uppercase text-text-4 tracking-widest mb-3">Mon objectif principal</div>
              <div className="flex flex-wrap gap-2">
                {['Réussir le BAC', 'Améliorer mes notes', "Concours d'entrée", 'Révision continue'].map(obj => (
                  <button 
                    key={obj}
                    onClick={() => setSelectedObj(obj)}
                    className={`px-4 py-2 border rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-none ${
                      selectedObj === obj 
                        ? 'border-gold bg-gold-dim text-gold' 
                        : 'border-b2 bg-transparent text-text-3 hover:text-text-2 hover:border-gold-line'
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Ready */}
          {step === 4 && (
            <div className="text-center animate-in slide-in-from-right-10 duration-500">
              <div className="w-16 h-16 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center text-2xl mb-6 mx-auto animate-pop-in">
                ✓
              </div>
              <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center justify-center gap-4 mb-4">
                Profil configuré
              </div>
              <h1 className="font-display text-4xl mb-6 leading-tight">
                Vous êtes <em className="italic text-gold">prêt·e</em> !
              </h1>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="p-4 bg-surface border border-b2 rounded-xl">
                  <div className="font-display text-2xl text-gold">2 840</div>
                  <div className="text-[8px] font-mono uppercase text-text-4 tracking-widest mt-1">Sujets</div>
                </div>
                <div className="p-4 bg-surface border border-b2 rounded-xl">
                  <div className="font-display text-2xl text-gold">10</div>
                  <div className="text-[8px] font-mono uppercase text-text-4 tracking-widest mt-1">Crédits</div>
                </div>
                <div className="p-4 bg-surface border border-b2 rounded-xl">
                  <div className="font-display text-2xl text-gold">∞</div>
                  <div className="text-[8px] font-mono uppercase text-text-4 tracking-widest mt-1">IA</div>
                </div>
              </div>

              <div className="bg-gold-dim border border-gold-line rounded-xl p-5 text-left mb-8">
                <div className="text-[9px] font-mono text-gold uppercase tracking-[0.2em] mb-3">✦ Votre profil</div>
                <div className="text-sm text-text-2 space-y-2">
                  <p>Niveau : <span className="text-text font-medium">{selectedLevel}</span></p>
                  <p>Matières : <span className="text-text font-medium">{selectedMats.slice(0, 2).join(', ')}...</span></p>
                  <p>Objectif : <span className="text-text font-medium">{selectedObj}</span></p>
                </div>
              </div>

              <button 
                onClick={finish}
                className="w-full py-4 rounded-xl bg-gradient-to-br from-gold to-gold-hi text-void font-medium text-lg shadow-[0_4px_24px_rgba(201,168,76,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_36px_rgba(201,168,76,0.45)] transition-all cursor-none"
              >
                Explorer mon catalogue →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="px-10 py-5 bg-surface border-t border-gold-line/10 flex items-center justify-between">
            <button 
              onClick={prev}
              className={`font-mono text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors cursor-none ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              ← Retour
            </button>
            
            <div className="font-mono text-[10px] text-text-4 uppercase tracking-[0.2em]">
              0{step} / 04
            </div>

            <button 
              onClick={next}
              className="px-6 py-2 rounded bg-gradient-to-br from-gold to-gold-hi text-void text-xs font-medium tracking-wide shadow-lg hover:-translate-y-px transition-all cursor-none"
            >
              {step === 1 ? 'Commencer →' : step === 3 ? 'Voir mon profil →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={finish}
        className="mt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-text-4 hover:text-text-2 transition-colors cursor-none"
      >
        Passer la configuration →
      </button>
    </div>
  )
}
