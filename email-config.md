# Configuration Email pour Mah.AI

## Option 1: Resend (Recommandé)

1. Installer Resend:
```bash
pnpm add resend
```

2. Ajouter dans .env.local:
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

3. Modifier actions/auth.ts:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@mah.ai',
  to: email,
  subject: 'Code de réinitialisation Mah.AI',
  html: `
    <h2>Code de réinitialisation</h2>
    <p>Voici votre code à 6 chiffres: <strong>${token}</strong></p>
    <p>Ce code expire dans 1 heure.</p>
  `
})
```

## Option 2: SendGrid

1. Installer SendGrid:
```bash
pnpm add @sendgrid/mail
```

2. Configurer .env.local:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

## Option 3: Nodemailer (SMTP local)

1. Installer Nodemailer:
```bash
pnpm add nodemailer
```
