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
import { ArrowLeft, Smile, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, CheckSquare, Square, ListChecks, Loader2 } from 'lucide-react'; // Adicionado ListChecks, Loader2
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type LazerActivity = {
  id: string;
  created_at: string;
  nome: string;
  descricao?: string | null;
  duracao: number; // Em minutos
  categoria: string; // Ex: 'ATIVO', 'PASSIVO', 'CRIATIVO', 'SOCIAL'
  // Adicionar 'concluida' e 'data' se existirem no schema Supabase para LazerActivity
  // concluida?: boolean;
  // data?: string;
  userId?: string;
};

// Opções de categoria (baseado em LazerActivityCategory enum)
const categoriaLazerOptions: SelectOption[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'PASSIVO', label: 'Passivo' },
  { value: 'CRIATIVO', label: 'Criativo' },
  { value: 'SOCIAL', label: 'Social' },
];

export default function DebugSupabaseLazerPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD LazerActivity
  const [activities, setActivities] = useState<LazerActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [newActivityName, setNewActivityName] = useState('Atividade Lazer Supabase');
  const [newActivityDuration, setNewActivityDuration] = useState(30);
  const [newActivityCategory, setNewActivityCategory] = useState('PASSIVO');
  const [createActivityLoading, setCreateActivityLoading] = useState(false);
  const [createActivityError, setCreateActivityError] = useState<string | null>(null);
  const [deleteActivityLoading, setDeleteActivityLoading] = useState<string | null>(null);
  const [deleteActivityError, setDeleteActivityError] = useState<string | null>(null);
  // const [toggleCompleteLoading, setToggleCompleteLoading] = useState<string | null>(null); // Se houver campo 'concluida'

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

  // --- Funções CRUD (LazerActivity) ---
  const handleReadActivities = async () => {
    if (!currentUser) { setActivitiesError("Não autenticado."); return; }
    setActivitiesLoading(true); setActivitiesError(null); setActivities([]);
    try {
      const { data, error } = await supabase.from('LazerActivity').select('*').eq('userId', currentUser.id).order('created_at', { ascending: false });
      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) { console.error("Read Activities failed:", error); setActivitiesError(error.message); }
    finally { setActivitiesLoading(false); }
  };

  const handleCreateActivity = async () => {
    if (!currentUser) { setCreateActivityError("Não autenticado."); return; }
    setCreateActivityLoading(true); setCreateActivityError(null);
    try {
      const newActivity = {
        userId: currentUser.id,
        nome: newActivityName || 'Nova Atividade',
        duracao: newActivityDuration,
        categoria: newActivityCategory,
        // concluida: false, // Se existir
        // data: new Date().toISOString().split('T')[0] // Se existir
      };
      const { error } = await supabase.from('LazerActivity').insert(newActivity);
      if (error) throw error;
      setNewActivityName(''); setNewActivityDuration(30); // Reset
      await handleReadActivities();
    } catch (error: any) { console.error("Create Activity failed:", error); setCreateActivityError(error.message); }
    finally { setCreateActivityLoading(false); }
  };

  const handleDeleteActivity = async (id: string) => {
     if (!id || !confirm(`Deletar atividade ${id}?`)) return;
     setDeleteActivityLoading(id); setDeleteActivityError(null);
     try {
       const { error } = await supabase.from('LazerActivity').delete().match({ id: id });
       if (error) throw error;
       await handleReadActivities();
     } catch (error: any) { console.error("Delete Activity failed:", error); setDeleteActivityError(error.message); }
     finally { setDeleteActivityLoading(null); }
  };

  // const handleToggleCompleteActivity = async (activity: LazerActivity) => { /* ... Implementar update (concluida) se existir ... */ };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadActivities();
    } else {
      setActivities([]);
    }
  }, [currentUser]);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <Smile className="h-7 w-7 text-lazer-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Lazer</h1>
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

       {/* CRUD LazerActivity */}
       <Card>
         <h2 className="text-xl font-semibold mb-4 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Atividades de Lazer</h2>

         {/* Criar Atividade */}
         <div className="mb-4 p-3 border rounded-md space-y-2">
           <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Nova Atividade</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
             <Input label="Nome" value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)} className="md:col-span-2" disabled={!currentUser || createActivityLoading} />
             <Input label="Duração (min)" type="number" value={newActivityDuration} onChange={(e) => setNewActivityDuration(parseInt(e.target.value) || 30)} disabled={!currentUser || createActivityLoading} />
             <Select label="Categoria" value={newActivityCategory} onChange={(e) => setNewActivityCategory(e.target.value)} options={categoriaLazerOptions} disabled={!currentUser || createActivityLoading} />
           </div>
           <Button onClick={handleCreateActivity} disabled={!currentUser || createActivityLoading || !newActivityName || newActivityDuration <= 0}>
             {createActivityLoading ? 'Criando...' : 'Adicionar Atividade'}
           </Button>
           {createActivityError && <Alert variant="error" title="Erro">{createActivityError}</Alert>}
         </div>

         {/* Listar Atividades */}
         <div className="p-3 border rounded-md space-y-2">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Atividades Registradas</h3>
             <Button onClick={handleReadActivities} size="sm" variant="outline" disabled={!currentUser || activitiesLoading}>
               {activitiesLoading ? 'Buscando...' : 'Recarregar'}
             </Button>
           </div>
           {activitiesLoading && <p>Carregando...</p>}
           {activitiesError && <Alert variant="error" title="Erro">{activitiesError}</Alert>}
           {!activitiesLoading && !activitiesError && activities.length === 0 && <p className="text-sm text-gray-500">Nenhuma atividade.</p>}
           {!activitiesLoading && !activitiesError && activities.length > 0 && (
             <ul className="space-y-1 max-h-60 overflow-y-auto">
               {activities.map((a) => (
                 <li key={a.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                   <div className="flex items-center gap-2">
                     {/* Adicionar botão de toggle concluída se existir no schema */}
                     {/* <Button onClick={() => handleToggleCompleteActivity(a)} variant="ghost" size="sm" className="p-0 h-auto" disabled={toggleCompleteLoading === a.id}>
                       {toggleCompleteLoading === a.id ? <Loader2 size={14} className="animate-spin"/> : a.concluida ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                     </Button> */}
                     <span>{a.nome} ({a.duracao} min) - [{a.categoria}]</span>
                   </div>
                   <Button onClick={() => handleDeleteActivity(a.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteActivityLoading === a.id}>
                     {deleteActivityLoading === a.id ? '...' : <Trash2 size={14} />}
                   </Button>
                 </li>
               ))}
             </ul>
           )}
           {deleteActivityError && <Alert variant="error" title="Erro Deletar">{deleteActivityError}</Alert>}
         </div>
       </Card>

    </Container>
  );
}