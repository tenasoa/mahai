/**
 * URL canonique du site, partagée par metadataBase (layout), robots.ts et sitemap.ts.
 * En production Vercel, définir NEXT_PUBLIC_APP_URL=https://mah-ai.vercel.app.
 * Le fallback couvre le cas où la variable n'est pas définie.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://mah-ai.vercel.app'
).replace(/\/+$/, '')
