import Link from 'next/link';
import { Container } from '@/app/components/ui/Container';
import { Card } from '@/app/components/ui/Card';
import { Bug } from 'lucide-react';

// Lista de seções de debug disponíveis (será expandida conforme implementamos)
const debugSections = [
  { name: 'Início', href: '/debug/inicio', description: 'Verificar painel do dia, prioridades e lembretes.' },
  { name: 'Alimentação', href: '/debug/alimentacao', description: 'Inspecionar estado e ações da store de alimentação.' },
  { name: 'Estudos', href: '/debug/estudos', description: 'Depurar simulados, histórico e Pomodoro.' },
  { name: 'Finanças', href: '/debug/financas', description: 'Visualizar transações, envelopes e pagamentos.' },
  { name: 'Saúde', href: '/debug/saude', description: 'Monitorar humor e registro de medicamentos.' },
  { name: 'Sono', href: '/debug/sono', description: 'Analisar registros de sono e lembretes.' },
  { name: 'Hiperfocos', href: '/debug/hiperfocos', description: 'Depurar conversor, alternância e projetos.' },
  { name: 'Autoconhecimento', href: '/debug/autoconhecimento', description: 'Inspecionar notas e modo refúgio.' },
  { name: 'Perfil', href: '/debug/perfil', description: 'Verificar dados do perfil, metas e preferências.' },
  { name: 'Autenticação/Drive', href: '/debug/drive', description: 'Testar integração com Google Drive.' },
  // Adicionar link para RAG quando implementado
  // { name: 'RAG (Chat)', href: '/debug/rag', description: 'Depurar pipeline de Retrieval-Augmented Generation.' },
];

export default function DebugHomePage() {
  return (
    <Container>
      <div className="flex items-center mb-6">
        <Bug className="h-7 w-7 text-red-500 mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Painel de Depuração</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Selecione uma seção para inspecionar e depurar suas funcionalidades.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debugSections.map((section) => (
          <Link key={section.href} href={section.href} passHref>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{section.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>

       <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-300">
        <p className="font-medium">Atenção:</p>
        <p className="text-sm">Esta seção é destinada apenas para fins de desenvolvimento e depuração. Modificações feitas aqui podem afetar o estado da aplicação.</p>
      </div>
    </Container>
  );
}