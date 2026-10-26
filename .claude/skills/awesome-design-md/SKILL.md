---
name: awesome-design-md
description: >-
  Catalogue de 84 fichiers DESIGN.md (VoltAgent/awesome-design-md) qui décrivent le langage visuel de
  marques connues (Linear, Stripe, Notion, Apple, Airbnb, Vercel…) : palette, typo, composants, layout,
  do/don't. Utiliser quand on choisit ou applique une direction artistique pour Mah.AI, quand
  l'utilisateur dit « dans le style de <marque> », ou pour partir d'un DESIGN.md existant avant de
  créer le nôtre.
---

# awesome-design-md

Les fichiers ne sont pas copiés dans le dépôt (2,4 Mo) : on récupère à la demande celui dont on a
besoin, sur le commit relu et figé ci-dessous.

## Récupérer un DESIGN.md

```bash
COMMIT=3b605329240ce735b510037cca322f1831fdd7f8
curl -fsSL "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/$COMMIT/design-md/<marque>/DESIGN.md"
```

`<marque>` est le nom de dossier de la table ci-dessous (ex. `linear.app`, `stripe`, `notion`).

## Règles pour Mah.AI

- Un DESIGN.md de marque est une **référence d'inspiration**, jamais une copie : on reprend des
  principes (rythme, hiérarchie, densité, usage de l'accent), pas le logo, les couleurs signature
  exactes ni les noms de produits de la marque.
- La direction retenue pour Mah.AI vit dans `DESIGN.md` à la racine du projet. Les tokens qui en
  découlent vont dans `app/globals.css` + `tailwind.config.js` (voir CLAUDE.md, section Design system).
- Mélanger deux références est permis (ex. densité de `linear.app` + chaleur de `airbnb`) : le dire
  explicitement dans le DESIGN.md du projet.

## Index des marques

| Dossier | Résumé (extrait du DESIGN.md) |
|---|---|
| `1win` | An analysis of 1win's design language — a near-black crypto casino and sportsbook built on Inter at heavy we |
| `airbnb` | A warm, generous consumer marketplace anchored on a clean white canvas and Airbnb Rausch (#ff385c), the single |
| `airtable` | A sober, editorial workflow-software interface anchored on white canvas and dark-ink type, where brand voltage |
| `aljazeera` | An analysis of Al Jazeera's design language — a hard-news editorial system built on flat white paper and den |
| `apple` | A photography-first interface that turns marketing into a museum gallery. Edge-to-edge product tiles alternate |
| `binance` | A confident financial-platform interface anchored on a deep near-black canvas, where Binance's iconic yellow ( |
| `bmw` | BMW's corporate site — distinct from BMW M's motorsport-bombastic variant, this is a measured and settled co |
| `bmw-m` | A motorsport-engineering interface anchored on a near-black canvas with white BMW Type Next Latin display head |
| `bugatti` | An austere luxury-automotive interface that uses near-pure black canvas, white uppercase letterspaced display, |
| `cal` | A clean, calendar-software-first interface anchored on white canvas with black primary CTAs and custom Cal San |
| `claude` | A warm-canvas editorial interface for Anthropic's Claude product. The system anchors on a tinted cream canvas  |
| `clay` | A vibrant claymation-meets-data interface for Clay.com (GTM data-orchestration platform). Anchors on white can |
| `clickhouse` | A high-performance database interface anchored on near-pure black canvas with electric yellow as the brand vol |
| `cohere` | Cohere's 2026 web system is a controlled enterprise AI interface built from stark white editorial space, deep  |
| `coinbase` | An institutional-grade crypto exchange whose marketing surfaces read like a quietly-confident financial-servic |
| `composio` | A developer-tools brand for AI-agent tool integration whose marketing surfaces lean into a dark, technical aes |
| `cursor` | An AI-first code editor whose marketing site reads like a quietly-confident developer-tools brand with a warm- |
| `dell-1996` | An inspired interpretation of Dell.com's 1996 design language — a catalog-era enterprise web design built ar |
| `dji` | An analysis of DJI's design language — a product-photography showroom for drones and cameras, where full-ble |
| `elevenlabs` | A voice-AI brand whose marketing surfaces read like a quietly editorial print magazine. The base canvas is off |
| `expo` | A React Native developer-platform whose marketing site reads like a quietly-confident infrastructure brand. Th |
| `ferrari` | A luxury-automotive brand whose marketing surfaces read as cinematic editorial. The base canvas is **near-blac |
| `figma` | A confident black-and-white editorial frame interrupted by oversized, hand-cut pastel color blocks. The market |
| `framer` | A confident dark-canvas builder marketing site that treats the page like a working artboard — pure black sur |
| `hashicorp` | An enterprise-infrastructure marketing canvas built around a near-black ground (#000000) and a system of per-p |
| `hp` | An inspired interpretation of HP's design language — a white-paper enterprise-consumer system anchored by HP |
| `ibm` | An enterprise-marketing canvas faithful to Carbon Design System: white surfaces, charcoal type, IBM Blue (#0f6 |
| `intercom` | An editorial customer-service marketing canvas built around a soft cream-white ground, charcoal type set in Sa |
| `jobright` | An analysis of Jobright's design language — an AI job-hunting platform built on an energetic spring-mint gre |
| `kraken` |  |
| `lamborghini` |  |
| `linear.app` | A near-black product-focused marketing canvas built around #010102 (the deepest dark surface of any tool in th |
| `lovable` |  |
| `mastercard` |  |
| `mercury` | An analysis of Mercury's design language — a fintech system that moves between a deep ink-violet night world |
| `meta` | Meta's design system spans hardware commerce (Quest VR, Ray-Ban Meta AI glasses) and brand surfaces with a con |
| `minimax` | MiniMax presents itself as a premium AI infrastructure brand through a striking duality — bold black-pill CT |
| `mintlify` | Mintlify presents documentation infrastructure with a dual-mode aesthetic — atmospheric sky-gradient marketi |
| `miro` | Miro presents itself as the AI-powered visual workspace through a confident, almost playful brand voice — an |
| `mistral.ai` | Mistral AI brands itself with a singular signature — atmospheric sunset gradients (mustard, orange, deep red |
| `mongodb` | MongoDB carries a strong dual-mode visual identity — dark deep-teal hero bands with bright MongoDB green ({c |
| `mydealz` | An analysis of mydealz's design language — a high-density German deals-community system built on a confident |
| `nerdwallet` | An analysis of NerdWallet's design language — a personal-finance comparison platform built almost entirely f |
| `nike` | | |
| `nintendo-2001` | An analysis of Nintendo.com's 2001 design language — a brushed-periwinkle "console chrome" interface where e |
| `notion` | Notion presents itself as the all-in-one workspace through a confident, illustration-rich brand voice — anch |
| `nvidia` | | |
| `ollama` | | |
| `opencode.ai` | | |
| `oracle` | An analysis of Oracle's design language — an enterprise system built on a warm neutral ladder rather than a  |
| `oura` | An analysis of Oura's design language — a warm-paper wellness system that pairs a high-contrast Editorial se |
| `pinterest` | | |
| `playstation` | | |
| `posthog` | | |
| `raycast` | | |
| `renault` | | |
| `replicate` | | |
| `resend` | | |
| `revolut` | | |
| `runwayml` |  |
| `sanity` |  |
| `sap` | An analysis of SAP's design language — an enterprise system that keeps almost everything on white and spends |
| `sentry` | An inspired interpretation of Sentri's design language — a developer-tools brand built on a deep purple-viol |
| `shopify` | An inspired interpretation of Shopifi's design language — a cinematic commerce platform that runs two parall |
| `slack` | An inspired interpretation of Slacc's design language — a workplace messaging brand built on a deep aubergin |
| `spacex` | An inspired interpretation of Spasex's design language — a mission-oriented aerospace brand built on pure bl |
| `spotify` |  |
| `starbucks` |  |
| `stripe` | An inspired interpretation of Stripi's design language — a financial-infrastructure brand built on a deep na |
| `supabase` | An inspired interpretation of Supabaze's design language — an open-source database platform built on a clean |
| `superhuman` | An inspired interpretation of Superhumon's design language — a fast-email productivity brand split between a |
| `tesla` |  |
| `theverge` |  |
| `together.ai` | An inspired interpretation of Together AI's design language — an AI infrastructure platform whose surface al |
| `uber` | An inspired interpretation of Uber's design language — a transportation-and-delivery super-app brand whose w |
| `vercel` | An inspired interpretation of Vercel's design language — a developer-platform brand whose surface is a stark |
| `vodafone` | An inspired interpretation of Vodafone's design language — a telecom super-brand whose web surface alternate |
| `voltagent` | An inspired interpretation of Voltagent's design language — a developer-focused AI agent engineering platfor |
| `warp` | An inspired interpretation of Warp's design language — an agentic terminal-and-development-environment brand |
| `webflow` | An inspired interpretation of Webflow's design language — a visual web development platform whose surface co |
| `wired` | An inspired interpretation of Wired's design language — a flagship technology-magazine brand whose surface i |
| `wise` | An inspired interpretation of Wise's design language — a global money-transfer brand whose surface combines  |
| `x.ai` | An inspired interpretation of xAI's design language — Elon Musk's frontier-AI company whose web surface is a |
| `zapier` | An inspired interpretation of Zapier's design language — a workflow-automation platform whose surface combin |
