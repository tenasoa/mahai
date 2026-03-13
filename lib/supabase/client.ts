import { createServerClient, createBrowserClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for browser-side usage
 * Use this in Client Components and hooks
 */
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Creates a Supabase client for server-side usage
 * Use this in Server Components, Server Actions, and API routes
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): { name: string; value: string }[] {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value))
          } catch {
            // Called from Server Component - cookies cannot be set
          }
        },
      },
    }
  )
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use createSupabaseServerClient() instead
 */
export function createSupabaseClientLegacy(cookies: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string }[]) {
          try {
            cookiesToSet.forEach(({ name, value }) => cookies.set(name, value))
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
