'use client'

import React from 'react'
import { Container } from '@/app/components/ui/Container'
import { Card } from '@/app/components/ui/Card'
import { Section } from '@/app/components/ui/Section'
import { CheckCircle2 } from 'lucide-react'

export default function RoadmapPage() {
  return (
    <Container>
      <Section title="Roadmap do StayFocus">
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">💭 O conceito</h2>
          <p className="mb-4">
            O StayFocus surge da minha própria experiência com TDAH e da observação de que precisamos de ferramentas que funcionem com nossos cérebros, não contra eles. Cada recurso foi pensado para ser:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Simples e focado - Sem distrações ou complexidades desnecessárias</li>
            <li>Visualmente claro - Feedback visual imediato para todas as ações</li>
            <li>Adaptável às suas necessidades - Reconhecendo que cada cérebro neurodivergente é único</li>
            <li>Persistente - Porque sabemos como é fácil esquecer coisas importantes</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">🛠️ O que já temos (Sprint 1)</h2>
            <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">📱 Página Inicial</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Painel do Dia - Visualize seu dia em um único lugar</li>
            <li>Lista de Prioridades - Foque no que realmente importa</li>
            <li>Lembretes de Pausas - Porque nossos cérebros precisam descansar!</li>
            <li>Checklist de Medicamentos - Organização por tipo para facilitar o acompanhamento</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">🥗 Alimentação</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Planejador de Refeições - Facilite a decisão do que comer</li>
            <li>Registro de Refeições - Acompanhe seus padrões alimentares</li>
            <li>Lembrete de Hidratação - Para não esquecer de beber água (sim, acontece!)</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">📚 Estudos</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Temporizador Pomodoro - Técnica adaptada para cérebros neurodivergentes</li>
            <li>Registro de Estudos - Acompanhe seu progresso e celebre pequenas vitórias</li>
            <li>**Conferência de Simulados - Carregue arquivos JSON e revise suas respostas**</li>
            <li>**Histórico de Simulados - Veja seu desempenho (melhor/última nota) e refaça simulados**</li>
            <li>**Integração do Histórico com Backups - Salve e restaure seu progresso via Google Drive ou localmente**</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">❤️ Saúde</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Registro de Medicamentos - Com sistema de intervalo entre doses para evitar superdosagem acidental</li>
            <li>Monitoramento de Humor - Identifique padrões e gatilhos emocionais</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">🎮 Lazer</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Temporizador de Lazer - Para garantir que você também se divirta</li>
            <li>Atividades de Lazer - Registre e acompanhe suas atividades favoritas</li>
            <li>Sugestões de Descanso - Quando seu cérebro precisa de uma pausa, mas você não sabe o que fazer</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">⚙️ Sprint 2</h2>
            <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2">😴 Gestão do Sono</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Registro de Sono - Acompanhe os horários de dormir e acordar</li>
            <li>Visualizador Semanal - Veja padrões de sono ao longo do tempo</li>
            <li>Lembretes Personalizáveis - Configure alertas para criar uma rotina de sono</li>
            <li>Metas de Sono - Defina objetivos realistas para melhorar sua qualidade de sono</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4">⚙️ Sprint 3</h2>
            <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2">🧠 Notas de Autoconhecimento</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Seções Organizadas - "Quem sou", "Meus porquês" e "Meus padrões"</li>
            <li>Modo Refúgio - Interface simplificada para momentos de crise</li>
            <li>Sistema de Tags - Categorize suas anotações para encontrá-las facilmente</li>
            <li>Âncoras Visuais - Adicione imagens significativas que te ajudem a se reconectar</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-2">👤 Informações Pessoais</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Perfil Personalizável - Configure seu nome e preferências</li>
            <li>Metas Diárias - Defina objetivos personalizados para sono, tarefas, água e pausas</li>
            <li>Preferências Visuais - Configure opções de acessibilidade como alto contraste, redução de estímulos e texto grande</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4">⚙️ Sprint 4</h2>
            <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2">🔄 Melhorias de Interface</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Correção de distorções visuais - Garantia de uma experiência mais agradável</li>
            <li>Novos ícones e layout - Design mais intuitivo e acessível</li>
            <li>Atualização do rodapé - Inclusão de provérbio inspirador e acesso ao repositório</li>
            <li>Renomeação para StayFocus - Nova identidade visual</li>
          </ul>
        </Card>

        {/* Nova Sprint para Funcionalidades Adicionais */}
        <Card className="mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">⚙️ Sprint 6 (Funcionalidades Adicionais)</h2>
            <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2">💾 Backup e Restauração</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Backup Local - Exporte todos os seus dados para um arquivo JSON</li>
            <li>Importação Local - Restaure seus dados a partir de um arquivo JSON</li>
            <li>Integração com Google Drive - Conecte sua conta para salvar e carregar backups na nuvem</li>
            <li>Inclusão do Histórico de Simulados - Garante que seu progresso nos simulados seja salvo nos backups</li>
          </ul>
        </Card>
        {/* Fim da Nova Sprint */}


        <Card>
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-4">🔮 Sprint 7 (Final)</h2> {/* Renomeado para Sprint 7 */}
            <div className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs flex items-center">
              Planejado
            </div>
          </div>
          
          <div className="mb-4 p-3 border border-amber-200 dark:border-amber-900/50 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <p className="text-amber-800 dark:text-amber-200 font-medium">⚠️ Aviso importante</p>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Para evitar sobrecarga cognitiva, haverá uma pausa de um mês antes do início do desenvolvimento deste sprint final.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2">🔄 Sincronização e Apps Mobile</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Backend com Supabase - Sincronização de dados entre dispositivos</li>
            <li>Aplicativo para iOS - Acesse sua aplicação em dispositivos Apple</li>
            <li>Aplicativo para Android - Versão para dispositivos Android</li>
            <li>Sincronização offline - Acesse seus dados mesmo sem internet</li>
          </ul>
        </Card>
      </Section>
    </Container>
  )
}
