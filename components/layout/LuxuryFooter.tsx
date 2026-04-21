"use client";

import Link from "next/link";
import Image from "next/image";
import { MOBILE_MONEY_PROVIDERS } from "@/data/mobile-money-providers";
import styles from "./LuxuryFooter.module.css";

export function LuxuryFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={`${styles.footerGrid} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`}>
          {/* BRAND */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              Mah
              <span className={styles.logoGem} />
              AI
            </div>
            <p className={styles.footerTagline}>
              La référence des examens scolaires malgaches — BAC, BEPC, CEPE.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <div key={provider.id} className={styles.paymentBadge}>
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

          {/* CATALOGUE */}
          <div>
            <div className={styles.footerColTitle}>Catalogue</div>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/catalogue?examType=BAC">BAC</Link>
              </li>
              <li>
                <Link href="/catalogue?examType=BEPC">BEPC</Link>
              </li>
              <li>
                <Link href="/catalogue?examType=CEPE">CEPE</Link>
              </li>
              <li>
                <Link href="/catalogue?free=true">Sujets gratuits</Link>
              </li>
            </ul>
          </div>

          {/* PLATEFORME */}
          <div>
            <div className={styles.footerColTitle}>Plateforme</div>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/comment-ca-marche">Comment ça marche</Link>
              </li>
              <li>
                <Link href="/recharge">Tarifs crédits</Link>
              </li>
              <li>
                <Link href="/devenir-contributeur">Devenir contributeur</Link>
              </li>
              <li>
                <Link href="/correction-ia">Correction IA</Link>
              </li>
            </ul>
          </div>

          {/* MAH.AI */}
          <div>
            <div className={styles.footerColTitle}>
              Mah
              <span className={styles.logoGem} />
              AI
            </div>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/a-propos">À propos</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/support">Support</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className={styles.footerBottom}>
          <div className={styles.footerCopy}>
            © 2026 MahAI · Tous droits réservés · Madagascar
          </div>
          <div className={styles.footerLegal}>
            <Link href="/legal/confidentialite">Confidentialité</Link>
            <Link href="/legal/cgu">CGU</Link>
            <Link href="/legal/mentions-legales">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
