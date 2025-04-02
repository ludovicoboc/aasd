'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAtividadesStore } from '@/app/stores/atividadesStore';
import { useSugestoesStore } from '@/app/stores/sugestoesStore';
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { ArrowLeft, Smile, ListChecks, Lightbulb, Heart, Trash2, CheckSquare, Square } from 'lucide-react'; // Importar ícones

export default function DebugLazerPage() {
  // Obter estados e ações das stores
  const atividadesState = useAtividadesStore();
  const sugestoesState = useSugestoesStore();
  const { atividades, adicionarAtividade, removerAtividade, marcarConcluida } = atividadesState; // Adicionar ações
  const { sugestoesFavoritas, adicionarFavorita, removerFavorita } = sugestoesState;

  // Estados locais para controles (exemplos)
  const [novaAtividadeNome, setNovaAtividadeNome] = useState('Atividade Lazer Debug');
  const [novaAtividadeDuracao, setNovaAtividadeDuracao] = useState(60);
  const [novaSugestao, setNovaSugestao] = useState('Ouvir música relaxante');

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Smile className="h-7 w-7 text-lazer-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Lazer</h1>
      </div>

      {/* Visualizadores de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DebugStateViewer title="Estado - Atividades de Lazer" state={atividadesState} defaultOpen />
        <DebugStateViewer title="Estado - Sugestões de Descanso" state={sugestoesState} />
      </div>

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles das Stores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Controle Atividades Lazer */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><ListChecks size={16} className="mr-2"/>Atividades de Lazer</h3>
            <div className="flex gap-2 items-end mb-4">
              <Input
                label="Nome Atividade"
                value={novaAtividadeNome}
                onChange={(e) => setNovaAtividadeNome(e.target.value)}
                className="flex-1"
              />
              <Input
                label="Duração (min)"
                type="number"
                value={novaAtividadeDuracao}
                onChange={(e) => setNovaAtividadeDuracao(parseInt(e.target.value) || 60)}
                className="w-24"
              />
              <Button onClick={() => adicionarAtividade({
                  id: crypto.randomUUID(),
                  nome: novaAtividadeNome,
                  categoria: 'Relaxante', // Simplificado
                  duracao: novaAtividadeDuracao,
                  observacoes: 'Debug',
                  data: new Date().toISOString().split('T')[0],
                  concluida: false
              })} size="sm">
                Adicionar Atividade
              </Button>
            </div>
            {/* Lista de Atividades */}
            <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Atividades Registradas:</h4>
              {atividades.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhuma atividade.</p>
              ) : (
                <ul className="space-y-1">
                  {atividades.map((a) => (
                    <li key={a.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="flex items-center gap-1">
                         <Button onClick={() => marcarConcluida(a.id)} variant="ghost" size="sm" className="p-0 h-auto" disabled={a.concluida}>
                           {a.concluida ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                         </Button>
                         <span className={a.concluida ? 'line-through text-gray-500' : ''}>{a.nome} ({a.duracao} min)</span>
                      </span>
                      <Button onClick={() => removerAtividade(a.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover atividade ${a.nome}`}>
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Controle Sugestões Descanso */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Lightbulb size={16} className="mr-2"/>Sugestões de Descanso</h3>
            <div className="flex gap-2 items-end mb-4">
               <Input
                 label="Nova Sugestão para Favoritar"
                 value={novaSugestao}
                 onChange={(e) => setNovaSugestao(e.target.value)}
                 className="flex-1"
               />
              <Button onClick={() => adicionarFavorita(novaSugestao)} size="sm" icon={<Heart size={14}/>} disabled={!novaSugestao}>
                Favoritar
              </Button>
            </div>
            {/* Lista de Sugestões Favoritas */}
            <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Sugestões Favoritas:</h4>
              {sugestoesFavoritas.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhuma sugestão favorita.</p>
              ) : (
                <ul className="space-y-1">
                  {sugestoesFavoritas.map((s, index) => (
                    <li key={index} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>{s}</span>
                      <Button onClick={() => removerFavorita(s)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover favorita ${s}`}>
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