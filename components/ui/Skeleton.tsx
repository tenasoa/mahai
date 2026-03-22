"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.03] border border-white/[0.05]",
        "after:content-[''] after:block after:h-full after:w-full",
        "after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent",
        "after:translate-x-[-100%] after:animate-[shimmer_2s_infinite]",
        "overflow-hidden relative",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}
