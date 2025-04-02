'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore';
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { ArrowLeft, Utensils, Droplet, Trash2 } from 'lucide-react';

export default function DebugAlimentacaoPage() {
  // Obter o estado e as ações da store
  const {
    refeicoes,
    registros,
    coposBebidos,
    metaDiaria,
    ultimoRegistro,
    adicionarRefeicao,
    atualizarRefeicao,
    removerRefeicao,
    adicionarRegistro,
    removerRegistro,
    adicionarCopo,
    removerCopo,
    ajustarMeta,
  } = useAlimentacaoStore();

  // Estado local para os inputs dos controles
  const [novaRefeicaoHorario, setNovaRefeicaoHorario] = useState('12:00');
  const [novaRefeicaoDescricao, setNovaRefeicaoDescricao] = useState('Almoço Debug');
  const [novoRegistroDescricao, setNovoRegistroDescricao] = useState('Lanche Debug');
  const [ajusteMetaValor, setAjusteMetaValor] = useState(1);

  // Função para resetar o estado (simples, apenas para exemplo)
  // Idealmente, a store teria sua própria função de reset
  const handleResetState = () => {
    // Esta é uma forma simplificada. Uma função de reset na store seria melhor.
    // Poderíamos chamar ações para remover tudo ou recarregar o estado inicial.
    // Por ora, vamos apenas limpar alguns campos para demonstração.
    refeicoes.forEach(r => removerRefeicao(r.id));
    registros.forEach(r => removerRegistro(r.id));
    // Resetar copos bebidos (precisaria de uma ação na store ou set direto)
    // useAlimentacaoStore.setState({ coposBebidos: 0, ultimoRegistro: null }); // Exemplo de set direto (usar com cautela)
    console.warn("Reset simplificado. Implementar função de reset na store.");
  };

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Utensils className="h-7 w-7 text-alimentacao-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Alimentação</h1>
      </div>

      {/* Visualizador de Estado */}
      <DebugStateViewer title="Estado da Store (useAlimentacaoStore)" state={useAlimentacaoStore.getState()} defaultOpen />

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="space-y-4">
          {/* Controle Planejador Refeições */}
          <Card>
            <h3 className="font-medium mb-2">Planejador de Refeições</h3>
            <div className="flex gap-2 items-end">
              <Input
                label="Horário"
                type="time"
                value={novaRefeicaoHorario}
                onChange={(e) => setNovaRefeicaoHorario(e.target.value)}
                className="w-32"
              />
              <Input
                label="Descrição"
                value={novaRefeicaoDescricao}
                onChange={(e) => setNovaRefeicaoDescricao(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => adicionarRefeicao(novaRefeicaoHorario, novaRefeicaoDescricao)} size="sm">
                Adicionar Refeição
              </Button>
            </div>
            {/* Lista de Refeições Existentes */}
            <div className="mt-4 max-h-48 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Refeições Planejadas:</h4>
              {refeicoes.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhuma refeição planejada.</p>
              ) : (
                <ul className="space-y-1">
                  {refeicoes.map((refeicao) => (
                    <li key={refeicao.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>{refeicao.horario} - {refeicao.descricao}</span>
                      <Button
                        onClick={() => removerRefeicao(refeicao.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto"
                        aria-label={`Remover refeição ${refeicao.descricao}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Controle Registro Refeições */}
          <Card>
            <h3 className="font-medium mb-2">Registro de Refeições</h3>
             <div className="flex gap-2 items-end">
               <Input
                 label="Descrição"
                 value={novoRegistroDescricao}
                 onChange={(e) => setNovoRegistroDescricao(e.target.value)}
                 className="flex-1"
               />
               <Button onClick={() => adicionarRegistro(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), novoRegistroDescricao, 'cafe', null)} size="sm">
                 Adicionar Registro (Café)
               </Button>
             </div>
            {/* Lista de Registros Existentes */}
            <div className="mt-4 max-h-48 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Registros Realizados:</h4>
              {registros.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum registro encontrado.</p>
              ) : (
                <ul className="space-y-1">
                  {registros.map((registro) => (
                    <li key={registro.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>{registro.data} {registro.horario} - {registro.descricao}</span>
                      <Button
                        onClick={() => removerRegistro(registro.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto"
                        aria-label={`Remover registro ${registro.descricao}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Controle Hidratação */}
          <Card>
            <h3 className="font-medium mb-2">Hidratação</h3>
            <div className="flex gap-2 items-center">
              <Button onClick={adicionarCopo} size="sm" icon={<Droplet size={14} />}>Adicionar Copo</Button>
              <Button onClick={removerCopo} size="sm" variant="outline" disabled={coposBebidos <= 0}>Remover Copo</Button>
              <div className="flex items-center gap-1 ml-auto">
                 <Button onClick={() => ajustarMeta(-1)} size="sm" variant="outline" disabled={metaDiaria <= 1}>-</Button>
                 <span className="text-sm mx-1">Meta: {metaDiaria}</span>
                 <Button onClick={() => ajustarMeta(1)} size="sm" variant="outline" disabled={metaDiaria >= 15}>+</Button>
              </div>
            </div>
          </Card>

          {/* Reset State */}
          {/* <Card>
            <h3 className="font-medium mb-2 text-red-600">Resetar Estado</h3>
            <Button onClick={handleResetState} variant="destructive" size="sm" icon={<Trash2 size={14}/>}>
              Resetar Store Alimentação (Simplificado)
            </Button>
            <p className="text-xs text-red-500 mt-1">Atenção: Esta ação limpará os dados desta store.</p>
          </Card> */}
        </div>
      </Card>
    </Container>
  );
}