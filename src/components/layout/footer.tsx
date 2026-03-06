import { Logo } from '@/components/ui/logo'

// ... (currentYear et footerLinks inchangés)

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // ... (footerLinks)

  return (
    <footer className="border-t border-white/5 bg-bg2/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-6">
            <Logo size="md" />
            <p className="text-sm text-muted leading-relaxed">
              La plateforme de référence pour réussir tes examens nationaux à Madagascar. 🇲🇬
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/mahai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-teal transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@mahai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-teal transition-colors"
              >
                <span className="sr-only">TikTok</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.9 6.24-1.72 1.36-3.92 1.9-6.07 1.49-2.14-.41-4.04-1.75-5.19-3.61-1.15-1.86-1.44-4.17-.79-6.26.65-2.09 2.2-3.81 4.19-4.66 1.99-.85 4.26-.73 6.16.33v4.21c-.66-.37-1.41-.55-2.16-.52-1.36.05-2.61.77-3.34 1.92-.73 1.15-.84 2.6-.29 3.84.55 1.24 1.67 2.14 3.01 2.42 1.34.28 2.73-.13 3.73-1.1 1-1 1.56-2.37 1.56-3.8V.02z" />
                </svg>
              </a>
              <a
                href="https://wa.me/261340000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-teal transition-colors"
              >
                <span className="sr-only">WhatsApp</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h3 className="text-sm font-bold text-text mb-4">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.produit.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-teal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-text mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-teal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-bold text-text mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-teal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted text-center">
            © {currentYear} Mah.AI. Tous droits réservés.
            <br />
            <span className="text-xs">Fait avec ❤️ pour Madagascar 🇲🇬</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
