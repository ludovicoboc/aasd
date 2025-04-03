import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Cria um cliente Supabase para uso no Browser (Client Components).
  // As variáveis de ambiente NEXT_PUBLIC_ são expostas ao browser.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}