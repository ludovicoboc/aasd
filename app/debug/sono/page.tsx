'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSonoStore, RegistroSono, ConfiguracaoLembrete } from '@/app/stores/sonoStore'; // Importar tipos
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { ArrowLeft, Bed, Bell, Trash2, Power, PowerOff } from 'lucide-react'; // Importar ícones

// Helper para formatar dias da semana
const formatarDiasSemana = (dias: number[]): string => {
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  if (dias.length === 7) return 'Todos os dias';
  if (dias.length === 0) return 'Nenhum dia';
  return dias.sort().map(d => nomes[d]).join(', ');
};

export default function DebugSonoPage() {
  // Obter estado e ações da store
  const sonoState = useSonoStore();
  const {
    registros, // Obter registros
    lembretes, // Obter lembretes
    adicionarRegistroSono,
    removerRegistroSono, // Adicionar
    adicionarLembrete,
    removerLembrete, // Adicionar
    alternarAtivoLembrete, // Adicionar
    // Adicionar outras ações se necessário (atualizar...)
  } = sonoState;

  // Estados locais para controles (exemplos)
  const [novoRegistroInicio, setNovoRegistroInicio] = useState(new Date().toISOString().slice(0, 16)); // Formato YYYY-MM-DDTHH:mm
  const [novoRegistroFim, setNovoRegistroFim] = useState(''); // Data e hora de fim (opcional)
  const [novoRegistroQualidade, setNovoRegistroQualidade] = useState(3);
  const [novoLembreteHorario, setNovoLembreteHorario] = useState('07:00');

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Bed className="h-7 w-7 text-sono-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Sono</h1>
      </div>

      {/* Visualizador de Estado */}
      <DebugStateViewer title="Estado da Store (useSonoStore)" state={sonoState} defaultOpen />

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Controle Registro Sono */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Bed size={16} className="mr-2"/>Registro de Sono</h3>
            <div className="grid grid-cols-1 gap-2 mb-2">
               <Input
                 label="Início (Data e Hora)"
                 type="datetime-local"
                 value={novoRegistroInicio}
                 onChange={(e) => setNovoRegistroInicio(e.target.value)}
               />
               <Input
                 label="Fim (Data e Hora - Opcional)"
                 type="datetime-local"
                 value={novoRegistroFim}
                 onChange={(e) => setNovoRegistroFim(e.target.value)}
               />
            </div>
             <div className="flex gap-2 items-end mb-4">
               <Input
                 label="Qualidade (1-5)"
                 type="number"
                 min="1" max="5"
                 value={novoRegistroQualidade}
                 onChange={(e) => setNovoRegistroQualidade(parseInt(e.target.value) || 3)}
                 className="w-28"
               />
              <Button onClick={() => {
                  const inicioISO = novoRegistroInicio ? new Date(novoRegistroInicio).toISOString() : new Date().toISOString();
                  const fimISO = novoRegistroFim ? new Date(novoRegistroFim).toISOString() : null;
                  adicionarRegistroSono(inicioISO, fimISO, novoRegistroQualidade, 'Registro Debug');
              }} size="sm" disabled={!novoRegistroInicio}>
                Adicionar Registro Sono
              </Button>
            </div>
            {/* Lista de Registros */}
            <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Registros Recentes:</h4>
              {registros.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum registro.</p>
              ) : (
                <ul className="space-y-1">
                  {registros.slice(-10).reverse().map((r) => (
                    <li key={r.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>
                        {new Date(r.inicio).toLocaleString()} - {r.fim ? new Date(r.fim).toLocaleTimeString() : 'Em andamento'} (Q: {r.qualidade || 'N/A'})
                      </span>
                      <Button onClick={() => removerRegistroSono(r.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover registro ${r.id}`}>
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Controle Lembretes */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Bell size={16} className="mr-2"/>Lembretes</h3>
            <div className="flex gap-2 items-end mb-4">
              <Input
                label="Horário Lembrete"
                type="time"
                value={novoLembreteHorario}
                onChange={(e) => setNovoLembreteHorario(e.target.value)}
                className="w-32"
              />
              <Button onClick={() => adicionarLembrete('acordar', novoLembreteHorario, [0,1,2,3,4,5,6])} size="sm">
                Add Acordar (Todos)
              </Button>
               <Button onClick={() => adicionarLembrete('dormir', novoLembreteHorario, [0,1,2,3,4,5,6])} size="sm" variant="secondary">
                Add Dormir (Todos)
              </Button>
            </div>
             {/* Lista de Lembretes */}
             <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
               <h4 className="text-sm font-medium mb-2">Lembretes Configurados:</h4>
               {lembretes.length === 0 ? (
                 <p className="text-xs text-gray-500">Nenhum lembrete.</p>
               ) : (
                 <ul className="space-y-1">
                   {lembretes.map((l) => (
                     <li key={l.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span>{l.tipo === 'acordar' ? 'Acordar' : 'Dormir'} às {l.horario} ({formatarDiasSemana(l.diasSemana)})</span>
                       <div className="flex items-center gap-1">
                         <Button onClick={() => alternarAtivoLembrete(l.id)} variant="ghost" size="sm" className={l.ativo ? "text-green-500 hover:bg-green-100" : "text-gray-500 hover:bg-gray-100"} aria-label={l.ativo ? 'Desativar lembrete' : 'Ativar lembrete'}>
                           {l.ativo ? <Power size={14} /> : <PowerOff size={14} />}
                         </Button>
                         <Button onClick={() => removerLembrete(l.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover lembrete ${l.tipo} ${l.horario}`}>
                           <Trash2 size={14} />
                         </Button>
                       </div>
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