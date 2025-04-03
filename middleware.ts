import { createClient } from '@/app/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { supabase, response } = createClient(req)

  // Atualiza a sessão do usuário baseado no cookie que ele enviou.
  // Isso é importante para manter a sessão ativa ou detectar se expirou.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define as rotas públicas que não exigem autenticação
  const publicPaths = ['/login', '/auth/callback'] // Adicionar outras se necessário (ex: /signup)

  // Verifica se a rota atual é pública
  const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  // Se o usuário não está logado e tenta acessar uma rota protegida
  if (!session && !isPublicPath) {
    // Redireciona para a página de login
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se o usuário está logado e tenta acessar a página de login (opcional)
  // if (session && req.nextUrl.pathname === '/login') {
  //   const url = req.nextUrl.clone()
  //   url.pathname = '/' // Redireciona para a home
  //   return NextResponse.redirect(url)
  // }

  // Se tudo estiver ok, permite que a requisição continue e passa a resposta
  // (que pode ter cookies atualizados pelo getSession)
  return response
}

// Configuração do matcher para definir quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas exceto para:
     * - api (Rotas de API)
     * - _next/static (Arquivos estáticos)
     * - _next/image (Otimização de Imagem)
     * - favicon.ico (Ícone Favicon)
     * - /login (Página de Login)
     * - /auth/callback (Callback OAuth)
     * - Adicionar outras rotas públicas aqui se necessário
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|auth/callback).*)',
  ],
}