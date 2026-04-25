# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Communication language: **Français**. Project docs live in `docs/` (mahai-specific) and `../docs/` (repo-wide).
> The parent `../CLAUDE.md` covers the wider monorepo (BMAD workflows); this file is scoped to the `mahai/` Next.js app.

## Commands

Package manager is **pnpm** (see `packageManager` field in `package.json`). Do not use `npm`/`yarn`.

```bash
pnpm dev                 # Next.js dev server (Turbopack, :3000)
pnpm build               # Production build
pnpm start               # Start production server
pnpm lint                # ESLint (flat config)
pnpm test                # Jest (jsdom)
pnpm test:watch
pnpm test:coverage       # Enforces 70% branches/functions/lines/statements
pnpm test -- path/to/file.test.tsx     # Run a single test file
pnpm test -- -t "pattern"              # Run tests matching name
```

There is **no `prisma` script** — the app moved off Prisma to raw SQL via `pg`. Ignore references to `pnpm prisma …` in older docs (including the top-level `../CLAUDE.md` and `DATABASE_MIGRATION.md`). Schema changes are applied via the SQL files in `migrations_manual/` and `supabase/migrations/`, run from the Supabase SQL Editor.

## Architecture

### Database access — raw SQL, not an ORM

- `lib/db.ts` exposes `query(text, params)` and `transaction(callback)` over a singleton `pg.Pool` (stored on `globalThis` to survive HMR). Connection string comes from `DIRECT_URL`.
- `lib/db-client.ts` is a **Prisma-shaped compatibility layer** (`db.user.findUnique`, `db.purchase.create`, `db.$transaction`, `{ decrement: n }` updates). Existing call sites use this shape; new code may call `query()` directly.
- `lib/sql-queries.ts` holds typed helpers and the `User`/`Subject`/… TS interfaces that mirror the DB rows.
- Tables are PascalCase and **must be double-quoted** in SQL (`"User"`, `"Subject"`, `"Purchase"`, `"CreditTransaction"`, `"ExamenBlanc"`, `"SubjectSubmission"`). Columns are camelCase and also need quoting.
- Transactions require `DIRECT_URL` (port 5432), not the pooled `DATABASE_URL` (6543).

### Auth & routing middleware

- Supabase handles auth (`@supabase/ssr`). Clients live in `lib/supabase/{client,server,admin}.ts`.
- The middleware file is **`proxy.ts` at the project root**, not `middleware.ts`. It exports `proxy()` + `config` and enforces: login redirect for `protectedRoutes`, email verification gate via `mahai-email-verified` cookie, onboarding gate via `mahai-onboarding-pending` cookie. Editing auth flow = editing `proxy.ts`.
- Server actions live in `actions/` (flat: `auth.ts`, `profile.ts`, `examen.ts`, …) and `actions/admin/`. `app/contributeur/actions.ts` is co-located with its route.
- Next config sets `experimental.serverActions.bodySizeLimit: '2mb'` — uploads above that must use Vercel Blob (`@vercel/blob`) directly.

### App structure (role-based)

```
app/
├── (public)             catalogue, blog, a-propos, contact, correction-ia, …
├── auth/                login, register, verify-email, onboarding, callback
├── dashboard/           student dashboard
├── sujet/, examens/     student-facing subject & practice-exam flows
├── recharge/            credit top-up (MVola/Orange/Airtel)
├── admin/               admin-only: sujets, soumissions, utilisateurs, credits,
│                        candidatures, retraits, configuration, blog
├── contributeur/        contributor space: sujets (+editor), analytiques, retraits
└── api/                 admin/, subjects/, examens/, payment/, editor/, profile/, user/, blog/, config/
```

`User.role` is one of `ETUDIANT | CONTRIBUTEUR | PROFESSEUR | VERIFICATEUR | VALIDATEUR | ADMIN` — route-level access is enforced in layouts/server actions, not in `proxy.ts`.

### Subject editor (TipTap)

- The rich-text editor in `components/editor/` is built on **TipTap v3** with custom extensions in `extensions.tsx`, KaTeX math (`KaTeXModal.tsx`), code blocks via `lowlight`, and metadata/pricing side panels.
- Used from `app/contributeur/sujets/{nouveau,[id]/edit}` and admin review. `editor.css` holds editor-specific styles.
- Pricing logic interacts with `lib/currency-converter.ts` (see `docs/STRATEGIE_CONVERSION_PRIX.md`).

### Design system

- Tokens are defined as CSS variables (see `app/globals.css`, `app/*.css`) and mapped through `tailwind.config.js` under a custom palette: `void/depth/surface/card/lift`, a **gold** palette (`gold`, `gold-hi/lo/dim/glow/line`), `ruby/sage/ivory`, `border-{1,2,3}`, `text-{2,3,4}`. Fonts: `font-display` (serif), `font-body`, `font-mono`. Custom spacing: `sidebar: 224px`, `topbar: 54px`.
- Prefer existing tokens/components over hard-coded hex values. Reference `docs/DESIGN_SYSTEM_MASTER.md`, `docs/DESIGN_TOKENS.md`.
- Sidebar pattern (admin/contributeur, and for future PROFESSEUR/VALIDATEUR/VERIFICATEUR roles) is documented in `components/SIDEBAR_PATTERN.md` — follow it exactly, including `suppressHydrationWarning` on role-layout root divs to avoid hydration errors from browser extensions.

### Testing

- Jest + Testing Library with `jest-environment-jsdom`. Setup: `__tests__/jest.setup.tsx`. Coverage is collected from `components/**` only and gated at **70%**.
- Path alias `@/*` is wired in both `tsconfig.json` and `jest.config.js` (`moduleNameMapper`). CSS imports are stubbed via `identity-obj-proxy`.

### Stack notes

- Next.js **16** (App Router, Turbopack), React 19, TypeScript strict.
- ESLint flat config (`eslint.config.mjs`) disables `@typescript-eslint/no-explicit-any` and several `react-hooks` rules — don't reintroduce them as blockers.
- Assets/images: Vercel Blob (`@vercel/blob`). Storage bucket for user images is created in `migrations_manual/021_create_storage_bucket_images.sql`.
- Env validation in `lib/env.ts` via Zod: requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`. `SUPABASE_SERVICE_ROLE_KEY` is optional but needed for admin-side Supabase calls.
