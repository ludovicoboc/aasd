'use client';

import Link from 'next/link';
import { useState, ChangeEvent } from 'react'; // Importar ChangeEvent
import { usePainelDiaStore, BlocoTempo } from '@/app/stores/painelDiaStore'; // Importar BlocoTempo
import { usePrioridadesStore, Prioridade } from '@/app/stores/prioridadesStore'; // Importar Prioridade
import { useAppStore } from '@/app/store'; // Store principal para medicamentos
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectOption } from '@/app/components/ui/Select'; // Importar Select
import { ArrowLeft, Home, ListTodo, Pill, Plus, Trash2, Clock, CheckSquare, Square } from 'lucide-react'; // Importar ícones

// Opções de categoria para BlocoTempo
const categoriaBlocoOptions: SelectOption[] = [
  { value: 'inicio', label: 'Início' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'estudos', label: 'Estudos' },
  { value: 'saude', label: 'Saúde' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'nenhuma', label: 'Nenhuma' },
];

export default function DebugInicioPage() {
  // Obter estados e ações das stores
  const painelDiaState = usePainelDiaStore();
  const { blocos, adicionarBloco, removerBloco } = painelDiaState; // Corrigido: nomes das ações

  const prioridadesState = usePrioridadesStore();
  const { prioridades, adicionarPrioridade, removerPrioridade, toggleConcluida } = prioridadesState; // Obter prioridades

  const appState = useAppStore();
  const { medicamentos, adicionarMedicamento, removerMedicamento } = appState;

  // Estados locais para controles
  const [novaPrioridade, setNovaPrioridade] = useState('Prioridade Debug');
  const [novoMedicamentoNome, setNovoMedicamentoNome] = useState('Medicamento Debug');
  const [novoBlocoHora, setNovoBlocoHora] = useState('09:00');
  const [novoBlocoAtividade, setNovoBlocoAtividade] = useState('Atividade Bloco Debug');
  const [novoBlocoCategoria, setNovoBlocoCategoria] = useState<BlocoTempo['categoria']>('nenhuma');


  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Home className="h-7 w-7 text-blue-500 mr-3" aria-hidden="true" /> {/* Ajustar cor se necessário */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Início</h1>
      </div>

      {/* Visualizadores de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DebugStateViewer title="Estado - Painel do Dia" state={painelDiaState} defaultOpen />
        <DebugStateViewer title="Estado - Lista de Prioridades" state={prioridadesState} />
        <DebugStateViewer title="Estado - Medicamentos (AppStore)" state={{ medicamentos }} />
      </div>

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles das Stores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Controles PainelDiaStore */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Clock size={16} className="mr-2"/>Painel do Dia</h3>
            <div className="space-y-3">
              {/* Adicionar Bloco */}
              <div className="flex flex-wrap gap-2 items-end">
                <Input
                  label="Hora"
                  type="time"
                  value={novoBlocoHora}
                  onChange={(e) => setNovoBlocoHora(e.target.value)}
                  className="w-28"
                />
                <Input
                  label="Atividade"
                  value={novoBlocoAtividade}
                  onChange={(e) => setNovoBlocoAtividade(e.target.value)}
                  className="flex-1 min-w-[100px]"
                />
                 <Select
                   label="Categoria"
                   value={novoBlocoCategoria}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setNovoBlocoCategoria(e.target.value as BlocoTempo['categoria'])}
                   options={categoriaBlocoOptions}
                   className="min-w-[100px]"
                 />
                <Button onClick={() => adicionarBloco({ id: Date.now().toString(), hora: novoBlocoHora, atividade: novoBlocoAtividade, categoria: novoBlocoCategoria })} size="sm" icon={<Plus size={14}/>}> {/* Corrigido: adicionarBloco e passar objeto completo */}
                  Add Bloco
                </Button>
              </div>
              {/* Lista de Blocos */}
              <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                <h4 className="text-sm font-medium mb-2">Blocos do Dia:</h4>
                {blocos.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhum bloco.</p>
                ) : (
                  <ul className="space-y-1">
                    {blocos.map((b) => (
                      <li key={b.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                        <span>{b.hora} - {b.atividade} ({b.categoria})</span>
                        <Button onClick={() => removerBloco(b.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover bloco ${b.atividade}`}> {/* Corrigido: removerBloco */}
                          <Trash2 size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>

          {/* Controles PrioridadesStore */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><ListTodo size={16} className="mr-2"/>Lista de Prioridades</h3>
            <div className="space-y-3">
              {/* Adicionar */}
              <div className="flex gap-2 items-end">
                <Input
                  label="Nova Prioridade"
                  value={novaPrioridade}
                  onChange={(e) => setNovaPrioridade(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => adicionarPrioridade({ texto: novaPrioridade, concluida: false })} size="sm" icon={<Plus size={14}/>}>
                  Adicionar
                </Button>
              </div>
              {/* Lista de Prioridades */}
              <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                <h4 className="text-sm font-medium mb-2">Prioridades de Hoje:</h4>
                {prioridades.filter(p => p.data === new Date().toISOString().split('T')[0]).length === 0 ? ( // Filtrar por hoje
                  <p className="text-xs text-gray-500">Nenhuma prioridade para hoje.</p>
                ) : (
                  <ul className="space-y-1">
                    {prioridades.filter(p => p.data === new Date().toISOString().split('T')[0]).map((p) => (
                      <li key={p.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                         <span className="flex items-center gap-1">
                           <Button onClick={() => toggleConcluida(p.id)} variant="ghost" size="sm" className="p-0 h-auto">
                             {p.concluida ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                           </Button>
                           <span className={p.concluida ? 'line-through text-gray-500' : ''}>{p.texto}</span>
                        </span>
                        <Button onClick={() => removerPrioridade(p.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover prioridade ${p.texto}`}>
                          <Trash2 size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>

           {/* Controles AppStore (Medicamentos) */}
           <Card>
            <h3 className="font-medium mb-2 flex items-center"><Pill size={16} className="mr-2"/>Medicamentos (AppStore)</h3>
             <div className="space-y-3">
               {/* Adicionar */}
               <div className="flex gap-2 items-end">
                 <Input
                   label="Nome Novo Medicamento"
                   value={novoMedicamentoNome}
                   onChange={(e) => setNovoMedicamentoNome(e.target.value)}
                   className="flex-1"
                 />
                 <Button onClick={() => adicionarMedicamento({
                    // id é gerado pela store
                    nome: novoMedicamentoNome,
                    dosagem: '10mg', // Simplificado
                    frequencia: 'Diária', // Simplificado
                    horarios: ['08:00'], // Simplificado
                    observacoes: 'Debug',
                    ultimaTomada: null,
                    dataInicio: new Date().toISOString().split('T')[0] // Adicionado dataInicio
                 })} size="sm" icon={<Plus size={14}/>}>
                   Adicionar Medicamento
                 </Button>
               </div>
               {/* Lista de Medicamentos */}
               <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                 <h4 className="text-sm font-medium mb-2">Medicamentos Registrados:</h4>
                 {medicamentos.length === 0 ? (
                   <p className="text-xs text-gray-500">Nenhum medicamento.</p>
                 ) : (
                   <ul className="space-y-1">
                     {medicamentos.map((med) => (
                       <li key={med.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                         <span>{med.nome} ({med.dosagem})</span>
                         <Button onClick={() => removerMedicamento(med.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover ${med.nome}`}>
                           <Trash2 size={14} />
                         </Button>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
             </div>
           </Card>

        </div>
      </Card>
    </Container>
  );
}