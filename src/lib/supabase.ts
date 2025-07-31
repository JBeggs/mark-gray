import { createBrowserClient } from '@supabase/ssr'

function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Alias for consistency with server-side client
export const createClient = createSupabaseClient

export default createSupabaseClient 