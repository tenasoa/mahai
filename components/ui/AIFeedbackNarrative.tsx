"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, FileSearch, Scale, CheckCircle } from 'lucide-react'

const STEPS = [
  { id: 'reading', label: 'Lecture de votre copie...', icon: FileSearch, color: 'text-blue-400' },
  { id: 'analyzing', label: 'Analyse des concepts clés...', icon: Sparkles, color: 'text-purple-400' },
  { id: 'scoring', label: 'Comparaison avec le barème national...', icon: Scale, color: 'text-amber-400' },
  { id: 'finalizing', label: 'Génération de vos conseils...', icon: CheckCircle, color: 'text-emerald-400' }
]

export function AIFeedbackNarrative({ isVisible, onComplete }: { isVisible: boolean, onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          if (onComplete) onComplete()
          return 100
        }
        
        const next = prev + (Math.random() * 2)
        const step = Math.floor((next / 100) * STEPS.length)
        if (step < STEPS.length) setCurrentStep(step)
        
        return next
      })
    }, 150)

    return () => clearInterval(interval)
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/[0.08] rounded-3xl backdrop-blur-xl">
      <div className="relative w-24 h-24 mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-gold/20 rounded-full"
        />
        <div className="absolute inset-2 bg-gold/5 rounded-full flex items-center justify-center">
          <Bot className="w-10 h-10 text-gold animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">L'IA Mah.AI travaille...</h3>
      
      <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div 
          className="h-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4 w-full max-w-sm">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep
          const isDone = idx < currentStep
          const Icon = step.icon

          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isActive || isDone ? 1 : 0.3 }}
              className="flex items-center gap-4"
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-white/5' : ''}`}>
                <Icon className={`w-5 h-5 ${isDone ? 'text-emerald-400' : isActive ? step.color : 'text-white/20'}`} />
              </div>
              <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-white/40'}`}>
                {step.label}
              </span>
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto text-[10px] text-gold uppercase tracking-widest"
                >
                  En cours
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
