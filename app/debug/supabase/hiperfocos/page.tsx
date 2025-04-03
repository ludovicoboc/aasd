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
import { ArrowLeft, Rocket, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, CheckSquare, Square, PlusCircle, ListTree, Loader2, XCircle } from 'lucide-react'; // Adicionado Loader2 e XCircle
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type Hyperfocus = { id: string; created_at: string; titulo: string; descricao?: string | null; cor?: string; tempoLimite?: number | null; userId?: string; };
type HyperfocusTask = { id: string; created_at: string; texto: string; concluida: boolean; cor?: string | null; hyperfocusId: string; parentId?: string | null; userId?: string; };
type AlternatingSession = { id: string; created_at: string; titulo: string; currentHyperfocusId?: string | null; previousHyperfocusId?: string | null; startTime: string; estimatedDuration: number; completed: boolean; userId?: string; currentFocus?: { titulo: string }; previousFocus?: { titulo: string } }; // Adicionado joins

export default function DebugSupabaseHiperfocosPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD Hyperfocus
  const [hyperfocuses, setHyperfocuses] = useState<Hyperfocus[]>([]);
  const [hyperfocusesLoading, setHyperfocusesLoading] = useState(false);
  const [hyperfocusesError, setHyperfocusesError] = useState<string | null>(null);
  const [newHyperfocusTitle, setNewHyperfocusTitle] = useState('Hiperfoco Supabase');
  const [createHyperfocusLoading, setCreateHyperfocusLoading] = useState(false);
  const [createHyperfocusError, setCreateHyperfocusError] = useState<string | null>(null);
  const [deleteHyperfocusLoading, setDeleteHyperfocusLoading] = useState<string | null>(null);
  const [deleteHyperfocusError, setDeleteHyperfocusError] = useState<string | null>(null);
  const hyperfocusOptions: SelectOption[] = hyperfocuses.map(h => ({ value: h.id, label: h.titulo }));

  // Estados CRUD HyperfocusTask
  const [tasks, setTasks] = useState<HyperfocusTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [newSubTaskText, setNewSubTaskText] = useState<Record<string, string>>({});
  const [createTaskLoading, setCreateTaskLoading] = useState<string | null>(null);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);
  const [deleteTaskLoading, setDeleteTaskLoading] = useState<string | null>(null);
  const [deleteTaskError, setDeleteTaskError] = useState<string | null>(null);
  const [toggleTaskLoading, setToggleTaskLoading] = useState<string | null>(null);

  // Estados CRUD AlternatingSession
  const [sessions, setSessions] = useState<AlternatingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState('Sessão Supabase');
  const [newSessionDuration, setNewSessionDuration] = useState(60);
  const [newSessionHyperfocusId, setNewSessionHyperfocusId] = useState('');
  const [createSessionLoading, setCreateSessionLoading] = useState(false);
  const [createSessionError, setCreateSessionError] = useState<string | null>(null);
  const [deleteSessionLoading, setDeleteSessionLoading] = useState<string | null>(null);
  const [deleteSessionError, setDeleteSessionError] = useState<string | null>(null);
  const [toggleSessionLoading, setToggleSessionLoading] = useState<string | null>(null);
  const [toggleSessionError, setToggleSessionError] = useState<string | null>(null);
  const [alternateFocusId, setAlternateFocusId] = useState<string | null>(null); // Para o select de alternância


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

  // --- Funções CRUD (Hyperfocus) ---
  const handleReadHyperfocuses = async () => {
    if (!currentUser) { setHyperfocusesError("Não autenticado."); return; }
    setHyperfocusesLoading(true); setHyperfocusesError(null); setHyperfocuses([]);
    try {
      const { data, error } = await supabase.from('Hyperfocus').select('*').eq('userId', currentUser.id).order('created_at');
      if (error) throw error;
      setHyperfocuses(data || []);
      if (data && data.length > 0 && !newSessionHyperfocusId) {
        setNewSessionHyperfocusId(data[0].id);
      } else if (!data || data.length === 0) {
        setNewSessionHyperfocusId('');
      }
    } catch (error: any) { console.error("Read Hyperfocuses failed:", error); setHyperfocusesError(error.message); }
    finally { setHyperfocusesLoading(false); }
  };
  const handleCreateHyperfocus = async () => {
    if (!currentUser) { setCreateHyperfocusError("Não autenticado."); return; }
    setCreateHyperfocusLoading(true); setCreateHyperfocusError(null);
    try {
      const newFocus = { userId: currentUser.id, titulo: newHyperfocusTitle || 'Novo Hiperfoco', cor: '#CCCCCC' }; // Valores padrão
      const { error } = await supabase.from('Hyperfocus').insert(newFocus);
      if (error) throw error;
      setNewHyperfocusTitle('');
      await handleReadHyperfocuses();
    } catch (error: any) { console.error("Create Hyperfocus failed:", error); setCreateHyperfocusError(error.message); }
    finally { setCreateHyperfocusLoading(false); }
  };
  const handleDeleteHyperfocus = async (id: string) => {
     if (!id || !confirm(`Deletar hiperfoco ${id}? Isso deletará tarefas e sessões associadas (se configurado no DB).`)) return;
     setDeleteHyperfocusLoading(id); setDeleteHyperfocusError(null);
     try {
       // CUIDADO: Deletar um hiperfoco pode falhar ou causar deleção em cascata.
       const { error } = await supabase.from('Hyperfocus').delete().match({ id: id });
       if (error) throw error;
       await handleReadHyperfocuses(); // Recarrega hiperfocos
       await handleReadTasks(); // Recarrega tarefas (as associadas devem sumir)
       await handleReadSessions(); // Recarrega sessões
     } catch (error: any) { console.error("Delete Hyperfocus failed:", error); setDeleteHyperfocusError(error.message); }
     finally { setDeleteHyperfocusLoading(null); }
  };

  // --- Funções CRUD (HyperfocusTask) ---
  const handleReadTasks = async () => {
    if (!currentUser) { setTasksError("Não autenticado."); return; }
    setTasksLoading(true); setTasksError(null); setTasks([]);
    try {
      const { data, error } = await supabase.from('HyperfocusTask').select('*').eq('userId', currentUser.id).order('created_at');
      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) { console.error("Read Tasks failed:", error); setTasksError(error.message); }
    finally { setTasksLoading(false); }
  };
  const handleCreateTask = async (hyperfocusId: string, parentId?: string) => {
    if (!currentUser) { setCreateTaskError("Não autenticado."); return; }
    const text = parentId ? newSubTaskText[parentId] : newTaskText[hyperfocusId];
    if (!text) { setCreateTaskError("Texto da tarefa não pode ser vazio."); return; }
    const loadingKey = parentId || hyperfocusId;
    setCreateTaskLoading(loadingKey); setCreateTaskError(null);
    try {
      const newTask = { userId: currentUser.id, hyperfocusId: hyperfocusId, parentId: parentId || null, texto: text, concluida: false };
      const { error } = await supabase.from('HyperfocusTask').insert(newTask);
      if (error) throw error;
      if (parentId) { setNewSubTaskText(prev => ({ ...prev, [parentId]: '' })); }
      else { setNewTaskText(prev => ({ ...prev, [hyperfocusId]: '' })); }
      await handleReadTasks();
    } catch (error: any) { console.error("Create Task failed:", error); setCreateTaskError(error.message); }
    finally { setCreateTaskLoading(null); }
  };
  const handleDeleteTask = async (taskId: string) => {
     if (!taskId || !confirm(`Deletar tarefa ${taskId}? Sub-tarefas também serão deletadas (se configurado no DB).`)) return;
     setDeleteTaskLoading(taskId); setDeleteTaskError(null);
     try {
       // CUIDADO: Deleção em cascata pode ocorrer.
       const { error } = await supabase.from('HyperfocusTask').delete().match({ id: taskId });
       if (error) throw error;
       await handleReadTasks();
     } catch (error: any) { console.error("Delete Task failed:", error); setDeleteTaskError(error.message); }
     finally { setDeleteTaskLoading(null); }
  };
  const handleToggleTask = async (task: HyperfocusTask) => {
     if (!task) return;
     setToggleTaskLoading(task.id);
     try {
       const updates = { concluida: !task.concluida };
       const { error } = await supabase.from('HyperfocusTask').update(updates).match({ id: task.id });
       if (error) throw error;
       await handleReadTasks();
     } catch (error: any) { console.error("Toggle Task failed:", error); /* Adicionar erro específico? */ }
     finally { setToggleTaskLoading(null); }
  };

  // --- Funções CRUD (AlternatingSession) ---
  const handleReadSessions = async () => {
    if (!currentUser) { setSessionsError("Não autenticado."); return; }
    setSessionsLoading(true); setSessionsError(null); setSessions([]);
    try {
      // Join para pegar nomes dos hiperfocos
      const { data, error } = await supabase
        .from('AlternatingSession')
        .select('*, currentFocus:Hyperfocus!AlternatingSession_currentHyperfocusIdToHyperfocus(titulo), previousFocus:Hyperfocus!AlternatingSession_previousHyperfocusIdToHyperfocus(titulo)')
        .eq('userId', currentUser.id)
        .order('startTime', { ascending: false });
      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) { console.error("Read Sessions failed:", error); setSessionsError(error.message); }
    finally { setSessionsLoading(false); }
  };
  const handleCreateSession = async () => {
    if (!currentUser) { setCreateSessionError("Não autenticado."); return; }
    if (!newSessionHyperfocusId) { setCreateSessionError("Selecione um hiperfoco inicial."); return; }
    setCreateSessionLoading(true); setCreateSessionError(null);
    try {
      const newSession = {
        userId: currentUser.id,
        titulo: newSessionTitle || 'Nova Sessão',
        currentHyperfocusId: newSessionHyperfocusId,
        startTime: new Date().toISOString(),
        estimatedDuration: newSessionDuration,
        completed: false
      };
      const { error } = await supabase.from('AlternatingSession').insert(newSession);
      if (error) throw error;
      setNewSessionTitle(''); setNewSessionDuration(60); // Reset
      await handleReadSessions();
    } catch (error: any) { console.error("Create Session failed:", error); setCreateSessionError(error.message); }
    finally { setCreateSessionLoading(false); }
  };
  const handleDeleteSession = async (id: string) => {
     if (!id || !confirm(`Deletar sessão ${id}?`)) return;
     setDeleteSessionLoading(id); setDeleteSessionError(null);
     try {
       const { error } = await supabase.from('AlternatingSession').delete().match({ id: id });
       if (error) throw error;
       await handleReadSessions();
     } catch (error: any) { console.error("Delete Session failed:", error); setDeleteSessionError(error.message); }
     finally { setDeleteSessionLoading(null); }
  };
  const handleToggleSessionComplete = async (session: AlternatingSession) => {
     if (!session) return;
     setToggleSessionLoading(session.id); setToggleSessionError(null);
     try {
       const updates = { completed: !session.completed };
       const { error } = await supabase.from('AlternatingSession').update(updates).match({ id: session.id });
       if (error) throw error;
       await handleReadSessions();
     } catch (error: any) { console.error("Toggle Session Complete failed:", error); setToggleSessionError(error.message); }
     finally { setToggleSessionLoading(null); }
  };
  const handleAlternateFocus = async (sessionId: string, newFocusId: string) => {
     if (!sessionId || !newFocusId) return;
     const currentSession = sessions.find(s => s.id === sessionId);
     if (!currentSession) return;
     setToggleSessionLoading(sessionId); setToggleSessionError(null);
     try {
       const updates = {
         previousHyperfocusId: currentSession.currentHyperfocusId,
         currentHyperfocusId: newFocusId
       };
       const { error } = await supabase.from('AlternatingSession').update(updates).match({ id: sessionId });
       if (error) throw error;
       setAlternateFocusId(null); // Reset select
       await handleReadSessions();
     } catch (error: any) { console.error("Alternate Focus failed:", error); setToggleSessionError(error.message); }
     finally { setToggleSessionLoading(null); }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadHyperfocuses();
      handleReadTasks();
      handleReadSessions();
    } else {
      setHyperfocuses([]); setTasks([]); setSessions([]);
    }
  }, [currentUser]);

  // Funções auxiliares para renderização de tarefas aninhadas
  const getTasksByHyperfocus = (hyperfocusId: string) => tasks.filter(t => t.hyperfocusId === hyperfocusId && !t.parentId);
  const getSubTasksByTask = (taskId: string) => tasks.filter(t => t.parentId === taskId);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <Rocket className="h-7 w-7 text-hiperfocos-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Hiperfocos</h1>
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

         {/* Coluna 1: Hiperfocos e Tarefas */}
         <div className="space-y-6">
           {/* CRUD Hyperfocus */}
           <Card>
             <h2 className="text-xl font-semibold mb-4 flex items-center"><Rocket className="mr-2 h-5 w-5"/>Hiperfocos</h2>
             {/* Criar Hiperfoco */}
             <div className="mb-4 p-3 border rounded-md space-y-2">
                <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Hiperfoco</h3>
                <div className="flex items-end gap-2">
                  <Input label="Título" value={newHyperfocusTitle} onChange={(e) => setNewHyperfocusTitle(e.target.value)} className="flex-grow" disabled={!currentUser || createHyperfocusLoading} />
                  <Button onClick={handleCreateHyperfocus} disabled={!currentUser || createHyperfocusLoading || !newHyperfocusTitle}>
                    {createHyperfocusLoading ? 'Criando...' : 'Criar'}
                  </Button>
                </div>
                {createHyperfocusError && <Alert variant="error" title="Erro">{createHyperfocusError}</Alert>}
             </div>
             {/* Listar Hiperfocos e Tarefas */}
             <div className="p-3 border rounded-md space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Hiperfocos e Tarefas</h3>
                  <Button onClick={() => { handleReadHyperfocuses(); handleReadTasks(); }} size="sm" variant="outline" disabled={!currentUser || hyperfocusesLoading || tasksLoading}>
                    {hyperfocusesLoading || tasksLoading ? 'Buscando...' : 'Recarregar'}
                  </Button>
                </div>
                {hyperfocusesLoading && <p>Carregando hiperfocos...</p>}
                {hyperfocusesError && <Alert variant="error" title="Erro Hiperfocos">{hyperfocusesError}</Alert>}
                {tasksLoading && <p>Carregando tarefas...</p>}
                {tasksError && <Alert variant="error" title="Erro Tarefas">{tasksError}</Alert>}

                {!hyperfocusesLoading && !hyperfocusesError && hyperfocuses.length === 0 && <p className="text-sm text-gray-500">Nenhum hiperfoco.</p>}
                {!hyperfocusesLoading && !hyperfocusesError && hyperfocuses.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {hyperfocuses.map((h) => (
                      <Card key={h.id} className="p-2 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm" style={{ color: h.cor || '#CCCCCC' }}>■ {h.titulo}</span>
                          <Button onClick={() => handleDeleteHyperfocus(h.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteHyperfocusLoading === h.id}>
                            {deleteHyperfocusLoading === h.id ? '...' : <Trash2 size={14} />}
                          </Button>
                        </div>
                        {/* Adicionar Tarefa */}
                        <div className="flex gap-1 items-end mb-1 pl-2">
                           <Input placeholder="Nova tarefa..." value={newTaskText[h.id] || ''} onChange={(e) => setNewTaskText(prev => ({...prev, [h.id]: e.target.value}))} className="flex-1 text-xs" disabled={!currentUser || createTaskLoading === h.id} />
                           <Button onClick={() => handleCreateTask(h.id)} size="sm" variant="outline" icon={<PlusCircle size={12}/>} disabled={!currentUser || createTaskLoading === h.id || !newTaskText[h.id]} className="text-xs">
                             {createTaskLoading === h.id ? '...' : 'Add'}
                           </Button>
                         </div>
                         {/* Listar Tarefas */}
                         <div className="pl-2 space-y-1">
                           {getTasksByHyperfocus(h.id).map(task => (
                             <div key={task.id} className="border-l-2 pl-1 border-gray-200 dark:border-gray-700">
                               <div className="flex justify-between items-center text-sm">
                                 <span className="flex items-center gap-1">
                                   <Button onClick={() => handleToggleTask(task)} variant="ghost" size="sm" className="p-0 h-auto" disabled={toggleTaskLoading === task.id}>
                                     {toggleTaskLoading === task.id ? <Loader2 size={14} className="animate-spin"/> : task.concluida ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                                   </Button>
                                   <span className={task.concluida ? 'line-through text-gray-500' : ''}>{task.texto}</span>
                                 </span>
                                 <Button onClick={() => handleDeleteTask(task.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteTaskLoading === task.id}>
                                   {deleteTaskLoading === task.id ? '...' : <Trash2 size={14} />}
                                 </Button>
                               </div>
                               {/* Adicionar/Listar Sub-tarefas */}
                               <div className="flex gap-1 items-end mt-0 mb-0 pl-4">
                                  <Input placeholder="Nova sub-tarefa..." value={newSubTaskText[task.id] || ''} onChange={(e) => setNewSubTaskText(prev => ({...prev, [task.id]: e.target.value}))} className="flex-1 text-xs" disabled={!currentUser || createTaskLoading === task.id} />
                                  <Button onClick={() => handleCreateTask(h.id, task.id)} size="sm" variant="ghost" icon={<PlusCircle size={10}/>} disabled={!currentUser || createTaskLoading === task.id || !newSubTaskText[task.id]} className="text-xs">
                                    {createTaskLoading === task.id ? '...' : 'Add Sub'}
                                  </Button>
                                </div>
                               <div className="pl-4 space-y-0">
                                 {getSubTasksByTask(task.id).map(sub => (
                                    <div key={sub.id} className="flex justify-between items-center text-xs">
                                      <span className="flex items-center gap-1">
                                        <Button onClick={() => handleToggleTask(sub)} variant="ghost" size="sm" className="p-0 h-auto" disabled={toggleTaskLoading === sub.id}>
                                          {toggleTaskLoading === sub.id ? <Loader2 size={12} className="animate-spin"/> : sub.concluida ? <CheckSquare size={12} className="text-green-500"/> : <Square size={12} />}
                                        </Button>
                                        <span className={sub.concluida ? 'line-through text-gray-500' : ''}>{sub.texto}</span>
                                      </span>
                                      <Button onClick={() => handleDeleteTask(sub.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteTaskLoading === sub.id}>
                                        {deleteTaskLoading === sub.id ? '...' : <Trash2 size={12} />}
                                      </Button>
                                    </div>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                      </Card>
                    ))}
                  </div>
                )}
                {deleteHyperfocusError && <Alert variant="error" title="Erro Deletar Hiperfoco">{deleteHyperfocusError}</Alert>}
                {createTaskError && <Alert variant="error" title="Erro Criar Tarefa">{createTaskError}</Alert>}
                {deleteTaskError && <Alert variant="error" title="Erro Deletar Tarefa">{deleteTaskError}</Alert>}
             </div>
           </Card>
         </div>

         {/* Coluna 2: Sessões de Alternância */}
         <div className="space-y-6">
           {/* CRUD AlternatingSession */}
           <Card>
             <h2 className="text-xl font-semibold mb-4 flex items-center"><RefreshCcw className="mr-2 h-5 w-5"/>Sessões de Alternância</h2>
              {/* Criar Sessão */}
             <div className="mb-4 p-3 border rounded-md space-y-2">
               <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Nova Sessão</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                 <Input label="Título" value={newSessionTitle} onChange={(e) => setNewSessionTitle(e.target.value)} disabled={!currentUser || createSessionLoading} />
                 <Input label="Duração (min)" type="number" value={newSessionDuration} onChange={(e) => setNewSessionDuration(parseInt(e.target.value) || 60)} disabled={!currentUser || createSessionLoading} />
                 <Select label="Hiperfoco Inicial" value={newSessionHyperfocusId} onChange={(e) => setNewSessionHyperfocusId(e.target.value)} options={hyperfocusOptions} disabled={!currentUser || createSessionLoading || hyperfocuses.length === 0} />
               </div>
               <Button onClick={handleCreateSession} disabled={!currentUser || createSessionLoading || !newSessionHyperfocusId || !newSessionTitle}>
                 {createSessionLoading ? 'Criando...' : 'Criar Sessão'}
               </Button>
               {createSessionError && <Alert variant="error" title="Erro">{createSessionError}</Alert>}
               {hyperfocuses.length === 0 && <p className="text-xs text-red-500">Crie um hiperfoco primeiro.</p>}
             </div>
             {/* Listar Sessões */}
             <div className="p-3 border rounded-md space-y-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Sessões Ativas/Concluídas</h3>
                 <Button onClick={handleReadSessions} size="sm" variant="outline" disabled={!currentUser || sessionsLoading}>
                   {sessionsLoading ? 'Buscando...' : 'Recarregar'}
                 </Button>
               </div>
               {sessionsLoading && <p>Carregando...</p>}
               {sessionsError && <Alert variant="error" title="Erro">{sessionsError}</Alert>}
               {!sessionsLoading && !sessionsError && sessions.length === 0 && <p className="text-sm text-gray-500">Nenhuma sessão.</p>}
               {!sessionsLoading && !sessionsError && sessions.length > 0 && (
                 <ul className="space-y-2 max-h-96 overflow-y-auto">
                   {sessions.map((s) => (
                     <li key={s.id} className={`p-2 rounded ${s.completed ? 'bg-gray-100 dark:bg-gray-800 opacity-70' : 'bg-gray-50 dark:bg-gray-700'}`}>
                       <div className="flex justify-between items-center text-sm mb-1">
                         <span className="font-medium">{s.titulo} {s.completed ? '(Concluída)' : ''}</span>
                         <div className="flex items-center gap-1">
                           <Button onClick={() => handleToggleSessionComplete(s)} variant="ghost" size="sm" className={s.completed ? "text-gray-500 hover:bg-gray-200" : "text-green-500 hover:bg-green-100"} disabled={toggleSessionLoading === s.id} aria-label={s.completed ? `Marcar ${s.titulo} como ativa` : `Marcar ${s.titulo} como concluída`}>
                             {toggleSessionLoading === s.id ? '...' : s.completed ? <XCircle size={14} /> : <CheckCircle size={14} />}
                           </Button>
                           <Button onClick={() => handleDeleteSession(s.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteSessionLoading === s.id}>
                             {deleteSessionLoading === s.id ? '...' : <Trash2 size={14} />}
                           </Button>
                         </div>
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-400">
                         Atual: {s.currentFocus?.titulo || 'N/A'} | Anterior: {s.previousFocus?.titulo || 'N/A'} | Início: {new Date(s.startTime).toLocaleTimeString()} | Duração: {s.estimatedDuration} min
                       </p>
                       {/* Alternar Foco */}
                       {!s.completed && (
                         <div className="flex gap-1 items-center mt-1">
                           <Select value={alternateFocusId === s.id ? alternateFocusId : ''} onChange={(e) => setAlternateFocusId(e.target.value)} options={hyperfocusOptions.filter(opt => opt.value !== s.currentHyperfocusId)} className="flex-1 text-xs" disabled={toggleSessionLoading === s.id || hyperfocuses.length < 2}>
                             <option value="">Alternar para...</option>
                           </Select>
                           <Button onClick={() => handleAlternateFocus(s.id, alternateFocusId!)} size="sm" variant="outline" disabled={toggleSessionLoading === s.id || !alternateFocusId || alternateFocusId === s.currentHyperfocusId} className="text-xs">
                             {toggleSessionLoading === s.id ? '...' : 'Alternar'}
                           </Button>
                         </div>
                       )}
                     </li>
                   ))}
                 </ul>
               )}
               {deleteSessionError && <Alert variant="error" title="Erro Deletar Sessão">{deleteSessionError}</Alert>}
               {toggleSessionError && <Alert variant="error" title="Erro Ação Sessão">{toggleSessionError}</Alert>}
             </div>
           </Card>
         </div>

       </div>
    </Container>
  );
}