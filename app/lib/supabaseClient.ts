import { createClient } from '@supabase/supabase-js';

// Pega as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Valida se as variáveis foram carregadas
if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Cria e exporta o cliente Supabase
// Usamos 'any' para o tipo Database por enquanto, pode ser refinado com tipos gerados pelo Supabase CLI se necessário
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);

// Opcional: Exportar tipos se gerados
// export type Database = Json; // Substituir por tipos gerados