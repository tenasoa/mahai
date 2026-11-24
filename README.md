# Mah.ai

Plateforme de révision pour les examens malgaches (CEPE, BEPC, BAC, concours) : sujets,
corrigés, correction IA de copie à partir d'une photo, et une marketplace où profs et
établissements publient leurs contenus.

Version 2, reconstruite de zéro en novembre 2026 sur Cloudflare (Workers, D1, R2, Workers AI).
L'ancienne version (Next.js, Supabase, Vercel) reste dans l'historique git, avant le commit
« v2 : on repart de zéro ».

## Démarrer

```bash
pnpm install
pnpm dev
```

Puis ouvrir http://localhost:5173.

## Documentation

- `docs/brief.md` : produit, public, modèle économique, vagues de livraison, architecture.
- `DESIGN.md` : identité visuelle « Mosaïque ».
- `CLAUDE.md` : conventions de code.
