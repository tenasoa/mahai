"use client"

import Link from "next/link"
import Image from "next/image"
import { MOBILE_MONEY_PROVIDERS } from "@/data/mobile-money-providers"

export function LuxuryFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-12 w-full mb-12">
          <div className="footer-brand max-w-sm">
            <div className="footer-logo text-2xl font-display font-semibold mb-3 flex items-center">
              Mah<span className="logo-gem w-2 h-2 mx-1 rounded-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.18)]"></span>AI
            </div>
            <p className="footer-tagline text-sm text-text-2 mb-4 leading-relaxed">
              La référence des examens scolaires malgaches — BAC, BEPC, CEPE.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-gold bg-gold-dim border border-gold-line py-1 px-2 rounded-full"
                >
                  <Image
                    src={provider.logoPath}
                    alt={provider.alt}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full border border-b3 object-contain bg-void/70"
                  />
                  {provider.name}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="footer-col-title text-sm font-mono uppercase tracking-widest text-text-3 mb-5">Catalogue</div>
            <ul className="footer-links flex flex-col gap-3 text-sm text-text-3">
              <li><Link href="#" className="hover:text-gold transition-colors">BAC</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">BEPC</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">CEPE</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Sujets gratuits</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title text-sm font-mono uppercase tracking-widest text-text-3 mb-5">Plateforme</div>
            <ul className="footer-links flex flex-col gap-3 text-sm text-text-3">
              <li><Link href="#" className="hover:text-gold transition-colors">Comment ça marche</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Tarifs crédits</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Devenir contributeur</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Correction IA</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title text-sm font-mono uppercase tracking-widest text-text-3 mb-5 flex items-center">
              Mah<span className="logo-gem w-1.5 h-1.5 mx-1 rounded-full bg-gold/50 shadow-[0_0_8px_rgba(201,168,76,0.1)]"></span>AI
            </div>
            <ul className="footer-links flex flex-col gap-3 text-sm text-text-3">
              <li><Link href="#" className="hover:text-gold transition-colors">À propos</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom mt-16 pt-6 border-t border-border-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="footer-copy text-xs text-text-3 font-mono">
            © 2026 MahAI · Tous droits réservés · Madagascar
          </div>
          <div className="footer-legal flex gap-6 text-xs text-text-2">
            <Link href="#" className="hover:text-gold transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-gold transition-colors">CGU</Link>
            <Link href="#" className="hover:text-gold transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
