'use client';

import { useState, ChangeEvent } from 'react'; // Importar ChangeEvent
import Link from 'next/link';
import { useAutoconhecimentoStore, Nota } from '@/app/stores/autoconhecimentoStore';
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Select, SelectOption } from '@/app/components/ui/Select'; // Importar SelectOption
import { ArrowLeft, Anchor, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';

export default function DebugAutoconhecimentoPage() {
  // Obter estado e ações da store
  const autoconhecimentoState = useAutoconhecimentoStore();
  const {
    notas,
    modoRefugio,
    adicionarNota,
    removerNota,
    alternarModoRefugio,
  } = autoconhecimentoState;

  // Estados locais para controles
  const [novaNotaTitulo, setNovaNotaTitulo] = useState('Nota Debug');
  const [novaNotaConteudo, setNovaNotaConteudo] = useState('Conteúdo da nota de debug.');
  const [novaNotaSecao, setNovaNotaSecao] = useState<'quem-sou' | 'meus-porques' | 'meus-padroes'>('quem-sou');

  // Opções para o Select de seção
  const secaoOptions: SelectOption[] = [
    { value: 'quem-sou', label: 'Quem sou' },
    { value: 'meus-porques', label: 'Meus porquês' },
    { value: 'meus-padroes', label: 'Meus padrões' },
  ];

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Anchor className="h-7 w-7 text-autoconhecimento-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Autoconhecimento</h1>
      </div>

      {/* Visualizador de Estado */}
      <DebugStateViewer title="Estado da Store (useAutoconhecimentoStore)" state={autoconhecimentoState} defaultOpen />

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="space-y-4">

          {/* Controle Notas */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Anchor size={16} className="mr-2"/>Notas</h3>
            {/* Formulário para adicionar nota */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mb-4">
              <Input
                label="Título Nota"
                value={novaNotaTitulo}
                onChange={(e) => setNovaNotaTitulo(e.target.value)}
              />
               <Input
                 label="Conteúdo Nota"
                 value={novaNotaConteudo}
                 onChange={(e) => setNovaNotaConteudo(e.target.value)}
               />
               <Select
                 label="Seção"
                 value={novaNotaSecao}
                 onChange={(e: ChangeEvent<HTMLSelectElement>) => setNovaNotaSecao(e.target.value as typeof novaNotaSecao)} // Adicionar tipo ao evento
                 options={secaoOptions} // Passar options como prop
               />
            </div>
            <Button onClick={() => adicionarNota(novaNotaTitulo, novaNotaConteudo, novaNotaSecao)} size="sm">
              Adicionar Nota
            </Button>

            {/* Lista de Notas Existentes */}
            <div className="mt-4 max-h-60 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Notas Existentes:</h4>
              {notas.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhuma nota encontrada.</p>
              ) : (
                <ul className="space-y-1">
                  {notas.map((nota) => (
                    <li key={nota.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="truncate flex-1 mr-2">
                        [{nota.secao}] {nota.titulo}
                      </span>
                      <Button
                        onClick={() => removerNota(nota.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto"
                        aria-label={`Remover nota ${nota.titulo}`}
                      >
                        <Trash2 size={14} /> {/* Ícone como children */}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Adicionar controles para editar, tags, imagem se necessário */}
          </Card>

          {/* Controle Modo Refúgio */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center">
              {modoRefugio ? <ShieldCheck size={16} className="mr-2 text-green-500"/> : <ShieldAlert size={16} className="mr-2 text-yellow-500"/>}
              Modo Refúgio
            </h3>
            <Button onClick={alternarModoRefugio} size="sm" variant={modoRefugio ? "destructive" : "default"}>
              {modoRefugio ? 'Desativar Modo Refúgio' : 'Ativar Modo Refúgio'}
            </Button>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
               Estado atual: {modoRefugio ? 'Ativado' : 'Desativado'}
             </p>
           </Card>

        </div>
      </Card>
    </Container>
  );
}