"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  withText?: boolean
  linkable?: boolean
}

export function Logo({ 
  className, 
  size = "md", 
  withText = true,
  linkable = true 
}: LogoProps) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-2xl",
    xl: "w-20 h-20 text-4xl"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl"
  }

  const content = (
    <div className={cn("flex items-center gap-3 group shrink-0", className)}>
      <div 
        className={cn(
          "bg-teal rounded-2xl flex items-center justify-center shadow-lg shadow-teal/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
          sizes[size].split(" ").slice(0, 2).join(" ")
        )}
      >
        <span className={cn("text-bg font-black", sizes[size].split(" ")[2])}>M</span>
      </div>
      {withText && (
        <span className={cn("font-black tracking-tighter text-white", textSizes[size])}>
          Mah.<span className="text-teal">AI</span>
        </span>
      )}
    </div>
  )

  if (!linkable) return content

  return (
    <Link href="/" className="no-underline">
      {content}
    </Link>
  )
}
