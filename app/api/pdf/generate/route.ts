import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
// Augmenter le timeout pour la génération PDF (Vercel Pro: 60s, Hobby: 10s)
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let browser = null
  try {
    const body = await req.json()
    const { htmlContent, filename = 'mahai-sujet.pdf' } = body as {
      htmlContent: string
      filename?: string
    }

    if (!htmlContent || typeof htmlContent !== 'string') {
      return NextResponse.json({ error: 'htmlContent requis' }, { status: 400 })
    }

    // Chargement conditionnel : @sparticuz/chromium en production (Vercel),
    // playwright standard en développement local.
    let executablePath: string | undefined
    let chromiumArgs: string[] = []

    const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME

    if (isVercel) {
      // En production Vercel : utiliser @sparticuz/chromium-min + playwright-core
      // Installer via : pnpm add @sparticuz/chromium-min playwright-core
      try {
        const chromium = await import('@sparticuz/chromium-min')
        executablePath = await chromium.default.executablePath(
          // URL publique du binaire Chromium (requis pour chromium-min)
          process.env.CHROMIUM_EXECUTABLE_URL ||
          'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
        )
        chromiumArgs = chromium.default.args
      } catch {
        // Fallback si @sparticuz/chromium-min n'est pas installé
        console.warn('[pdf] @sparticuz/chromium-min non disponible, tentative playwright standard')
      }
    }

    const { chromium } = await import('playwright')

    browser = await chromium.launch({
      executablePath,
      args: [
        ...chromiumArgs,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      headless: true,
    })

    const page = await browser.newPage()

    // Charger le HTML complet (inclut styles + contenu)
    await page.setContent(htmlContent, { waitUntil: 'networkidle' })

    // Attendre que KaTeX et les polices soient chargés
    await page.waitForTimeout(500)

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '14mm', bottom: '20mm', left: '14mm' },
      displayHeaderFooter: false,
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[pdf/generate] erreur:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}
