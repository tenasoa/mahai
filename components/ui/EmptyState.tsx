"use client"

import React from "react"
import Link from "next/link"
import { LucideIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  actionHref,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-12",
      "rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm",
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-10 h-10 text-gold opacity-60" />
      </div>
      
      <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">
        {title}
      </h3>
      
      <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="px-8 py-3 rounded-full bg-gold text-black font-semibold hover:bg-gold-hi transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
