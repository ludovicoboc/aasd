'use client';

import { useState, ChangeEvent, useEffect } from 'react'; // Importar useEffect
import Link from 'next/link';
import { useHiperfocosStore, CORES_HIPERFOCOS, Hiperfoco, Tarefa, SessaoAlternancia } from '@/app/stores/hiperfocosStore'; // Importar tipos
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Select, SelectOption } from '@/app/components/ui/Select'; // Importar Select
import { ArrowLeft, Rocket, ListTree, RefreshCcw, Trash2, CheckSquare, Square, PlusCircle, CheckCircle, XCircle, Play, Pause } from 'lucide-react'; // Importar ícones

export default function DebugHiperfocosPage() {
  // Obter estado e ações da store
  const hiperfocosState = useHiperfocosStore();
  const {
    hiperfocos,
    sessoes, // Obter sessões
    adicionarHiperfoco,
    removerHiperfoco, // Adicionar
    adicionarTarefa,
    removerTarefa, // Adicionar
    toggleTarefaConcluida, // Adicionar
    adicionarSubTarefa, // Adicionar
    removerSubTarefa, // Adicionar
    toggleSubTarefaConcluida, // Adicionar
    adicionarSessao,
    removerSessao, // Adicionar
    alternarHiperfoco, // Adicionar
    concluirSessao, // Adicionar
  } = hiperfocosState;

  // Estados locais para controles
  const [novoHiperfocoTitulo, setNovoHiperfocoTitulo] = useState('Hiperfoco Debug');
  const [novaTarefaTexto, setNovaTarefaTexto] = useState<Record<string, string>>({}); // { hiperfocoId: texto }
  const [novaSubTarefaTexto, setNovaSubTarefaTexto] = useState<Record<string, string>>({}); // { tarefaPaiId: texto }
  const [novaSessaoTitulo, setNovaSessaoTitulo] = useState('Sessão Alternância Debug');
  const [novaSessaoDuracao, setNovaSessaoDuracao] = useState(45);
  const [novaSessaoHiperfocoId, setNovaSessaoHiperfocoId] = useState<string | null>(hiperfocos.length > 0 ? hiperfocos[0].id : null);
  const [alternarSessaoId, setAlternarSessaoId] = useState<string | null>(null); // ID da sessão para alternar
  const [alternarNovoHiperfocoId, setAlternarNovoHiperfocoId] = useState<string | null>(null); // Novo ID de hiperfoco

  // Atualizar ID do hiperfoco inicial para nova sessão se a lista mudar
  useEffect(() => {
    if (!novaSessaoHiperfocoId && hiperfocos.length > 0) {
      setNovaSessaoHiperfocoId(hiperfocos[0].id);
    }
  }, [hiperfocos]);

  // Opções para selects de hiperfoco
  const hiperfocoOptions: SelectOption[] = hiperfocos.map(h => ({ value: h.id, label: h.titulo }));

  // Funções auxiliares para lidar com estado local dinâmico
  const handleNovaTarefaChange = (hiperfocoId: string, value: string) => {
    setNovaTarefaTexto(prev => ({ ...prev, [hiperfocoId]: value }));
  };
  const handleNovaSubTarefaChange = (tarefaPaiId: string, value: string) => {
    setNovaSubTarefaTexto(prev => ({ ...prev, [tarefaPaiId]: value }));
  };

  // Função para obter nome do hiperfoco pelo ID
  const getHiperfocoNome = (id: string | null): string => {
    if (!id) return 'Nenhum';
    const hiperfoco = hiperfocos.find(h => h.id === id);
    return hiperfoco ? hiperfoco.titulo : 'Desconhecido';
  };

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Rocket className="h-7 w-7 text-hiperfocos-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Hiperfocos</h1>
      </div>

      {/* Visualizador de Estado */}
      <DebugStateViewer title="Estado da Store (useHiperfocosStore)" state={hiperfocosState} defaultOpen />

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="space-y-4">

          {/* Controle Hiperfocos */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Rocket size={16} className="mr-2"/>Hiperfocos</h3>
            {/* Adicionar Hiperfoco */}
            <div className="flex gap-2 items-end mb-4">
              <Input
                label="Título Hiperfoco"
                value={novoHiperfocoTitulo}
                onChange={(e) => setNovoHiperfocoTitulo(e.target.value)}
                className="flex-1"
              />
              {/* Simplificado: usando cor fixa e sem descrição/tempo */}
              <Button onClick={() => adicionarHiperfoco(novoHiperfocoTitulo, 'Descrição Debug', CORES_HIPERFOCOS[hiperfocos.length % CORES_HIPERFOCOS.length])} size="sm">
                Adicionar Hiperfoco
              </Button>
            </div>

            {/* Lista de Hiperfocos */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium mb-1">Hiperfocos Existentes:</h4>
              {hiperfocos.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum hiperfoco.</p>
              ) : (
                hiperfocos.map((hiperfoco) => (
                  <Card key={hiperfoco.id} className="p-3 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium" style={{ color: hiperfoco.cor }}>■ {hiperfoco.titulo}</span>
                      <Button onClick={() => removerHiperfoco(hiperfoco.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover hiperfoco ${hiperfoco.titulo}`}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{hiperfoco.descricao}</p>

                    {/* Adicionar Tarefa */}
                    <div className="flex gap-2 items-end mb-2 pl-4">
                       <Input
                         label="Nova Tarefa"
                         placeholder="Adicionar tarefa..."
                         value={novaTarefaTexto[hiperfoco.id] || ''}
                         onChange={(e) => handleNovaTarefaChange(hiperfoco.id, e.target.value)}
                         className="flex-1 text-sm"
                       />
                       <Button onClick={() => {
                           const texto = novaTarefaTexto[hiperfoco.id];
                           if (texto) {
                             adicionarTarefa(hiperfoco.id, texto);
                             handleNovaTarefaChange(hiperfoco.id, ''); // Limpar input
                           }
                       }} size="sm" variant="outline" icon={<PlusCircle size={14}/>}>
                         Tarefa
                       </Button>
                     </div>

                    {/* Lista de Tarefas e Sub-tarefas */}
                    <div className="pl-4 space-y-2">
                      {hiperfoco.tarefas.length === 0 ? (
                        <p className="text-xs text-gray-500">Nenhuma tarefa neste hiperfoco.</p>
                      ) : (
                        hiperfoco.tarefas.map((tarefa) => (
                          <div key={tarefa.id} className="border-l-2 pl-2 border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-1">
                                <Button onClick={() => toggleTarefaConcluida(hiperfoco.id, tarefa.id)} variant="ghost" size="sm" className="p-0 h-auto">
                                  {tarefa.concluida ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                                </Button>
                                <span className={tarefa.concluida ? 'line-through text-gray-500' : ''}>{tarefa.texto}</span>
                              </span>
                              <Button onClick={() => removerTarefa(hiperfoco.id, tarefa.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover tarefa ${tarefa.texto}`}>
                                <Trash2 size={14} />
                              </Button>
                            </div>

                            {/* Adicionar Sub-tarefa */}
                            <div className="flex gap-2 items-end mt-1 mb-1 pl-6">
                              <Input
                                label="Nova Sub-tarefa"
                                placeholder="Adicionar sub-tarefa..."
                                value={novaSubTarefaTexto[tarefa.id] || ''}
                                onChange={(e) => handleNovaSubTarefaChange(tarefa.id, e.target.value)}
                                className="flex-1 text-xs"
                              />
                              <Button onClick={() => {
                                  const texto = novaSubTarefaTexto[tarefa.id];
                                  if (texto) {
                                    adicionarSubTarefa(hiperfoco.id, tarefa.id, texto);
                                    handleNovaSubTarefaChange(tarefa.id, ''); // Limpar input
                                  }
                              }} size="sm" variant="ghost" icon={<PlusCircle size={12}/>} className="text-xs">
                                Sub-tarefa
                              </Button>
                            </div>

                            {/* Lista de Sub-tarefas */}
                            <div className="pl-6 space-y-1">
                              {(hiperfoco.subTarefas[tarefa.id] || []).map((subTarefa) => (
                                <div key={subTarefa.id} className="flex justify-between items-center text-xs">
                                  <span className="flex items-center gap-1">
                                    <Button onClick={() => toggleSubTarefaConcluida(hiperfoco.id, tarefa.id, subTarefa.id)} variant="ghost" size="sm" className="p-0 h-auto">
                                      {subTarefa.concluida ? <CheckSquare size={12} className="text-green-500"/> : <Square size={12} />}
                                    </Button>
                                    <span className={subTarefa.concluida ? 'line-through text-gray-500' : ''}>{subTarefa.texto}</span>
                                  </span>
                                  <Button onClick={() => removerSubTarefa(hiperfoco.id, tarefa.id, subTarefa.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover sub-tarefa ${subTarefa.texto}`}>
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          {/* Controle Sessões de Alternância */}
          <Card>
             <h3 className="font-medium mb-2 flex items-center"><RefreshCcw size={16} className="mr-2"/>Sessões de Alternância</h3>
             {/* Adicionar Sessão */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mb-4">
                <Input
                  label="Título Sessão"
                  value={novaSessaoTitulo}
                  onChange={(e) => setNovaSessaoTitulo(e.target.value)}
                />
                <Input
                  label="Duração (min)"
                  type="number"
                  value={novaSessaoDuracao}
                  onChange={(e) => setNovaSessaoDuracao(parseInt(e.target.value) || 45)}
                />
                <Select
                  label="Hiperfoco Inicial"
                  value={novaSessaoHiperfocoId || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNovaSessaoHiperfocoId(e.target.value)}
                  options={hiperfocoOptions}
                  disabled={hiperfocos.length === 0}
                />
             </div>
             <Button onClick={() => {
                 if (novaSessaoHiperfocoId) {
                   adicionarSessao(novaSessaoTitulo, novaSessaoHiperfocoId, novaSessaoDuracao);
                 }
             }} size="sm" disabled={!novaSessaoHiperfocoId}>
               Adicionar Sessão
             </Button>
             {hiperfocos.length === 0 && <p className="text-xs text-red-500 mt-1">Adicione um hiperfoco primeiro.</p>}

             {/* Lista de Sessões */}
             <div className="mt-4 max-h-60 overflow-y-auto border rounded p-2">
               <h4 className="text-sm font-medium mb-2">Sessões Ativas/Concluídas:</h4>
               {sessoes.length === 0 ? (
                 <p className="text-xs text-gray-500">Nenhuma sessão.</p>
               ) : (
                 <ul className="space-y-2">
                   {sessoes.map((sessao) => (
                     <li key={sessao.id} className={`p-2 rounded ${sessao.concluida ? 'bg-gray-100 dark:bg-gray-800 opacity-70' : 'bg-gray-50 dark:bg-gray-700'}`}>
                       <div className="flex justify-between items-center text-sm mb-1">
                         <span className="font-medium">{sessao.titulo} {sessao.concluida ? '(Concluída)' : ''}</span>
                         <div className="flex items-center gap-1">
                           {!sessao.concluida && (
                             <Button onClick={() => concluirSessao(sessao.id)} variant="ghost" size="sm" className="text-green-500 hover:bg-green-100 px-1 py-0 h-auto" aria-label={`Concluir sessão ${sessao.titulo}`}>
                               <CheckCircle size={14} />
                             </Button>
                           )}
                           <Button onClick={() => removerSessao(sessao.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover sessão ${sessao.titulo}`}>
                             <Trash2 size={14} />
                           </Button>
                         </div>
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-400">
                         Atual: {getHiperfocoNome(sessao.hiperfocoAtual)} | Anterior: {getHiperfocoNome(sessao.hiperfocoAnterior)} | Início: {new Date(sessao.tempoInicio).toLocaleTimeString()} | Duração: {sessao.duracaoEstimada} min
                       </p>
                       {/* Controle para Alternar Hiperfoco */}
                       {!sessao.concluida && (
                         <div className="flex gap-2 items-center mt-2">
                           <Select
                             value={alternarSessaoId === sessao.id ? alternarNovoHiperfocoId || '' : ''}
                             onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                               setAlternarSessaoId(sessao.id);
                               setAlternarNovoHiperfocoId(e.target.value);
                             }}
                             options={hiperfocoOptions.filter(opt => opt.value !== sessao.hiperfocoAtual)} // Não mostrar o atual
                             className="flex-1 text-xs"
                           >
                             <option value="">Selecione para alternar...</option>
                           </Select>
                           <Button
                             onClick={() => {
                               if (alternarSessaoId === sessao.id && alternarNovoHiperfocoId) {
                                 alternarHiperfoco(sessao.id, alternarNovoHiperfocoId);
                                 setAlternarSessaoId(null); // Resetar seleção
                                 setAlternarNovoHiperfocoId(null);
                               }
                             }}
                             size="sm"
                             variant="outline"
                             disabled={alternarSessaoId !== sessao.id || !alternarNovoHiperfocoId}
                             className="text-xs"
                           >
                             Alternar
                           </Button>
                         </div>
                       )}
                     </li>
                   ))}
                 </ul>
               )}
             </div>
           </Card>

        </div>
      </Card>
    </Container>
  );
}