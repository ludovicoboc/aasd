'use client';

import { useState, ChangeEvent, useEffect } from 'react'; // Importar useEffect
import Link from 'next/link';
import { useRegistroEstudosStore, SessaoEstudo } from '@/app/stores/registroEstudosStore';
import { usePomodoroStore } from '@/app/stores/pomodoroStore';
import { useSimuladoStore, SimuladoData } from '@/app/stores/simuladoStore';
import { useHistoricoSimuladosStore } from '@/app/stores/historicoSimuladosStore';
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Textarea } from '@/app/components/ui/Textarea'; // Importar Textarea
import { ArrowLeft, BookOpen, Clock, FileText, History, Trash2, CheckSquare, Square, Upload, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'; // Importar ícones

export default function DebugEstudosPage() {
  // Obter estados e ações das stores relevantes
  const registroEstudosState = useRegistroEstudosStore();
  const { sessoes, adicionarSessao, removerSessao, alternarCompletar } = registroEstudosState;

  const pomodoroState = usePomodoroStore();
  const { configuracao, ciclosCompletos, atualizarConfiguracao, incrementarCiclosCompletos, resetarCiclosCompletos } = pomodoroState;

  const simuladoState = useSimuladoStore();
  const { simuladoData, currentQuestionIndex, status, loadSimulado, nextQuestion, prevQuestion, finishReview, resetSimulado } = simuladoState;

  const historicoSimuladosState = useHistoricoSimuladosStore();
  const { historico } = historicoSimuladosState;

  // Estado local para controles
  const [novaSessaoTitulo, setNovaSessaoTitulo] = useState('Sessão Debug');
  const [novaSessaoDuracao, setNovaSessaoDuracao] = useState(30);
  const [configPomodoro, setConfigPomodoro] = useState(configuracao);
  const [simuladoJsonInput, setSimuladoJsonInput] = useState('');

  // Atualizar estado local se configuração da store mudar
  useEffect(() => {
    setConfigPomodoro(configuracao);
  }, [configuracao]);

  const handleConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigPomodoro(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleLoadSimulado = () => {
    try {
      const data: SimuladoData = JSON.parse(simuladoJsonInput || JSON.stringify(require('@/public/simulado-exemplo.json'))); // Usa exemplo se vazio
      loadSimulado(data);
      setSimuladoJsonInput(''); // Limpa input após carregar
    } catch (error) {
      console.error("Erro ao carregar JSON do simulado:", error);
      alert("Erro ao carregar JSON. Verifique o formato.");
    }
  };

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <BookOpen className="h-7 w-7 text-estudos-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Estudos</h1>
      </div>

      {/* Visualizadores de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DebugStateViewer title="Estado - Registro de Estudos" state={registroEstudosState} />
        <DebugStateViewer title="Estado - Pomodoro" state={pomodoroState} />
        <DebugStateViewer title="Estado - Simulado Atual" state={simuladoState} />
        <DebugStateViewer title="Estado - Histórico de Simulados" state={historicoSimuladosState} />
      </div>

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles das Stores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Coluna 1 */}
          <div className="space-y-4">
            {/* Controle Registro Estudos */}
            <Card>
              <h3 className="font-medium mb-2 flex items-center"><BookOpen size={16} className="mr-2"/>Registro de Estudos</h3>
              <div className="flex gap-2 items-end mb-4">
                <Input
                  label="Título Sessão"
                  value={novaSessaoTitulo}
                  onChange={(e) => setNovaSessaoTitulo(e.target.value)}
                  className="flex-1"
                />
                <Input
                  label="Duração (min)"
                  type="number"
                  value={novaSessaoDuracao}
                  onChange={(e) => setNovaSessaoDuracao(parseInt(e.target.value) || 30)}
                  className="w-24"
                />
                <Button onClick={() => adicionarSessao({ titulo: novaSessaoTitulo, descricao: 'Debug', duracao: novaSessaoDuracao })} size="sm">
                  Adicionar Sessão
                </Button>
              </div>
              {/* Lista de Sessões */}
              <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                <h4 className="text-sm font-medium mb-2">Sessões Registradas:</h4>
                {sessoes.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhuma sessão.</p>
                ) : (
                  <ul className="space-y-1">
                    {sessoes.map((s) => (
                      <li key={s.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="flex items-center gap-1">
                           <Button onClick={() => alternarCompletar(s.id)} variant="ghost" size="sm" className="p-0 h-auto">
                             {s.completo ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                           </Button>
                           <span className={s.completo ? 'line-through text-gray-500' : ''}>{s.titulo} ({s.duracao} min)</span>
                        </span>
                        <Button onClick={() => removerSessao(s.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover sessão ${s.titulo}`}>
                          <Trash2 size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            {/* Controle Pomodoro */}
            <Card>
               <h3 className="font-medium mb-2 flex items-center"><Clock size={16} className="mr-2"/>Pomodoro</h3>
               <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input label="Tempo Foco (min)" type="number" name="tempoFoco" value={configPomodoro.tempoFoco} onChange={handleConfigChange} />
                  <Input label="Tempo Pausa (min)" type="number" name="tempoPausa" value={configPomodoro.tempoPausa} onChange={handleConfigChange} />
                  <Input label="Tempo Longa Pausa (min)" type="number" name="tempoLongapausa" value={configPomodoro.tempoLongapausa} onChange={handleConfigChange} />
                  <Input label="Ciclos p/ Longa Pausa" type="number" name="ciclosAntesLongapausa" value={configPomodoro.ciclosAntesLongapausa} onChange={handleConfigChange} />
               </div>
               <Button onClick={() => atualizarConfiguracao(configPomodoro)} size="sm" variant="outline" className="mb-2">Atualizar Config</Button>
               <div className="flex gap-2 items-center">
                  <Button onClick={incrementarCiclosCompletos} size="sm">Incrementar Ciclo ({ciclosCompletos})</Button>
                  <Button onClick={resetarCiclosCompletos} size="sm" variant="outline">Resetar Ciclos</Button>
               </div>
            </Card>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            {/* Controle Simulado Atual */}
            <Card>
               <h3 className="font-medium mb-2 flex items-center"><FileText size={16} className="mr-2"/>Simulado Atual</h3>
               <p className="text-xs text-gray-500 mb-2">Status: {status}</p>
               <div className="mb-2">
                 <Textarea
                   placeholder="Cole o JSON do simulado aqui ou deixe em branco para usar o exemplo."
                   value={simuladoJsonInput}
                   onChange={(e) => setSimuladoJsonInput(e.target.value)}
                   rows={3}
                   className="text-xs"
                 />
                 <Button onClick={handleLoadSimulado} size="sm" icon={<Upload size={14}/>} className="mt-1">Carregar Simulado</Button>
               </div>
               {simuladoData && (
                 <>
                   <p className="text-sm font-medium mb-1">Questão {currentQuestionIndex + 1} de {simuladoData.questoes.length}</p>
                   <p className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2">{simuladoData.questoes[currentQuestionIndex]?.enunciado}</p>
                   {/* Adicionar visualização de alternativas e seleção aqui se necessário */}
                   <div className="flex gap-2 items-center">
                      <Button onClick={prevQuestion} size="sm" variant="outline" disabled={currentQuestionIndex === 0} icon={<ChevronLeft size={14}/>}>Anterior</Button>
                      <Button onClick={nextQuestion} size="sm" variant="outline" disabled={currentQuestionIndex === simuladoData.questoes.length - 1} icon={<ChevronRight size={14}/>}>Próxima</Button>
                      <Button onClick={finishReview} size="sm" variant="success" className="ml-auto" icon={<CheckCircle size={14}/>}>Finalizar Revisão</Button>
                   </div>
                 </>
               )}
               <Button onClick={resetSimulado} size="sm" variant="destructive" className="mt-2">Resetar Simulado</Button>
            </Card>

             {/* Controle Histórico Simulados */}
             <Card>
               <h3 className="font-medium mb-2 flex items-center"><History size={16} className="mr-2"/>Histórico Simulados</h3>
               <div className="max-h-40 overflow-y-auto border rounded p-2">
                 {Object.entries(historico).length === 0 ? (
                   <p className="text-xs text-gray-500">Nenhum histórico.</p>
                 ) : (
                   Object.entries(historico).map(([id, entry]) => (
                     <div key={id} className="mb-2 pb-2 border-b last:border-b-0">
                       <p className="text-sm font-medium">{entry.titulo} ({entry.totalQuestoes} questões)</p>
                       <ul className="text-xs list-disc pl-4">
                         {entry.tentativas.map((t, index) => (
                           <li key={index}>
                             {new Date(t.timestamp).toLocaleString()}: {t.acertos} acertos ({t.percentual.toFixed(1)}%)
                           </li>
                         ))}
                       </ul>
                     </div>
                   ))
                 )}
               </div>
               {/* <Button onClick={() => {}} size="sm" variant="destructive" className="mt-2">Limpar Histórico (Implementar)</Button> */}
             </Card>
          </div>

        </div>
      </Card>
    </Container>
  );
}