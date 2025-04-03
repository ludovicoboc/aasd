'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectOption } from '@/app/components/ui/Select';
import { Card } from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { ArrowLeft, DollarSign, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, Tag, Receipt, Package, CalendarClock, XCircle, Loader2 } from 'lucide-react'; // Adicionado Loader2
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type FinanceCategory = { id: string; created_at: string; nome: string; cor?: string; icone?: string; userId?: string; };
type Transaction = { id: string; created_at: string; data: string; valor: number; descricao: string; tipo: 'RECEITA' | 'DESPESA'; categoryId: string; userId?: string; category?: { nome: string } };
type BudgetEnvelope = { id: string; created_at: string; nome: string; cor?: string; valorAlocado: number; valorUtilizado: number; userId?: string; };
type RecurringPayment = { id: string; created_at: string; descricao: string; valor: number; diaVencimento: number; proximoPagamento?: string | null; pagoUltimoCiclo: boolean; categoryId: string; userId?: string; category?: { nome: string } };

export default function DebugSupabaseFinancasPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD FinanceCategory
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('Categoria Supabase');
  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState<string | null>(null);
  const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null);
  const categoryOptions: SelectOption[] = categories.map(cat => ({ value: cat.id, label: cat.nome }));

  // Estados CRUD Transaction
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [newTransactionDesc, setNewTransactionDesc] = useState('Compra Supabase');
  const [newTransactionValue, setNewTransactionValue] = useState(15.0);
  const [newTransactionType, setNewTransactionType] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
  const [newTransactionCategoryId, setNewTransactionCategoryId] = useState('');
  const [createTransactionLoading, setCreateTransactionLoading] = useState(false);
  const [createTransactionError, setCreateTransactionError] = useState<string | null>(null);
  const [deleteTransactionLoading, setDeleteTransactionLoading] = useState<string | null>(null);
  const [deleteTransactionError, setDeleteTransactionError] = useState<string | null>(null);

  // Estados CRUD BudgetEnvelope
  const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>([]);
  const [envelopesLoading, setEnvelopesLoading] = useState(false);
  const [envelopesError, setEnvelopesError] = useState<string | null>(null);
  const [newEnvelopeName, setNewEnvelopeName] = useState('Envelope Supabase');
  const [newEnvelopeValue, setNewEnvelopeValue] = useState(150);
  const [createEnvelopeLoading, setCreateEnvelopeLoading] = useState(false);
  const [createEnvelopeError, setCreateEnvelopeError] = useState<string | null>(null);
  const [deleteEnvelopeLoading, setDeleteEnvelopeLoading] = useState<string | null>(null);
  const [deleteEnvelopeError, setDeleteEnvelopeError] = useState<string | null>(null);

  // Estados CRUD RecurringPayment
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [newPaymentDesc, setNewPaymentDesc] = useState('Assinatura Supabase');
  const [newPaymentValue, setNewPaymentValue] = useState(25);
  const [newPaymentDay, setNewPaymentDay] = useState(10);
  const [newPaymentCategoryId, setNewPaymentCategoryId] = useState('');
  const [createPaymentLoading, setCreatePaymentLoading] = useState(false);
  const [createPaymentError, setCreatePaymentError] = useState<string | null>(null);
  const [deletePaymentLoading, setDeletePaymentLoading] = useState<string | null>(null);
  const [deletePaymentError, setDeletePaymentError] = useState<string | null>(null);
  const [togglePaidLoading, setTogglePaidLoading] = useState<string | null>(null);
  const [togglePaidError, setTogglePaidError] = useState<string | null>(null);


  // --- Efeitos e Funções de Conexão/Sessão ---
  useEffect(() => {
    const checkSupabase = async () => {
       setConnectionStatus('checking'); setSessionLoading(true);
       try {
         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
         if (sessionError) throw new Error(`Session Error: ${sessionError.message}`);
         setSessionInfo(session); setCurrentUser(session?.user ?? null); setConnectionStatus('connected');
       } catch (error) {
         console.error("Supabase check failed:", error); setConnectionStatus('error'); setSessionInfo(null); setCurrentUser(null);
       } finally { setSessionLoading(false); }
    };
    checkSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setSessionInfo(session); setCurrentUser(session?.user ?? null);
    });
    return () => { subscription?.unsubscribe(); };
  }, []);

  // --- Funções CRUD (FinanceCategory) ---
  const handleReadCategories = async () => {
    if (!currentUser) { setCategoriesError("Não autenticado."); return; }
    setCategoriesLoading(true); setCategoriesError(null); setCategories([]);
    try {
      const { data, error } = await supabase.from('FinanceCategory').select('*').eq('userId', currentUser.id).order('nome');
      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0) {
        if (!newTransactionCategoryId) setNewTransactionCategoryId(data[0].id);
        if (!newPaymentCategoryId) setNewPaymentCategoryId(data[0].id);
      } else {
         setNewTransactionCategoryId(''); setNewPaymentCategoryId('');
      }
    } catch (error: any) { console.error("Read Categories failed:", error); setCategoriesError(error.message); }
    finally { setCategoriesLoading(false); }
  };
  const handleCreateCategory = async () => {
    if (!currentUser) { setCreateCategoryError("Não autenticado."); return; }
    setCreateCategoryLoading(true); setCreateCategoryError(null);
    try {
      const newCategory = { userId: currentUser.id, nome: newCategoryName || 'Nova Categoria', cor: '#CCCCCC', icone: 'tag' };
      const { error } = await supabase.from('FinanceCategory').insert(newCategory);
      if (error) throw error;
      setNewCategoryName('');
      await handleReadCategories();
    } catch (error: any) { console.error("Create Category failed:", error); setCreateCategoryError(error.message); }
    finally { setCreateCategoryLoading(false); }
  };
  const handleDeleteCategory = async (categoryId: string) => {
     if (!categoryId || !confirm(`Deletar categoria ${categoryId}? Isso pode afetar transações e pagamentos associados.`)) return;
     setDeleteCategoryLoading(categoryId); setDeleteCategoryError(null);
     try {
       const { error } = await supabase.from('FinanceCategory').delete().match({ id: categoryId });
       if (error) throw error;
       await handleReadCategories();
     } catch (error: any) { console.error("Delete Category failed:", error); setDeleteCategoryError(error.message); }
     finally { setDeleteCategoryLoading(null); }
  };

  // --- Funções CRUD (Transaction) ---
  const handleReadTransactions = async () => {
    if (!currentUser) { setTransactionsError("Não autenticado."); return; }
    setTransactionsLoading(true); setTransactionsError(null); setTransactions([]);
    try {
      const { data, error } = await supabase
        .from('Transaction')
        .select('*, category:FinanceCategory(nome)')
        .eq('userId', currentUser.id)
        .order('data', { ascending: false })
        .limit(15);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) { console.error("Read Transactions failed:", error); setTransactionsError(error.message); }
    finally { setTransactionsLoading(false); }
  };
  const handleCreateTransaction = async () => {
    if (!currentUser) { setCreateTransactionError("Não autenticado."); return; }
    if (!newTransactionCategoryId) { setCreateTransactionError("Selecione uma categoria."); return; }
    setCreateTransactionLoading(true); setCreateTransactionError(null);
    try {
      const newTransaction = {
        userId: currentUser.id,
        descricao: newTransactionDesc || 'Nova Transação',
        valor: newTransactionValue,
        tipo: newTransactionType,
        categoryId: newTransactionCategoryId,
        data: new Date().toISOString().split('T')[0]
      };
      const { error } = await supabase.from('Transaction').insert(newTransaction);
      if (error) throw error;
      setNewTransactionDesc(''); setNewTransactionValue(0);
      await handleReadTransactions();
    } catch (error: any) { console.error("Create Transaction failed:", error); setCreateTransactionError(error.message); }
    finally { setCreateTransactionLoading(false); }
  };
  const handleDeleteTransaction = async (transactionId: string) => {
     if (!transactionId || !confirm(`Deletar transação ${transactionId}?`)) return;
     setDeleteTransactionLoading(transactionId); setDeleteTransactionError(null);
     try {
       const { error } = await supabase.from('Transaction').delete().match({ id: transactionId });
       if (error) throw error;
       await handleReadTransactions();
     } catch (error: any) { console.error("Delete Transaction failed:", error); setDeleteTransactionError(error.message); }
     finally { setDeleteTransactionLoading(null); }
  };

  // --- Funções CRUD (BudgetEnvelope) ---
  const handleReadEnvelopes = async () => {
    if (!currentUser) { setEnvelopesError("Não autenticado."); return; }
    setEnvelopesLoading(true); setEnvelopesError(null); setEnvelopes([]);
    try {
      const { data, error } = await supabase.from('BudgetEnvelope').select('*').eq('userId', currentUser.id).order('nome');
      if (error) throw error;
      setEnvelopes(data || []);
    } catch (error: any) { console.error("Read Envelopes failed:", error); setEnvelopesError(error.message); }
    finally { setEnvelopesLoading(false); }
  };
  const handleCreateEnvelope = async () => {
    if (!currentUser) { setCreateEnvelopeError("Não autenticado."); return; }
    setCreateEnvelopeLoading(true); setCreateEnvelopeError(null);
    try {
      const newEnvelope = { userId: currentUser.id, nome: newEnvelopeName || 'Novo Envelope', valorAlocado: newEnvelopeValue, valorUtilizado: 0, cor: '#FFC107' };
      const { error } = await supabase.from('BudgetEnvelope').insert(newEnvelope);
      if (error) throw error;
      setNewEnvelopeName(''); setNewEnvelopeValue(0);
      await handleReadEnvelopes();
    } catch (error: any) { console.error("Create Envelope failed:", error); setCreateEnvelopeError(error.message); }
    finally { setCreateEnvelopeLoading(false); }
  };
  const handleDeleteEnvelope = async (envelopeId: string) => {
     if (!envelopeId || !confirm(`Deletar envelope ${envelopeId}?`)) return;
     setDeleteEnvelopeLoading(envelopeId); setDeleteEnvelopeError(null);
     try {
       const { error } = await supabase.from('BudgetEnvelope').delete().match({ id: envelopeId });
       if (error) throw error;
       await handleReadEnvelopes();
     } catch (error: any) { console.error("Delete Envelope failed:", error); setDeleteEnvelopeError(error.message); }
     finally { setDeleteEnvelopeLoading(null); }
  };

  // --- Funções CRUD (RecurringPayment) ---
  const handleReadRecurringPayments = async () => {
    if (!currentUser) { setPaymentsError("Não autenticado."); return; }
    setPaymentsLoading(true); setPaymentsError(null); setRecurringPayments([]);
    try {
      const { data, error } = await supabase
        .from('RecurringPayment')
        .select('*, category:FinanceCategory(nome)')
        .eq('userId', currentUser.id)
        .order('diaVencimento');
      if (error) throw error;
      setRecurringPayments(data || []);
    } catch (error: any) { console.error("Read Payments failed:", error); setPaymentsError(error.message); }
    finally { setPaymentsLoading(false); }
  };
  const handleCreateRecurringPayment = async () => {
    if (!currentUser) { setCreatePaymentError("Não autenticado."); return; }
    if (!newPaymentCategoryId) { setCreatePaymentError("Selecione uma categoria."); return; }
    setCreatePaymentLoading(true); setCreatePaymentError(null);
    try {
      const newPayment = {
        userId: currentUser.id,
        descricao: newPaymentDesc || 'Novo Pagamento',
        valor: newPaymentValue,
        diaVencimento: newPaymentDay,
        categoryId: newPaymentCategoryId,
        pagoUltimoCiclo: false
      };
      const { error } = await supabase.from('RecurringPayment').insert(newPayment);
      if (error) throw error;
      setNewPaymentDesc(''); setNewPaymentValue(0); setNewPaymentDay(1);
      await handleReadRecurringPayments();
    } catch (error: any) { console.error("Create Payment failed:", error); setCreatePaymentError(error.message); }
    finally { setCreatePaymentLoading(false); }
  };
  const handleDeleteRecurringPayment = async (paymentId: string) => {
     if (!paymentId || !confirm(`Deletar pagamento ${paymentId}?`)) return;
     setDeletePaymentLoading(paymentId); setDeletePaymentError(null);
     try {
       const { error } = await supabase.from('RecurringPayment').delete().match({ id: paymentId });
       if (error) throw error;
       await handleReadRecurringPayments();
     } catch (error: any) { console.error("Delete Payment failed:", error); setDeletePaymentError(error.message); }
     finally { setDeletePaymentLoading(null); }
  };
  const handleTogglePaidPayment = async (payment: RecurringPayment) => {
     if (!payment) return;
     setTogglePaidLoading(payment.id); setTogglePaidError(null);
     try {
       const updates = { pagoUltimoCiclo: !payment.pagoUltimoCiclo };
       const { error } = await supabase.from('RecurringPayment').update(updates).match({ id: payment.id });
       if (error) throw error;
       await handleReadRecurringPayments();
     } catch (error: any) { console.error("Toggle Paid failed:", error); setTogglePaidError(error.message); }
     finally { setTogglePaidLoading(null); }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadCategories();
      handleReadTransactions();
      handleReadEnvelopes();
      handleReadRecurringPayments();
    } else {
      setCategories([]); setTransactions([]); setEnvelopes([]); setRecurringPayments([]);
    }
  }, [currentUser]);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <DollarSign className="h-7 w-7 text-financas-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Finanças</h1>
       </div>

       {/* Status Conexão/Sessão */}
       <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Status Supabase</h2>
          {connectionStatus === 'checking' && <p>Verificando...</p>}
          {connectionStatus === 'connected' && <Alert variant="success" title="Conectado">Comunicação inicial com Supabase OK.</Alert>}
          {connectionStatus === 'error' && <Alert variant="error" title="Erro Conexão">Falha ao conectar/obter sessão Supabase.</Alert>}
          {sessionLoading && <p>Carregando sessão...</p>}
          {!sessionLoading && currentUser && <p className="text-sm mt-1">Logado como: {currentUser.email}</p>}
          {!sessionLoading && !currentUser && <p className="text-sm mt-1">Não autenticado.</p>}
       </Card>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

         {/* Coluna 1: Categorias e Transações */}
         <div className="space-y-6">
           {/* CRUD FinanceCategory */}
           <Card>
             <h2 className="text-xl font-semibold mb-4 flex items-center"><Tag className="mr-2 h-5 w-5"/>Categorias</h2>
             {/* Criar Categoria */}
             <div className="mb-4 p-3 border rounded-md space-y-2">
               <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Nova Categoria</h3>
               <div className="flex items-end gap-2">
                 <Input label="Nome" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-grow" disabled={!currentUser || createCategoryLoading} />
                 <Button onClick={handleCreateCategory} disabled={!currentUser || createCategoryLoading || !newCategoryName}>
                   {createCategoryLoading ? 'Criando...' : 'Criar'}
                 </Button>
               </div>
               {createCategoryError && <Alert variant="error" title="Erro">{createCategoryError}</Alert>}
             </div>
             {/* Listar Categorias */}
             <div className="p-3 border rounded-md space-y-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Categorias Existentes</h3>
                 <Button onClick={handleReadCategories} size="sm" variant="outline" disabled={!currentUser || categoriesLoading}>
                   {categoriesLoading ? 'Buscando...' : 'Recarregar'}
                 </Button>
               </div>
               {categoriesLoading && <p>Carregando...</p>}
               {categoriesError && <Alert variant="error" title="Erro">{categoriesError}</Alert>}
               {!categoriesLoading && !categoriesError && categories.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria.</p>}
               {!categoriesLoading && !categoriesError && categories.length > 0 && (
                 <ul className="space-y-1 max-h-40 overflow-y-auto">
                   {categories.map((cat) => (
                     <li key={cat.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span style={{ color: cat.cor || '#CCCCCC' }}>■ {cat.nome}</span>
                       <Button onClick={() => handleDeleteCategory(cat.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteCategoryLoading === cat.id}>
                         {deleteCategoryLoading === cat.id ? '...' : <Trash2 size={14} />}
                       </Button>
                     </li>
                   ))}
                 </ul>
               )}
               {deleteCategoryError && <Alert variant="error" title="Erro Deletar">{deleteCategoryError}</Alert>}
             </div>
           </Card>

           {/* CRUD Transaction */}
           <Card>
             <h2 className="text-xl font-semibold mb-4 flex items-center"><Receipt className="mr-2 h-5 w-5"/>Transações</h2>
             {/* Criar Transação */}
             <div className="mb-4 p-3 border rounded-md space-y-2">
               <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Nova Transação</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                 <Input label="Descrição" value={newTransactionDesc} onChange={(e) => setNewTransactionDesc(e.target.value)} disabled={!currentUser || createTransactionLoading} />
                 <Input label="Valor" type="number" step="0.01" value={newTransactionValue} onChange={(e) => setNewTransactionValue(parseFloat(e.target.value) || 0)} disabled={!currentUser || createTransactionLoading} />
                 <Select label="Categoria" value={newTransactionCategoryId} onChange={(e) => setNewTransactionCategoryId(e.target.value)} options={categoryOptions} disabled={!currentUser || createTransactionLoading || categories.length === 0} />
                 <Select label="Tipo" value={newTransactionType} onChange={(e) => setNewTransactionType(e.target.value as typeof newTransactionType)} options={[{value: 'DESPESA', label: 'Despesa'}, {value: 'RECEITA', label: 'Receita'}]} disabled={!currentUser || createTransactionLoading} />
               </div>
               <Button onClick={handleCreateTransaction} disabled={!currentUser || createTransactionLoading || !newTransactionCategoryId || !newTransactionDesc}>
                 {createTransactionLoading ? 'Criando...' : 'Adicionar'}
               </Button>
               {createTransactionError && <Alert variant="error" title="Erro">{createTransactionError}</Alert>}
               {categories.length === 0 && <p className="text-xs text-red-500">Crie uma categoria primeiro.</p>}
             </div>
             {/* Listar Transações */}
             <div className="p-3 border rounded-md space-y-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Transações Recentes</h3>
                 <Button onClick={handleReadTransactions} size="sm" variant="outline" disabled={!currentUser || transactionsLoading}>
                   {transactionsLoading ? 'Buscando...' : 'Recarregar'}
                 </Button>
               </div>
               {transactionsLoading && <p>Carregando...</p>}
               {transactionsError && <Alert variant="error" title="Erro">{transactionsError}</Alert>}
               {!transactionsLoading && !transactionsError && transactions.length === 0 && <p className="text-sm text-gray-500">Nenhuma transação.</p>}
               {!transactionsLoading && !transactionsError && transactions.length > 0 && (
                 <ul className="space-y-1 max-h-60 overflow-y-auto">
                   {transactions.map((t: any) => (
                     <li key={t.id} className={`flex justify-between items-center text-sm p-1 rounded ${t.tipo === 'DESPESA' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                       <div>
                         <span className="font-medium">{t.descricao}</span>
                         <span className="text-xs text-gray-500 ml-1">({t.category?.nome || 'Sem Categoria'})</span>
                         <span className="block text-xs">{new Date(t.data).toLocaleDateString()} - {t.tipo === 'DESPESA' ? '-' : '+'} R$ {t.valor.toFixed(2)}</span>
                       </div>
                       <Button onClick={() => handleDeleteTransaction(t.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteTransactionLoading === t.id}>
                         {deleteTransactionLoading === t.id ? '...' : <Trash2 size={14} />}
                       </Button>
                     </li>
                   ))}
                 </ul>
               )}
               {deleteTransactionError && <Alert variant="error" title="Erro Deletar">{deleteTransactionError}</Alert>}
             </div>
           </Card>
         </div>

         {/* Coluna 2: Envelopes e Pagamentos Recorrentes */}
         <div className="space-y-6">
           {/* CRUD BudgetEnvelope */}
           <Card>
             <h2 className="text-xl font-semibold mb-4 flex items-center"><Package className="mr-2 h-5 w-5"/>Envelopes</h2>
              {/* Criar Envelope */}
             <div className="mb-4 p-3 border rounded-md space-y-2">
               <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Envelope</h3>
               <div className="flex items-end gap-2">
                 <Input label="Nome" value={newEnvelopeName} onChange={(e) => setNewEnvelopeName(e.target.value)} className="flex-grow" disabled={!currentUser || createEnvelopeLoading} />
                 <Input label="Valor Alocado" type="number" step="0.01" value={newEnvelopeValue} onChange={(e) => setNewEnvelopeValue(parseFloat(e.target.value) || 0)} className="w-32" disabled={!currentUser || createEnvelopeLoading} />
                 <Button onClick={handleCreateEnvelope} disabled={!currentUser || createEnvelopeLoading || !newEnvelopeName || newEnvelopeValue <= 0}>
                   {createEnvelopeLoading ? 'Criando...' : 'Criar'}
                 </Button>
               </div>
               {createEnvelopeError && <Alert variant="error" title="Erro">{createEnvelopeError}</Alert>}
             </div>
             {/* Listar Envelopes */}
             <div className="p-3 border rounded-md space-y-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Envelopes Existentes</h3>
                 <Button onClick={handleReadEnvelopes} size="sm" variant="outline" disabled={!currentUser || envelopesLoading}>
                   {envelopesLoading ? 'Buscando...' : 'Recarregar'}
                 </Button>
               </div>
               {envelopesLoading && <p>Carregando...</p>}
               {envelopesError && <Alert variant="error" title="Erro">{envelopesError}</Alert>}
               {!envelopesLoading && !envelopesError && envelopes.length === 0 && <p className="text-sm text-gray-500">Nenhum envelope.</p>}
               {!envelopesLoading && !envelopesError && envelopes.length > 0 && (
                 <ul className="space-y-1 max-h-40 overflow-y-auto">
                   {envelopes.map((env) => (
                     <li key={env.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <span style={{ color: env.cor || '#FFC107' }}>■ {env.nome} (R$ {env.valorUtilizado.toFixed(2)} / R$ {env.valorAlocado.toFixed(2)})</span>
                       <Button onClick={() => handleDeleteEnvelope(env.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteEnvelopeLoading === env.id}>
                         {deleteEnvelopeLoading === env.id ? '...' : <Trash2 size={14} />}
                       </Button>
                     </li>
                   ))}
                 </ul>
               )}
               {deleteEnvelopeError && <Alert variant="error" title="Erro Deletar">{deleteEnvelopeError}</Alert>}
             </div>
           </Card>

           {/* CRUD RecurringPayment */}
           <Card>
             <h2 className="text-xl font-semibold mb-4 flex items-center"><CalendarClock className="mr-2 h-5 w-5"/>Pagamentos Recorrentes</h2>
              {/* Criar Pagamento */}
             <div className="mb-4 p-3 border rounded-md space-y-2">
               <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Pagamento</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                 <Input label="Descrição" value={newPaymentDesc} onChange={(e) => setNewPaymentDesc(e.target.value)} disabled={!currentUser || createPaymentLoading} />
                 <Input label="Valor" type="number" step="0.01" value={newPaymentValue} onChange={(e) => setNewPaymentValue(parseFloat(e.target.value) || 0)} disabled={!currentUser || createPaymentLoading} />
                 <Input label="Dia Venc." type="number" min="1" max="31" value={newPaymentDay} onChange={(e) => setNewPaymentDay(parseInt(e.target.value) || 1)} disabled={!currentUser || createPaymentLoading} />
                 <Select label="Categoria" value={newPaymentCategoryId} onChange={(e) => setNewPaymentCategoryId(e.target.value)} options={categoryOptions} disabled={!currentUser || createPaymentLoading || categories.length === 0} />
               </div>
               <Button onClick={handleCreateRecurringPayment} disabled={!currentUser || createPaymentLoading || !newPaymentCategoryId || !newPaymentDesc || newPaymentValue <= 0}>
                 {createPaymentLoading ? 'Criando...' : 'Adicionar'}
               </Button>
               {createPaymentError && <Alert variant="error" title="Erro">{createPaymentError}</Alert>}
               {categories.length === 0 && <p className="text-xs text-red-500">Crie uma categoria primeiro.</p>}
             </div>
             {/* Listar Pagamentos */}
             <div className="p-3 border rounded-md space-y-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Pagamentos Cadastrados</h3>
                 <Button onClick={handleReadRecurringPayments} size="sm" variant="outline" disabled={!currentUser || paymentsLoading}>
                   {paymentsLoading ? 'Buscando...' : 'Recarregar'}
                 </Button>
               </div>
               {paymentsLoading && <p>Carregando...</p>}
               {paymentsError && <Alert variant="error" title="Erro">{paymentsError}</Alert>}
               {!paymentsLoading && !paymentsError && recurringPayments.length === 0 && <p className="text-sm text-gray-500">Nenhum pagamento recorrente.</p>}
               {!paymentsLoading && !paymentsError && recurringPayments.length > 0 && (
                 <ul className="space-y-1 max-h-60 overflow-y-auto">
                   {recurringPayments.map((p: any) => (
                     <li key={p.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                       <div>
                         <span className="font-medium">{p.descricao}</span>
                         <span className="text-xs text-gray-500 ml-1">({p.category?.nome || 'Sem Categoria'})</span>
                         <span className="block text-xs">R$ {p.valor.toFixed(2)} - Vence dia {p.diaVencimento}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Button onClick={() => handleTogglePaidPayment(p)} variant="ghost" size="sm" className={p.pagoUltimoCiclo ? "text-green-500 hover:bg-green-100" : "text-yellow-600 hover:bg-yellow-100"} disabled={togglePaidLoading === p.id} aria-label={p.pagoUltimoCiclo ? `Marcar ${p.descricao} como não pago` : `Marcar ${p.descricao} como pago`}>
                           {togglePaidLoading === p.id ? <Loader2 size={14} className="animate-spin"/> : p.pagoUltimoCiclo ? <CheckCircle size={14} /> : <XCircle size={14} />}
                         </Button>
                         <Button onClick={() => handleDeleteRecurringPayment(p.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deletePaymentLoading === p.id}>
                           {deletePaymentLoading === p.id ? '...' : <Trash2 size={14} />}
                         </Button>
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
               {deletePaymentError && <Alert variant="error" title="Erro Deletar">{deletePaymentError}</Alert>}
               {togglePaidError && <Alert variant="error" title="Erro ao Marcar Pago">{togglePaidError}</Alert>}
             </div>
           </Card>
         </div>

       </div>
    </Container>
  );
}