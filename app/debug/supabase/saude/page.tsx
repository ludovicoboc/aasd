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
import { ArrowLeft, Heart, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, Smile } from 'lucide-react'; // Adicionado Smile
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type MoodLog = {
  id: string;
  created_at: string;
  data: string; // Data do registro
  humor: string; // Ex: 'OTIMO', 'BOM', 'NEUTRO', 'BAIXO', 'RUIM' (baseado no enum MoodOption)
  notas?: string | null;
  userId?: string;
};

// Opções de Humor (baseado no enum MoodOption)
const moodOptions: SelectOption[] = [
  { value: 'OTIMO', label: 'Ótimo (5)' },
  { value: 'BOM', label: 'Bom (4)' },
  { value: 'NEUTRO', label: 'Neutro (3)' },
  { value: 'BAIXO', label: 'Baixo (2)' },
  { value: 'RUIM', label: 'Ruim (1)' },
];

export default function DebugSupabaseSaudePage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD MoodLog
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [moodLogsLoading, setMoodLogsLoading] = useState(false);
  const [moodLogsError, setMoodLogsError] = useState<string | null>(null);
  const [newMoodLevel, setNewMoodLevel] = useState('NEUTRO'); // Valor inicial
  const [newMoodNotes, setNewMoodNotes] = useState('');
  const [createMoodLogLoading, setCreateMoodLogLoading] = useState(false);
  const [createMoodLogError, setCreateMoodLogError] = useState<string | null>(null);
  const [deleteMoodLogLoading, setDeleteMoodLogLoading] = useState<string | null>(null);
  const [deleteMoodLogError, setDeleteMoodLogError] = useState<string | null>(null);

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

  // --- Funções CRUD (MoodLog) ---
  const handleReadMoodLogs = async () => {
    if (!currentUser) { setMoodLogsError("Não autenticado."); return; }
    setMoodLogsLoading(true); setMoodLogsError(null); setMoodLogs([]);
    try {
      const { data, error } = await supabase.from('MoodLog').select('*').eq('userId', currentUser.id).order('data', { ascending: false }).limit(15);
      if (error) throw error;
      setMoodLogs(data || []);
    } catch (error: any) { console.error("Read MoodLogs failed:", error); setMoodLogsError(error.message); }
    finally { setMoodLogsLoading(false); }
  };

  const handleCreateMoodLog = async () => {
    if (!currentUser) { setCreateMoodLogError("Não autenticado."); return; }
    setCreateMoodLogLoading(true); setCreateMoodLogError(null);
    try {
      const newLog = {
        userId: currentUser.id,
        data: new Date().toISOString().split('T')[0], // Data atual
        humor: newMoodLevel,
        notas: newMoodNotes || null,
      };
      const { error } = await supabase.from('MoodLog').insert(newLog);
      if (error) throw error;
      setNewMoodNotes(''); // Reset nota
      await handleReadMoodLogs();
    } catch (error: any) { console.error("Create MoodLog failed:", error); setCreateMoodLogError(error.message); }
    finally { setCreateMoodLogLoading(false); }
  };

  const handleDeleteMoodLog = async (id: string) => {
     if (!id || !confirm(`Deletar registro de humor ${id}?`)) return;
     setDeleteMoodLogLoading(id); setDeleteMoodLogError(null);
     try {
       const { error } = await supabase.from('MoodLog').delete().match({ id: id });
       if (error) throw error;
       await handleReadMoodLogs();
     } catch (error: any) { console.error("Delete MoodLog failed:", error); setDeleteMoodLogError(error.message); }
     finally { setDeleteMoodLogLoading(null); }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadMoodLogs();
    } else {
      setMoodLogs([]);
    }
  }, [currentUser]);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <Heart className="h-7 w-7 text-saude-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Saúde</h1>
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

       {/* CRUD MoodLog */}
       <Card>
         <h2 className="text-xl font-semibold mb-4 flex items-center"><Smile className="mr-2 h-5 w-5"/>Registros de Humor</h2>

         {/* Criar Registro */}
         <div className="mb-4 p-3 border rounded-md space-y-2">
           <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Registro de Humor</h3>
           <div className="flex flex-wrap gap-2 items-end">
             <Select label="Humor" value={newMoodLevel} onChange={(e) => setNewMoodLevel(e.target.value)} options={moodOptions} className="min-w-[120px]" disabled={!currentUser || createMoodLogLoading} />
             <Input label="Notas (Opcional)" value={newMoodNotes} onChange={(e) => setNewMoodNotes(e.target.value)} className="flex-1 min-w-[150px]" disabled={!currentUser || createMoodLogLoading} />
             <Button onClick={handleCreateMoodLog} disabled={!currentUser || createMoodLogLoading}>
               {createMoodLogLoading ? 'Criando...' : 'Adicionar Registro'}
             </Button>
           </div>
           {createMoodLogError && <Alert variant="error" title="Erro">{createMoodLogError}</Alert>}
         </div>

         {/* Listar Registros */}
         <div className="p-3 border rounded-md space-y-2">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Registros Recentes</h3>
             <Button onClick={handleReadMoodLogs} size="sm" variant="outline" disabled={!currentUser || moodLogsLoading}>
               {moodLogsLoading ? 'Buscando...' : 'Recarregar'}
             </Button>
           </div>
           {moodLogsLoading && <p>Carregando...</p>}
           {moodLogsError && <Alert variant="error" title="Erro">{moodLogsError}</Alert>}
           {!moodLogsLoading && !moodLogsError && moodLogs.length === 0 && <p className="text-sm text-gray-500">Nenhum registro de humor.</p>}
           {!moodLogsLoading && !moodLogsError && moodLogs.length > 0 && (
             <ul className="space-y-1 max-h-60 overflow-y-auto">
               {moodLogs.map((log) => (
                 <li key={log.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                   <div>
                     <span className="font-medium">{new Date(log.data).toLocaleDateString()} - {log.humor}</span>
                     {log.notas && <span className="text-xs text-gray-500 ml-1">({log.notas})</span>}
                   </div>
                   <Button onClick={() => handleDeleteMoodLog(log.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteMoodLogLoading === log.id}>
                     {deleteMoodLogLoading === log.id ? '...' : <Trash2 size={14} />}
                   </Button>
                 </li>
               ))}
             </ul>
           )}
           {deleteMoodLogError && <Alert variant="error" title="Erro Deletar">{deleteMoodLogError}</Alert>}
         </div>
       </Card>

       {/* Omitido CRUD Medicamentos por falta de tabela DB clara */}

    </Container>
  );
}