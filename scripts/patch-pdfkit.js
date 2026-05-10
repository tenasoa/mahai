#!/usr/bin/env node
/**
 * Patch postinstall — corrige le bug fontkit dans @react-pdf/pdfkit et @react-pdf/render.
 *
 * La fonction PDFObject.number() lance une erreur pour tout nombre hors [-1e21, 1e21].
 * Fontkit produit occasionnellement des valeurs d'avance de glyphes hors-plage quand
 * il calcule les ajustements kern (GPOS/kern table) pour certaines paires de caractères.
 * On remplace le throw par un retour à 0, ce qui signifie "pas d'ajustement de kern"
 * plutôt qu'un crash complet.
 *
 * À réappliquer après chaque `pnpm install` (voir script "postinstall" dans package.json).
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const THROW_LINE = 'throw new Error(`unsupported number: ${n}`);';
const FIX_LINE   = '// Valeur hors-plage (kern fontkit overflow) — retourne 0 pour ne pas crasher\n    return 0;';

const targets = [
  'node_modules/.pnpm/@react-pdf+pdfkit@5.1.1/node_modules/@react-pdf/pdfkit/lib/pdfkit.js',
  'node_modules/.pnpm/@react-pdf+pdfkit@5.1.1/node_modules/@react-pdf/pdfkit/lib/pdfkit.browser.js',
  'node_modules/.pnpm/@react-pdf+render@4.5.1/node_modules/@react-pdf/render/lib/index.js',
];

let patched = 0;
for (const rel of targets) {
  const full = join(root, rel);
  try {
    let content = readFileSync(full, 'utf8');
    if (content.includes(THROW_LINE)) {
      content = content.replace(THROW_LINE, FIX_LINE);
      writeFileSync(full, content, 'utf8');
      console.log('[patch-pdfkit] Patched:', rel);
      patched++;
    } else if (content.includes('Valeur hors-plage')) {
      console.log('[patch-pdfkit] Already patched:', rel);
    } else {
      console.warn('[patch-pdfkit] Pattern not found in:', rel);
    }
  } catch (e) {
    console.warn('[patch-pdfkit] Could not read:', rel, e.message);
  }
}
console.log(`[patch-pdfkit] Done — ${patched} file(s) patched.`);
