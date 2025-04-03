'use client'

import { useState, useEffect } from 'react' // Adicionado useEffect
import { Menu, X, Sun, Moon, HelpCircle, Anchor, LogIn, LogOut, User as UserIcon } from 'lucide-react' // Adicionado LogIn, LogOut, UserIcon
import { useTheme } from 'next-themes'
import { Sidebar } from './Sidebar'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client' // Cliente Supabase para Client Components
import { Button } from '@/app/components/ui/Button' // Adicionado Button
import { User } from '@supabase/supabase-js' // Tipo User
import { useRouter } from 'next/navigation' // Para redirecionamento

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const supabase = createClient()
  const router = useRouter() // Hook para redirecionamento

  // Busca usuário no carregamento e ouve mudanças
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoadingUser(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoadingUser(false)
      // Se deslogar, redireciona para login (opcional, middleware já faz isso)
      // if (event === 'SIGNED_OUT') {
      //   router.push('/login');
      // }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router])


  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Função para abrir o sidebar
  const openSidebar = () => {
    setSidebarOpen(true)
  }

  // Função para fechar o sidebar
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null) // Atualiza estado local
    router.push('/login') // Redireciona para login
    // Não precisa recarregar a página inteira
  }

  return (
    <>
      {/* Sidebar controlável */}
      {sidebarOpen && (
        <Sidebar onClose={closeSidebar} />
      )}
      
      {/* Header fixo no topo */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo e menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={openSidebar}
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="ml-3 flex items-center">
              <span className="sr-only">StayFocus</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-3">
            {/* Ícone Zzz para Sono */}
            <Link href="/sono">
              <button
                className="p-2 rounded-full text-sono-primary hover:bg-sono-light focus:outline-none focus:ring-2 focus:ring-sono-primary"
                aria-label="Gestão do Sono"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
              </button>
            </Link>
            
            {/* Ícone de Âncora para Autoconhecimento */}
            <Link href="/autoconhecimento">
              <button
                className="p-2 rounded-full text-autoconhecimento-primary hover:bg-autoconhecimento-light focus:outline-none focus:ring-2 focus:ring-autoconhecimento-primary"
                aria-label="Notas de Autoconhecimento"
              >
                <Anchor className="h-5 w-5" aria-hidden="true" />
              </button>
            </Link>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {/* Help button */}
            <Link href="/roadmap">
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Roadmap e Ajuda"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </Link>

            {/* User profile / Login / Logout */}
            {loadingUser ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                 <Link href="/perfil">
                   <button
                     className="h-8 w-8 rounded-full bg-perfil-primary hover:bg-perfil-secondary text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-perfil-primary text-sm font-medium"
                     aria-label="Ver Perfil"
                     title={user.email || 'Perfil'} // Mostra email no tooltip
                   >
                     {/* Mostra iniciais ou ícone padrão */}
                     {user.email ? user.email.substring(0, 1).toUpperCase() : <UserIcon size={16}/>}
                   </button>
                 </Link>
                 <button
                   onClick={handleLogout}
                   className="p-2 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                   aria-label="Sair"
                   title="Sair"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            ) : (
              <Link href="/login">
                 <Button variant="outline" size="sm" icon={<LogIn size={14}/>}>
                   Entrar
                 </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
