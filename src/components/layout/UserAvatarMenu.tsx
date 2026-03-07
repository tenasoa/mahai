"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SignOutButton, useUser } from "@clerk/nextjs"
import { ChevronDown, LogOut, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export default function UserAvatarMenu({ mobile = false }: { mobile?: boolean }) {
  const { user } = useUser()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isProfileActive = pathname === "/etudiant/profil" || pathname === "/etudiant/compte"

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  if (mobile) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
        <span className="text-sm font-bold text-white">Mon profil</span>
        <img
          src={user?.imageUrl || ""}
          alt="Profil utilisateur"
          className="w-9 h-9 rounded-lg border border-white/10 object-cover"
        />
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2"
        aria-label="Menu utilisateur"
      >
        <img
          src={user?.imageUrl || ""}
          alt="Profil utilisateur"
          className="w-10 h-10 rounded-xl border border-white/10 shadow-lg shadow-teal/10 object-cover"
        />
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/10 bg-bg2/95 backdrop-blur-xl shadow-2xl p-2 z-[120]">
          <Link
            href="/etudiant/profil"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-white/5 ${
              isProfileActive ? "bg-teal/10 text-teal border border-teal/20" : "text-white"
            }`}
            onClick={() => setOpen(false)}
          >
            <Settings className="w-4 h-4 text-teal" />
            Profil
            {isProfileActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal" />}
          </Link>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose hover:bg-rose/10"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  )
}
