"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar_initial: string | null;
  rating: number;
  is_example: boolean;
};

// Fallback hard-codé en cas d'absence de la table
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "fallback-1",
    name: "Seheno Rakotondrabe",
    role: "BAC série D · Mention Bien 2024",
    quote:
      "Grâce à MahAI, j'ai pu m'exercer sur les sujets des 10 dernières années. La correction IA m'a permis de comprendre exactement où j'échouais.",
    avatar_initial: "S",
    rating: 5,
    is_example: true,
  },
  {
    id: "fallback-2",
    name: "Tiana Andriantsoa",
    role: "BEPC 2024 · Admis avec mention",
    quote:
      "L'interface est élégante et les sujets sont bien organisés. Le paiement Mobile Money fonctionne parfaitement, je recommande vivement.",
    avatar_initial: "T",
    rating: 5,
    is_example: true,
  },
  {
    id: "fallback-3",
    name: "Rivo Ramaroson",
    role: "Contributeur certifié · 12 sujets publiés",
    quote:
      "En tant que contributeur, j'ai publié 12 sujets et reçu mes gains directement via Mobile Money. Un système transparent et équitable.",
    avatar_initial: "R",
    rating: 5,
    is_example: true,
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/landing/testimonials", {
          cache: "no-store",
        });
        if (!cancelled && res.ok) {
          const data = (await res.json()) as { testimonials?: Testimonial[] };
          if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
            setTestimonials(data.testimonials);
          }
        }
      } catch {
        // fallback already set
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="section"
      id="testimonials"
      style={{ background: "var(--surface)" }}
    >
      <div className="container">
        <div className="eyebrow reveal">Témoignages</div>
        <h2
          className="serif reveal"
          style={{
            fontSize: "clamp(2rem,4vw,3.2rem)",
            fontWeight: 400,
            letterSpacing: "-.03em",
            lineHeight: 1.1,
            marginBottom: 0,
          }}
        >
          Ils ont <em>réussi</em>
        </h2>

        <div className="testi-grid">
          {testimonials.slice(0, 3).map((t, idx) => {
            const delayClass =
              idx === 1
                ? " reveal-delay-1"
                : idx === 2
                ? " reveal-delay-2"
                : "";
            return (
              <div
                key={t.id}
                className={`testi-card reveal${delayClass}`}
              >
                {t.is_example && (
                  <div className="testi-example-badge" title="Témoignage illustratif">
                    Exemple
                  </div>
                )}
                <div className="testi-quote">&ldquo;</div>
                <p className="testi-text">{t.quote}</p>
                <div className="testi-author">
                  <div className="testi-avatar">
                    {t.avatar_initial || t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                    {t.rating > 0 && (
                      <div className="testi-stars">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <svg key={i} className="star" viewBox="0 0 24 24" width="10" height="10">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
