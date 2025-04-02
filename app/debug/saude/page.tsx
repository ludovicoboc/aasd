'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/app/store'; // Store global contém saúde
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { ArrowLeft, Heart, Pill, Smile, Trash2 } from 'lucide-react'; // Importar Trash2

export default function DebugSaudePage() {
  // Obter estado e ações da store global (filtrando para saúde)
  const {
    medicamentos,
    registrosHumor,
    adicionarMedicamento,
    removerMedicamento, // Adicionar ação de remover
    adicionarRegistroHumor,
    removerRegistroHumor, // Adicionar ação de remover
    // Adicionar outras ações relevantes se necessário (atualizar...)
  } = useAppStore(state => ({
    medicamentos: state.medicamentos,
    registrosHumor: state.registrosHumor,
    adicionarMedicamento: state.adicionarMedicamento,
    removerMedicamento: state.removerMedicamento, // Mapear ação
    adicionarRegistroHumor: state.adicionarRegistroHumor,
    removerRegistroHumor: state.removerRegistroHumor, // Mapear ação
  }));

  // Estados locais para controles (exemplos)
  const [novoMedicamentoNome, setNovoMedicamentoNome] = useState('Medicamento Debug');
  const [novoMedicamentoDosagem, setNovoMedicamentoDosagem] = useState('5mg');
  const [novoHumorNivel, setNovoHumorNivel] = useState(3);
  const [novoHumorNota, setNovoHumorNota] = useState('Sentindo-me ok');

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Heart className="h-7 w-7 text-saude-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Saúde</h1>
      </div>

      {/* Visualizadores de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Filtrando o estado global para mostrar apenas o relevante */}
        <DebugStateViewer title="Estado - Medicamentos" state={{ medicamentos }} defaultOpen />
        <DebugStateViewer title="Estado - Registros de Humor" state={{ registrosHumor }} />
      </div>

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Controle Medicamentos */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Pill size={16} className="mr-2"/>Medicamentos</h3>
            <div className="flex gap-2 items-end mb-4">
              <Input
                label="Nome Medicamento"
                value={novoMedicamentoNome}
                onChange={(e) => setNovoMedicamentoNome(e.target.value)}
                className="flex-1"
              />
              <Input
                label="Dosagem"
                value={novoMedicamentoDosagem}
                onChange={(e) => setNovoMedicamentoDosagem(e.target.value)}
                className="w-32"
              />
              <Button onClick={() => adicionarMedicamento({
                  // id: '', // ID será gerado pela store - REMOVIDO
                  nome: novoMedicamentoNome,
                  dosagem: novoMedicamentoDosagem,
                  frequencia: 'Diária', // Simplificado
                  horarios: ['09:00'], // Simplificado
                  observacoes: 'Debug',
                  dataInicio: new Date().toISOString().split('T')[0],
                  ultimaTomada: null,
                  // intervalo: 240 // Opcional
              })} size="sm">
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
                      <span>{med.nome} ({med.dosagem}) - {med.frequencia} [{med.horarios.join(', ')}]</span>
                      <Button onClick={() => removerMedicamento(med.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover ${med.nome}`}>
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Controle Humor */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Smile size={16} className="mr-2"/>Monitoramento de Humor</h3>
            <div className="flex gap-2 items-end mb-4">
               <Input
                 label="Nível (1-5)"
                 type="number"
                 min="1" max="5"
                 value={novoHumorNivel}
                 onChange={(e) => setNovoHumorNivel(parseInt(e.target.value) || 3)}
                 className="w-24"
               />
               <Input
                 label="Nota (Opcional)"
                 value={novoHumorNota}
                 onChange={(e) => setNovoHumorNota(e.target.value)}
                 className="flex-1"
               />
              <Button onClick={() => adicionarRegistroHumor({
                  // id: '', // ID será gerado pela store - REMOVIDO
                  data: new Date().toISOString().split('T')[0],
                  nivel: novoHumorNivel,
                  fatores: ['Debug'], // Simplificado
                  notas: novoHumorNota
              })} size="sm">
                Adicionar Registro Humor
              </Button>
            </div>
             {/* Lista de Registros de Humor */}
             <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
               <h4 className="text-sm font-medium mb-2">Registros Recentes:</h4>
               {registrosHumor.length === 0 ? (
                 <p className="text-xs text-gray-500">Nenhum registro.</p>
               ) : (
                 <ul className="space-y-1">
                   {registrosHumor.slice(-10).reverse().map((reg) => ( // Mostrar últimos 10
                     <li key={reg.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span>{reg.data} - Nível: {reg.nivel} ({reg.notas || 'Sem notas'})</span>
                       <Button onClick={() => removerRegistroHumor(reg.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover registro de ${reg.data}`}>
                         <Trash2 size={14} />
                       </Button>
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