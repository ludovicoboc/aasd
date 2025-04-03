import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Cria um cliente Supabase para uso no Servidor (Server Components, Actions, Route Handlers).
  // Precisa acessar os cookies para gerenciar a sessão.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // O erro `set` pode ocorrer em Server Actions ou Route Handlers
            // se um cookie for definido após o envio da resposta.
            // Isso pode ser ignorado com segurança em versões mais recentes do Next.js.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O erro `set` pode ocorrer em Server Actions ou Route Handlers
            // se um cookie for definido após o envio da resposta.
            // Isso pode ser ignorado com segurança em versões mais recentes do Next.js.
          }
        },
      },
    }
  )
}

// Função separada para Route Handlers (que não têm acesso direto a `cookies()`)
// Nota: A documentação do @supabase/ssr pode evoluir. Verifique se `createServerClient`
// pode ser usado diretamente em Route Handlers com `RequestCookies` em versões futuras.
// Por enquanto, esta abordagem com `createRouteHandlerClient` é mais explícita.
/*
import { createRouteHandlerClient } from '@supabase/ssr'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies' // Importar tipo

export function createRouteHandlerSupabaseClient(cookieStore: ReadonlyRequestCookies) {
 return createRouteHandlerClient({ cookies: () => cookieStore }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
}
*/
// Comentado por enquanto, pois createServerClient pode ser suficiente com a importação de cookies()
// Se houver problemas em Route Handlers, podemos descomentar e usar esta função.