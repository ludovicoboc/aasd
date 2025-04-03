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
import { ArrowLeft, Home, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, CheckSquare, Square, ListTodo, Clock, Loader2 } from 'lucide-react';
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type DailyPriority = { id: string; created_at: string; texto: string; concluida: boolean; data: string; userId?: string; };
type TimeBlock = { id: string; created_at: string; titulo: string; dataHora: string; categoria: string; completado: boolean; userId?: string; }; // Baseado em Reminder

const categoriaBlocoOptions: SelectOption[] = [
  { value: 'INICIO', label: 'Início' }, { value: 'ALIMENTACAO', label: 'Alimentação' },
  { value: 'ESTUDOS', label: 'Estudos' }, { value: 'SAUDE', label: 'Saúde' },
  { value: 'LAZER', label: 'Lazer' }, { value: 'NENHUMA', label: 'Nenhuma' },
];

export default function DebugSupabaseInicioPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD DailyPriority
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [prioritiesLoading, setPrioritiesLoading] = useState(false);
  const [prioritiesError, setPrioritiesError] = useState<string | null>(null);
  const [newPriorityText, setNewPriorityText] = useState('Prioridade Supabase');
  const [createPriorityLoading, setCreatePriorityLoading] = useState(false);
  const [createPriorityError, setCreatePriorityError] = useState<string | null>(null);
  const [deletePriorityLoading, setDeletePriorityLoading] = useState<string | null>(null);
  const [deletePriorityError, setDeletePriorityError] = useState<string | null>(null);
  const [togglePriorityLoading, setTogglePriorityLoading] = useState<string | null>(null);

  // Estados CRUD TimeBlock (Reminder)
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);
  const [newBlockTime, setNewBlockTime] = useState('10:00');
  const [newBlockActivity, setNewBlockActivity] = useState('Bloco Supabase');
  const [newBlockCategory, setNewBlockCategory] = useState('INICIO');
  const [createBlockLoading, setCreateBlockLoading] = useState(false);
  const [createBlockError, setCreateBlockError] = useState<string | null>(null);
  const [deleteBlockLoading, setDeleteBlockLoading] = useState<string | null>(null);
  const [deleteBlockError, setDeleteBlockError] = useState<string | null>(null);


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

  // --- Funções CRUD (DailyPriority) ---
  const handleReadPriorities = async () => {
    if (!currentUser) { setPrioritiesError("Não autenticado."); return; }
    setPrioritiesLoading(true); setPrioritiesError(null); setPriorities([]);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('DailyPriority').select('*').eq('userId', currentUser.id).eq('data', today).order('created_at');
      if (error) throw error;
      setPriorities(data || []);
    } catch (error: any) { console.error("Read Priorities failed:", error); setPrioritiesError(error.message); }
    finally { setPrioritiesLoading(false); }
  };
  const handleCreatePriority = async () => {
    if (!currentUser) { setCreatePriorityError("Não autenticado."); return; }
    setCreatePriorityLoading(true); setCreatePriorityError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newPriority = { userId: currentUser.id, texto: newPriorityText || 'Nova Prioridade', concluida: false, data: today };
      const { error } = await supabase.from('DailyPriority').insert(newPriority);
      if (error) throw error;
      setNewPriorityText('');
      await handleReadPriorities();
    } catch (error: any) { console.error("Create Priority failed:", error); setCreatePriorityError(error.message); }
    finally { setCreatePriorityLoading(false); }
  };
  const handleDeletePriority = async (id: string) => {
     if (!id || !confirm(`Deletar prioridade ${id}?`)) return;
     setDeletePriorityLoading(id); setDeletePriorityError(null);
     try {
       const { error } = await supabase.from('DailyPriority').delete().match({ id: id });
       if (error) throw error;
       await handleReadPriorities();
     } catch (error: any) { console.error("Delete Priority failed:", error); setDeletePriorityError(error.message); }
     finally { setDeletePriorityLoading(null); }
  };
  const handleTogglePriority = async (priority: DailyPriority) => {
     if (!priority) return;
     setTogglePriorityLoading(priority.id);
     try {
       const updates = { concluida: !priority.concluida };
       const { error } = await supabase.from('DailyPriority').update(updates).match({ id: priority.id });
       if (error) throw error;
       await handleReadPriorities();
     } catch (error: any) { console.error("Toggle Priority failed:", error); /* Adicionar erro? */ }
     finally { setTogglePriorityLoading(null); }
  };

  // --- Funções CRUD (TimeBlock / Reminder) ---
  const handleReadTimeBlocks = async () => {
     if (!currentUser) { setBlocksError("Não autenticado."); return; }
     setBlocksLoading(true); setBlocksError(null); setTimeBlocks([]);
     try {
       const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
       const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
       const { data, error } = await supabase.from('Reminder')
         .select('*')
         .eq('userId', currentUser.id)
         .gte('dataHora', todayStart.toISOString())
         .lte('dataHora', todayEnd.toISOString())
         // .in('categoria', ['INICIO', 'NENHUMA']) // Opcional: Filtrar categorias
         .order('dataHora', { ascending: true });
       if (error) throw error;
       setTimeBlocks((data as TimeBlock[]) || []);
     } catch (error: any) { console.error("Read TimeBlocks failed:", error); setBlocksError(error.message); }
     finally { setBlocksLoading(false); }
  };
  const handleCreateTimeBlock = async () => {
    if (!currentUser) { setCreateBlockError("Não autenticado."); return; }
    setCreateBlockLoading(true); setCreateBlockError(null);
    try {
      const today = new Date();
      const [hours, minutes] = newBlockTime.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const dataHoraISO = today.toISOString();

      const newBlock = {
        userId: currentUser.id,
        titulo: newBlockActivity || 'Novo Bloco',
        dataHora: dataHoraISO,
        categoria: newBlockCategory,
        completado: false,
        recorrente: false
      };
      const { error } = await supabase.from('Reminder').insert(newBlock);
      if (error) throw error;
      setNewBlockActivity('');
      await handleReadTimeBlocks();
    } catch (error: any) { console.error("Create TimeBlock failed:", error); setCreateBlockError(error.message); }
    finally { setCreateBlockLoading(false); }
  };
  const handleDeleteTimeBlock = async (id: string) => {
     if (!id || !confirm(`Deletar bloco ${id}?`)) return;
     setDeleteBlockLoading(id); setDeleteBlockError(null);
     try {
       const { error } = await supabase.from('Reminder').delete().match({ id: id });
       if (error) throw error;
       await handleReadTimeBlocks();
     } catch (error: any) { console.error("Delete TimeBlock failed:", error); setDeleteBlockError(error.message); }
     finally { setDeleteBlockLoading(null); }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadPriorities();
      handleReadTimeBlocks();
    } else {
      setPriorities([]); setTimeBlocks([]);
    }
  }, [currentUser]);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <Home className="h-7 w-7 text-blue-500 mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Início</h1>
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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

         {/* Coluna 1: Prioridades */}
         <Card>
           <h2 className="text-xl font-semibold mb-4 flex items-center"><ListTodo className="mr-2 h-5 w-5"/>Prioridades do Dia</h2>
            {/* Criar Prioridade */}
           <div className="mb-4 p-3 border rounded-md space-y-2">
             <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Nova Prioridade</h3>
             <div className="flex items-end gap-2">
               <Input label="Texto" value={newPriorityText} onChange={(e) => setNewPriorityText(e.target.value)} className="flex-grow" disabled={!currentUser || createPriorityLoading} />
               <Button onClick={handleCreatePriority} disabled={!currentUser || createPriorityLoading || !newPriorityText}>
                 {createPriorityLoading ? 'Criando...' : 'Adicionar'}
               </Button>
             </div>
             {createPriorityError && <Alert variant="error" title="Erro">{createPriorityError}</Alert>}
           </div>
           {/* Listar Prioridades */}
           <div className="p-3 border rounded-md space-y-2">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Prioridades de Hoje</h3>
               <Button onClick={handleReadPriorities} size="sm" variant="outline" disabled={!currentUser || prioritiesLoading}>
                 {prioritiesLoading ? 'Buscando...' : 'Recarregar'}
               </Button>
             </div>
             {prioritiesLoading && <p>Carregando...</p>}
             {prioritiesError && <Alert variant="error" title="Erro">{prioritiesError}</Alert>}
             {!prioritiesLoading && !prioritiesError && priorities.length === 0 && <p className="text-sm text-gray-500">Nenhuma prioridade para hoje.</p>}
             {!prioritiesLoading && !prioritiesError && priorities.length > 0 && (
               <ul className="space-y-1 max-h-40 overflow-y-auto">
                 {priorities.map((p) => (
                   <li key={p.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                     <span className="flex items-center gap-1">
                       <Button onClick={() => handleTogglePriority(p)} variant="ghost" size="sm" className="p-0 h-auto" disabled={togglePriorityLoading === p.id}>
                         {togglePriorityLoading === p.id ? <Loader2 size={14} className="animate-spin"/> : p.concluida ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                       </Button>
                       <span className={p.concluida ? 'line-through text-gray-500' : ''}>{p.texto}</span>
                     </span>
                     <Button onClick={() => handleDeletePriority(p.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deletePriorityLoading === p.id}>
                       {deletePriorityLoading === p.id ? '...' : <Trash2 size={14} />}
                     </Button>
                   </li>
                 ))}
               </ul>
             )}
             {deletePriorityError && <Alert variant="error" title="Erro Deletar">{deletePriorityError}</Alert>}
           </div>
         </Card>

         {/* Coluna 2: Blocos de Tempo (Reminders) */}
         <Card>
           <h2 className="text-xl font-semibold mb-4 flex items-center"><Clock className="mr-2 h-5 w-5"/>Blocos de Tempo</h2>
            {/* Criar Bloco */}
           <div className="mb-4 p-3 border rounded-md space-y-2">
             <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Bloco</h3>
             <div className="flex flex-wrap gap-2 items-end">
               <Input label="Hora" type="time" value={newBlockTime} onChange={(e) => setNewBlockTime(e.target.value)} className="w-28" disabled={!currentUser || createBlockLoading} />
               <Input label="Atividade" value={newBlockActivity} onChange={(e) => setNewBlockActivity(e.target.value)} className="flex-1 min-w-[100px]" disabled={!currentUser || createBlockLoading} />
               <Select label="Categoria" value={newBlockCategory} onChange={(e) => setNewBlockCategory(e.target.value)} options={categoriaBlocoOptions} className="min-w-[100px]" disabled={!currentUser || createBlockLoading} />
               <Button onClick={handleCreateTimeBlock} size="sm" icon={<Plus size={14}/>} disabled={!currentUser || createBlockLoading || !newBlockActivity || !newBlockTime}>
                 {createBlockLoading ? 'Criando...' : 'Add Bloco'}
               </Button>
             </div>
             {createBlockError && <Alert variant="error" title="Erro">{createBlockError}</Alert>}
           </div>
           {/* Listar Blocos */}
           <div className="p-3 border rounded-md space-y-2">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Blocos de Hoje</h3>
               <Button onClick={handleReadTimeBlocks} size="sm" variant="outline" disabled={!currentUser || blocksLoading}>
                 {blocksLoading ? 'Buscando...' : 'Recarregar'}
               </Button>
             </div>
             {blocksLoading && <p>Carregando...</p>}
             {blocksError && <Alert variant="error" title="Erro">{blocksError}</Alert>}
             {!blocksLoading && !blocksError && timeBlocks.length === 0 && <p className="text-sm text-gray-500">Nenhum bloco para hoje.</p>}
             {!blocksLoading && !blocksError && timeBlocks.length > 0 && (
               <ul className="space-y-1 max-h-60 overflow-y-auto">
                 {timeBlocks.map((b) => (
                   <li key={b.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                     <span>{new Date(b.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {b.titulo} ({b.categoria})</span>
                     <Button onClick={() => handleDeleteTimeBlock(b.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteBlockLoading === b.id}>
                       {deleteBlockLoading === b.id ? '...' : <Trash2 size={14} />}
                     </Button>
                   </li>
                 ))}
               </ul>
             )}
             {deleteBlockError && <Alert variant="error" title="Erro Deletar">{deleteBlockError}</Alert>}
           </div>
         </Card>

       </div>
    </Container>
  );
}