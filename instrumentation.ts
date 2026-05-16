import type { Instrumentation } from 'next'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')

    // Supprimer le warning "getSession() could be insecure" émis par
    // @supabase/ssr. On utilise getSession() volontairement dans le
    // middleware proxy.ts pour la performance (~5ms vs ~400ms), et dans
    // les pages/API via createSupabaseServerClient() qui appelle déjà
    // getUser() en amont. Le JWT est vérifié localement, les cookies
    // sont httpOnly+secure. Trade-off documenté et accepté.
    const originalWarn = console.warn
    console.warn = (...args: unknown[]) => {
      const msg = String(args[0] || '')
      if (msg.includes('getSession()') || msg.includes('could be insecure')) return
      originalWarn.apply(console, args)
    }
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(err, request, context)
}