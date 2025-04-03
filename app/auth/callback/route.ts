import { createClient } from '@/app/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/app/lib/prisma'; // Importar Prisma Client

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = cookies() // Obter a store de cookies
    const supabase = createClient() // Criar cliente de servidor (que usa cookies)
    try {
        // Troca o código pela sessão
        await supabase.auth.exchangeCodeForSession(code)
        // Após trocar o código, obter os dados do usuário autenticado pelo Supabase
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Tenta criar ou atualizar o usuário na tabela Prisma 'User'
          try {
            await prisma.user.upsert({
              where: { id: user.id }, // Chave primária deve ser o ID do Supabase Auth
              update: {
                // Atualiza campos se o usuário já existir
                nome: user.user_metadata?.full_name || user.email || 'Usuário', // Usa nome completo, fallback para email, depois padrão
                // Adicionar outros campos para atualizar se necessário
                updatedAt: new Date(), // Atualiza a data de modificação
              },
              create: {
                // Cria um novo usuário se não existir
                id: user.id, // Usa o ID do Supabase Auth
                nome: user.user_metadata?.full_name || user.email || 'Usuário',
                // Definir valores padrão para outros campos obrigatórios do modelo User do Prisma
                // Exemplo (baseado no schema anterior):
                updatedAt: new Date(), // Necessário pois não tem @updatedAt no schema
                // Definir padrões para as preferências e metas, se aplicável
                prefAltoContraste: false,
                prefReducaoEstimulos: false,
                prefTextoGrande: false,
                metaHorasSono: 8.0,
                metaTarefasPrioritarias: 3,
                metaCoposAgua: 8,
                metaPausasProgramadas: 4,
                notificacoesAtivas: true,
                pausasAtivas: true,
                modoRefugioAtivo: false,
                pomodoroTempoFoco: 25,
                pomodoroTempoPausa: 5,
                pomodoroTempoLongaPausa: 15,
                pomodoroCiclosAntesLongaPausa: 4,
                pomodoroCiclosCompletos: 0,
              },
            });
             console.log(`User ${user.id} upserted successfully in Prisma DB.`);
          } catch (prismaError) {
             console.error(`Error upserting user ${user.id} in Prisma DB:`, prismaError);
             // Decide como lidar com erro de escrita no Prisma (logar, redirecionar com erro?)
             // Por enquanto, apenas loga e continua o fluxo de redirecionamento
          }
        } else {
           console.warn("User object not found after exchanging code for session.");
           // Pode redirecionar para erro se o usuário for essencial aqui
        }
    } catch (error) {
        console.error("Error exchanging code for session:", error);
        // Redirecionar para uma página de erro ou login com mensagem
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }
  } else {
     console.error("No code found in callback URL");
     // Redirecionar para uma página de erro ou login com mensagem
     return NextResponse.redirect(`${origin}/login?error=no_code_in_callback`)
  }

  // Redireciona para a página inicial (ou outra página desejada) após o login
  return NextResponse.redirect(origin)
}