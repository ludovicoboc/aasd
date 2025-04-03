import Link from 'next/link';
import { Container } from '@/app/components/ui/Container';
import { Card } from '@/app/components/ui/Card';
import { Database } from 'lucide-react'; // Usar ícone de Database

// Lista de seções de debug Supabase
const supabaseDebugSections = [
  { name: 'Alimentação', href: '/debug/supabase/alimentacao', description: 'Testar CRUD Supabase para MealLog, MealPlanTemplate, HydrationLog.' },
  { name: 'Autoconhecimento', href: '/debug/supabase/autoconhecimento', description: 'Testar CRUD Supabase para SelfKnowledgeNote.' },
  { name: 'Estudos', href: '/debug/supabase/estudos', description: 'Testar CRUD Supabase para StudySession, StudyMaterial.' },
  { name: 'Finanças', href: '/debug/supabase/financas', description: 'Testar CRUD Supabase para FinanceCategory, Transaction, etc.' },
  { name: 'Hiperfocos', href: '/debug/supabase/hiperfocos', description: 'Testar CRUD Supabase para Hyperfocus, HyperfocusTask, AlternatingSession.' },
  { name: 'Início', href: '/debug/supabase/inicio', description: 'Testar CRUD Supabase para DailyPriority, Reminder (Blocos).' },
  { name: 'Lazer', href: '/debug/supabase/lazer', description: 'Testar CRUD Supabase para LazerActivity.' },
  { name: 'Perfil', href: '/debug/supabase/perfil', description: 'Testar leitura/update do perfil de usuário no Supabase.' },
  { name: 'Saúde', href: '/debug/supabase/saude', description: 'Testar CRUD Supabase para MoodLog.' },
  { name: 'Sono', href: '/debug/supabase/sono', description: 'Testar CRUD Supabase para SleepRecord, SleepReminder.' },
  // Adicionar outros links se necessário (ex: Storage)
];

export default function DebugSupabaseHomePage() {
  return (
    <Container>
      <div className="flex items-center mb-6">
        <Database className="h-7 w-7 text-green-600 mr-3" aria-hidden="true" /> {/* Ícone Supabase/DB */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Painel de Depuração - Supabase</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Selecione uma seção para testar a integração direta com as tabelas do Supabase.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supabaseDebugSections.map((section) => (
          <Link key={section.href} href={section.href} passHref>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{section.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>

       <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-800 dark:text-blue-300">
        <p className="font-medium">Informação:</p>
        <p className="text-sm">Estas páginas interagem diretamente com o banco de dados Supabase. Certifique-se de que as tabelas existem e que você está autenticado.</p>
      </div>
    </Container> // Fechamento do Container
  );
}