'use client';

import { useState, ChangeEvent, useEffect } from 'react'; // Importar useEffect
import Link from 'next/link';
import { useFinancasStore, Categoria, Transacao, Envelope, PagamentoRecorrente } from '@/app/stores/financasStore'; // Importar tipos
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Select, SelectOption } from '@/app/components/ui/Select'; // Importar Select
import { ArrowLeft, DollarSign, Tag, Receipt, Package, CalendarClock, Trash2, CheckCircle, XCircle } from 'lucide-react'; // Importar ícones

export default function DebugFinancasPage() {
  // Obter estado e ações da store
  const financasState = useFinancasStore();
  const {
    categorias,
    transacoes,
    envelopes,
    pagamentosRecorrentes,
    adicionarCategoria,
    removerCategoria, // Adicionar
    adicionarTransacao,
    removerTransacao, // Adicionar
    adicionarEnvelope,
    removerEnvelope, // Adicionar
    adicionarPagamentoRecorrente,
    removerPagamentoRecorrente, // Adicionar
    marcarPagamentoComoPago, // Adicionar
  } = financasState;

  // Estados locais para controles
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('Debug Categoria');
  const [novaTransacaoDesc, setNovaTransacaoDesc] = useState('Compra Debug');
  const [novaTransacaoValor, setNovaTransacaoValor] = useState(10.50);
  const [novaTransacaoTipo, setNovaTransacaoTipo] = useState<'receita' | 'despesa'>('despesa');
  const [novaTransacaoCategoriaId, setNovaTransacaoCategoriaId] = useState(categorias.length > 0 ? categorias[0].id : '');
  const [novoEnvelopeNome, setNovoEnvelopeNome] = useState('Envelope Debug');
  const [novoEnvelopeValor, setNovoEnvelopeValor] = useState(100);
  const [novoPagamentoDesc, setNovoPagamentoDesc] = useState('Pagamento Debug');
  const [novoPagamentoValor, setNovoPagamentoValor] = useState(50);
  const [novoPagamentoDia, setNovoPagamentoDia] = useState('15');
  const [novoPagamentoCategoriaId, setNovoPagamentoCategoriaId] = useState(categorias.length > 0 ? categorias[0].id : '');

  // Atualizar categoria selecionada se a lista mudar
  useEffect(() => { // Corrigido: usar useEffect
    if (!novaTransacaoCategoriaId && categorias.length > 0) {
      setNovaTransacaoCategoriaId(categorias[0].id);
    }
    if (!novoPagamentoCategoriaId && categorias.length > 0) {
      setNovoPagamentoCategoriaId(categorias[0].id);
    }
  }, [categorias]); // Dependência correta para useEffect

  // Opções para selects de categoria
  const categoriaOptions: SelectOption[] = categorias.map(cat => ({ value: cat.id, label: cat.nome }));

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <DollarSign className="h-7 w-7 text-financas-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Finanças</h1>
      </div>

      {/* Visualizador de Estado */}
      <DebugStateViewer title="Estado da Store (useFinancasStore)" state={financasState} defaultOpen />

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="space-y-4">

          {/* Controle Categorias */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Tag size={16} className="mr-2"/>Categorias</h3>
            <div className="flex gap-2 items-end mb-4">
              <Input
                label="Nome Categoria"
                value={novaCategoriaNome}
                onChange={(e) => setNovaCategoriaNome(e.target.value)}
                className="flex-1"
              />
              {/* Simplificado: usando cor e ícone fixos */}
              <Button onClick={() => adicionarCategoria(novaCategoriaNome, '#CCCCCC', 'tag')} size="sm" disabled={categorias.length >= 5}>
                Adicionar Categoria
              </Button>
            </div>
             {categorias.length >= 5 && <p className="text-xs text-red-500 mt-1">Limite de 5 categorias atingido.</p>}
             {/* Lista de Categorias */}
             <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
               <h4 className="text-sm font-medium mb-2">Categorias Existentes:</h4>
               {categorias.length === 0 ? (
                 <p className="text-xs text-gray-500">Nenhuma categoria.</p>
               ) : (
                 <ul className="space-y-1">
                   {categorias.map((cat) => (
                     <li key={cat.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span style={{ color: cat.cor }}>■ {cat.nome} ({cat.icone})</span>
                       <Button onClick={() => removerCategoria(cat.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover categoria ${cat.nome}`}>
                         <Trash2 size={14} />
                       </Button>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
          </Card>

          {/* Controle Transações */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Receipt size={16} className="mr-2"/>Transações</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-4">
              <Input
                label="Descrição"
                value={novaTransacaoDesc}
                onChange={(e) => setNovaTransacaoDesc(e.target.value)}
              />
              <Input
                label="Valor"
                type="number"
                step="0.01"
                value={novaTransacaoValor}
                onChange={(e) => setNovaTransacaoValor(parseFloat(e.target.value) || 0)}
              />
              <Select
                label="Categoria"
                value={novaTransacaoCategoriaId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNovaTransacaoCategoriaId(e.target.value)}
                options={categoriaOptions}
                disabled={categorias.length === 0}
              />
              <Select
                label="Tipo"
                value={novaTransacaoTipo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNovaTransacaoTipo(e.target.value as typeof novaTransacaoTipo)}
                options={[{value: 'despesa', label: 'Despesa'}, {value: 'receita', label: 'Receita'}]}
              />
            </div>
            <Button onClick={() => adicionarTransacao(new Date().toISOString().split('T')[0], novaTransacaoValor, novaTransacaoDesc, novaTransacaoCategoriaId, novaTransacaoTipo)} size="sm" disabled={!novaTransacaoCategoriaId}>
              Adicionar Transação
            </Button>
             {!novaTransacaoCategoriaId && categorias.length === 0 && <p className="text-xs text-red-500 mt-1">Adicione uma categoria primeiro.</p>}
             {/* Lista de Transações */}
             <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
               <h4 className="text-sm font-medium mb-2">Transações Recentes:</h4>
               {transacoes.length === 0 ? (
                 <p className="text-xs text-gray-500">Nenhuma transação.</p>
               ) : (
                 <ul className="space-y-1">
                   {transacoes.slice(-10).reverse().map((t) => ( // Mostrar últimas 10
                     <li key={t.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span>{t.data} - {t.descricao} ({t.tipo === 'despesa' ? '-' : '+'} R$ {t.valor.toFixed(2)})</span>
                       <Button onClick={() => removerTransacao(t.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover transação ${t.descricao}`}>
                         <Trash2 size={14} />
                       </Button>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
          </Card>

          {/* Controle Envelopes */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Package size={16} className="mr-2"/>Envelopes Virtuais</h3>
            <div className="flex gap-2 items-end mb-4">
              <Input
                label="Nome Envelope"
                value={novoEnvelopeNome}
                onChange={(e) => setNovoEnvelopeNome(e.target.value)}
                className="flex-1"
              />
              <Input
                label="Valor Alocado"
                type="number"
                step="0.01"
                value={novoEnvelopeValor}
                onChange={(e) => setNovoEnvelopeValor(parseFloat(e.target.value) || 0)}
                className="w-28"
              />
              {/* Simplificado: usando cor fixa */}
              <Button onClick={() => adicionarEnvelope(novoEnvelopeNome, '#FFC107', novoEnvelopeValor)} size="sm">
                Adicionar Envelope
              </Button>
            </div>
            {/* Lista de Envelopes */}
            <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Envelopes:</h4>
              {envelopes.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum envelope.</p>
              ) : (
                <ul className="space-y-1">
                  {envelopes.map((env) => (
                    <li key={env.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span style={{ color: env.cor }}>■ {env.nome} (R$ {env.valorUtilizado.toFixed(2)} / R$ {env.valorAlocado.toFixed(2)})</span>
                      <Button onClick={() => removerEnvelope(env.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover envelope ${env.nome}`}>
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Controle Pagamentos Recorrentes */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><CalendarClock size={16} className="mr-2"/>Pagamentos Recorrentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-4">
              <Input
                label="Descrição"
                value={novoPagamentoDesc}
                onChange={(e) => setNovoPagamentoDesc(e.target.value)}
              />
              <Input
                label="Valor"
                type="number"
                step="0.01"
                value={novoPagamentoValor}
                onChange={(e) => setNovoPagamentoValor(parseFloat(e.target.value) || 0)}
              />
               <Input
                label="Dia Venc."
                type="number"
                min="1" max="31"
                value={novoPagamentoDia}
                onChange={(e) => setNovoPagamentoDia(e.target.value)}
              />
              <Select
                label="Categoria"
                value={novoPagamentoCategoriaId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNovoPagamentoCategoriaId(e.target.value)}
                options={categoriaOptions}
                disabled={categorias.length === 0}
              />
            </div>
            <Button onClick={() => adicionarPagamentoRecorrente(novoPagamentoDesc, novoPagamentoValor, novoPagamentoDia, novoPagamentoCategoriaId)} size="sm" disabled={!novoPagamentoCategoriaId}>
              Adicionar Pagamento
            </Button>
             {!novoPagamentoCategoriaId && categorias.length === 0 && <p className="text-xs text-red-500 mt-1">Adicione uma categoria primeiro.</p>}
             {/* Lista de Pagamentos */}
             <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
               <h4 className="text-sm font-medium mb-2">Pagamentos:</h4>
               {pagamentosRecorrentes.length === 0 ? (
                 <p className="text-xs text-gray-500">Nenhum pagamento recorrente.</p>
               ) : (
                 <ul className="space-y-1">
                   {pagamentosRecorrentes.map((p) => (
                     <li key={p.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span>{p.descricao} (R$ {p.valor.toFixed(2)}) - Vence dia {p.dataVencimento} (Próx: {p.proximoPagamento || 'N/A'})</span>
                       <div className="flex items-center gap-1">
                         <Button onClick={() => marcarPagamentoComoPago(p.id, !p.pago)} variant="ghost" size="sm" className={p.pago ? "text-green-500 hover:bg-green-100" : "text-yellow-600 hover:bg-yellow-100"} aria-label={p.pago ? `Marcar ${p.descricao} como não pago` : `Marcar ${p.descricao} como pago`}>
                           {p.pago ? <CheckCircle size={14} /> : <XCircle size={14} />}
                         </Button>
                         <Button onClick={() => removerPagamentoRecorrente(p.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto" aria-label={`Remover pagamento ${p.descricao}`}>
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