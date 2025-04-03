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
import { ArrowLeft, Bed, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, Bell, Power, PowerOff, Loader2 } from 'lucide-react'; // Adicionado Bell, Power, PowerOff, Loader2
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type SleepRecord = {
  id: string;
  created_at: string;
  inicio: string; // timestampz
  fim?: string | null; // timestampz
  qualidade?: number | null; // 1-5
  notas?: string | null;
  userId?: string;
};

type SleepReminder = {
  id: string;
  created_at: string;
  tipo: 'DORMIR' | 'ACORDAR';
  horario: string; // Ex: "22:00"
  diasSemana: string[]; // Supabase array de strings (ex: ['SEG', 'TER'])
  ativo: boolean;
  userId?: string;
};

// Opções para lembretes
const tipoLembreteOptions: SelectOption[] = [
    { value: 'DORMIR', label: 'Dormir' },
    { value: 'ACORDAR', label: 'Acordar' },
];
const diasSemanaOptions: SelectOption[] = [
    { value: 'DOM', label: 'Dom' }, { value: 'SEG', label: 'Seg' }, { value: 'TER', label: 'Ter' },
    { value: 'QUA', label: 'Qua' }, { value: 'QUI', label: 'Qui' }, { value: 'SEX', label: 'Sex' },
    { value: 'SAB', label: 'Sáb' },
];


export default function DebugSupabaseSonoPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD SleepRecord
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [newRecordStart, setNewRecordStart] = useState(new Date().toISOString().slice(0, 16));
  const [newRecordEnd, setNewRecordEnd] = useState('');
  const [newRecordQuality, setNewRecordQuality] = useState(3);
  const [createRecordLoading, setCreateRecordLoading] = useState(false);
  const [createRecordError, setCreateRecordError] = useState<string | null>(null);
  const [deleteRecordLoading, setDeleteRecordLoading] = useState<string | null>(null);
  const [deleteRecordError, setDeleteRecordError] = useState<string | null>(null);

  // Estados CRUD SleepReminder
  const [sleepReminders, setSleepReminders] = useState<SleepReminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [remindersError, setRemindersError] = useState<string | null>(null);
  const [newReminderType, setNewReminderType] = useState<'DORMIR' | 'ACORDAR'>('ACORDAR');
  const [newReminderTime, setNewReminderTime] = useState('07:30');
  const [newReminderDays, setNewReminderDays] = useState<string[]>(['SEG', 'TER', 'QUA', 'QUI', 'SEX']); // Padrão dias úteis
  const [createReminderLoading, setCreateReminderLoading] = useState(false);
  const [createReminderError, setCreateReminderError] = useState<string | null>(null);
  const [deleteReminderLoading, setDeleteReminderLoading] = useState<string | null>(null);
  const [deleteReminderError, setDeleteReminderError] = useState<string | null>(null);
  const [toggleReminderLoading, setToggleReminderLoading] = useState<string | null>(null);


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

  // --- Funções CRUD (SleepRecord) ---
  const handleReadSleepRecords = async () => {
    if (!currentUser) { setRecordsError("Não autenticado."); return; }
    setRecordsLoading(true); setRecordsError(null); setSleepRecords([]);
    try {
      const { data, error } = await supabase.from('SleepRecord').select('*').eq('userId', currentUser.id).order('inicio', { ascending: false }).limit(10);
      if (error) throw error;
      setSleepRecords(data || []);
    } catch (error: any) { console.error("Read Records failed:", error); setRecordsError(error.message); }
    finally { setRecordsLoading(false); }
  };
  const handleCreateSleepRecord = async () => {
    if (!currentUser) { setCreateRecordError("Não autenticado."); return; }
    if (!newRecordStart) { setCreateRecordError("Data/Hora de início é obrigatória."); return; }
    setCreateRecordLoading(true); setCreateRecordError(null);
    try {
      const newRecord = {
        userId: currentUser.id,
        inicio: new Date(newRecordStart).toISOString(),
        fim: newRecordEnd ? new Date(newRecordEnd).toISOString() : null,
        qualidade: newRecordQuality,
        notas: 'Registro Debug Supabase' // Simplificado
      };
      const { error } = await supabase.from('SleepRecord').insert(newRecord);
      if (error) throw error;
      setNewRecordStart(new Date().toISOString().slice(0, 16)); // Reset
      setNewRecordEnd('');
      setNewRecordQuality(3);
      await handleReadSleepRecords();
    } catch (error: any) { console.error("Create Record failed:", error); setCreateRecordError(error.message); }
    finally { setCreateRecordLoading(false); }
  };
  const handleDeleteSleepRecord = async (id: string) => {
     if (!id || !confirm(`Deletar registro de sono ${id}?`)) return;
     setDeleteRecordLoading(id); setDeleteRecordError(null);
     try {
       const { error } = await supabase.from('SleepRecord').delete().match({ id: id });
       if (error) throw error;
       await handleReadSleepRecords();
     } catch (error: any) { console.error("Delete Record failed:", error); setDeleteRecordError(error.message); }
     finally { setDeleteRecordLoading(null); }
  };

  // --- Funções CRUD (SleepReminder) ---
  const handleReadSleepReminders = async () => {
    if (!currentUser) { setRemindersError("Não autenticado."); return; }
    setRemindersLoading(true); setRemindersError(null); setSleepReminders([]);
    try {
      const { data, error } = await supabase.from('SleepReminder').select('*').eq('userId', currentUser.id).order('horario');
      if (error) throw error;
      setSleepReminders(data || []);
    } catch (error: any) { console.error("Read Reminders failed:", error); setRemindersError(error.message); }
    finally { setRemindersLoading(false); }
  };
  const handleCreateSleepReminder = async () => {
    if (!currentUser) { setCreateReminderError("Não autenticado."); return; }
    if (newReminderDays.length === 0) { setCreateReminderError("Selecione pelo menos um dia da semana."); return; }
    setCreateReminderLoading(true); setCreateReminderError(null);
    try {
      const newReminder = {
        userId: currentUser.id,
        tipo: newReminderType,
        horario: newReminderTime,
        diasSemana: newReminderDays, // Supabase aceita array de strings
        ativo: true // Padrão ativo
      };
      const { error } = await supabase.from('SleepReminder').insert(newReminder);
      if (error) throw error;
      // Não reseta os inputs, pode ser útil criar vários
      await handleReadSleepReminders();
    } catch (error: any) { console.error("Create Reminder failed:", error); setCreateReminderError(error.message); }
    finally { setCreateReminderLoading(false); }
  };
  const handleDeleteSleepReminder = async (id: string) => {
     if (!id || !confirm(`Deletar lembrete ${id}?`)) return;
     setDeleteReminderLoading(id); setDeleteReminderError(null);
     try {
       const { error } = await supabase.from('SleepReminder').delete().match({ id: id });
       if (error) throw error;
       await handleReadSleepReminders();
     } catch (error: any) { console.error("Delete Reminder failed:", error); setDeleteReminderError(error.message); }
     finally { setDeleteReminderLoading(null); }
  };
  const handleToggleReminderActive = async (reminder: SleepReminder) => {
     if (!reminder) return;
     setToggleReminderLoading(reminder.id);
     try {
       const updates = { ativo: !reminder.ativo };
       const { error } = await supabase.from('SleepReminder').update(updates).match({ id: reminder.id });
       if (error) throw error;
       await handleReadSleepReminders();
     } catch (error: any) { console.error("Toggle Reminder failed:", error); /* Adicionar erro? */ }
     finally { setToggleReminderLoading(null); }
  };

  // Handler para seleção múltipla de dias
  const handleDaysChange = (dayValue: string) => {
    setNewReminderDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue) // Remove se já existe
        : [...prev, dayValue] // Adiciona se não existe
    );
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadSleepRecords();
      handleReadSleepReminders();
    } else {
      setSleepRecords([]); setSleepReminders([]);
    }
  }, [currentUser]);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <Bed className="h-7 w-7 text-sono-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Sono</h1>
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

         {/* Coluna 1: Registros de Sono */}
         <Card>
           <h2 className="text-xl font-semibold mb-4 flex items-center"><Bed className="mr-2 h-5 w-5"/>Registros de Sono</h2>
            {/* Criar Registro */}
           <div className="mb-4 p-3 border rounded-md space-y-2">
             <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Registro</h3>
             <div className="grid grid-cols-1 gap-2 mb-2">
               <Input label="Início (Data e Hora)" type="datetime-local" value={newRecordStart} onChange={(e) => setNewRecordStart(e.target.value)} disabled={!currentUser || createRecordLoading} />
               <Input label="Fim (Data e Hora - Opcional)" type="datetime-local" value={newRecordEnd} onChange={(e) => setNewRecordEnd(e.target.value)} disabled={!currentUser || createRecordLoading} />
             </div>
             <div className="flex items-end gap-2">
               <Input label="Qualidade (1-5)" type="number" min="1" max="5" value={newRecordQuality} onChange={(e) => setNewRecordQuality(parseInt(e.target.value) || 3)} className="w-28" disabled={!currentUser || createRecordLoading} />
               <Button onClick={handleCreateSleepRecord} disabled={!currentUser || createRecordLoading || !newRecordStart}>
                 {createRecordLoading ? 'Criando...' : 'Adicionar Registro'}
               </Button>
             </div>
             {createRecordError && <Alert variant="error" title="Erro">{createRecordError}</Alert>}
           </div>
           {/* Listar Registros */}
           <div className="p-3 border rounded-md space-y-2">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Registros Recentes</h3>
               <Button onClick={handleReadSleepRecords} size="sm" variant="outline" disabled={!currentUser || recordsLoading}>
                 {recordsLoading ? 'Buscando...' : 'Recarregar'}
               </Button>
             </div>
             {recordsLoading && <p>Carregando...</p>}
             {recordsError && <Alert variant="error" title="Erro">{recordsError}</Alert>}
             {!recordsLoading && !recordsError && sleepRecords.length === 0 && <p className="text-sm text-gray-500">Nenhum registro.</p>}
             {!recordsLoading && !recordsError && sleepRecords.length > 0 && (
               <ul className="space-y-1 max-h-60 overflow-y-auto">
                 {sleepRecords.map((r) => (
                   <li key={r.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                     <span>
                       {new Date(r.inicio).toLocaleString()} - {r.fim ? new Date(r.fim).toLocaleTimeString() : 'Em andamento'} (Q: {r.qualidade || 'N/A'})
                     </span>
                     <Button onClick={() => handleDeleteSleepRecord(r.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteRecordLoading === r.id}>
                       {deleteRecordLoading === r.id ? '...' : <Trash2 size={14} />}
                     </Button>
                   </li>
                 ))}
               </ul>
             )}
             {deleteRecordError && <Alert variant="error" title="Erro Deletar">{deleteRecordError}</Alert>}
           </div>
         </Card>

         {/* Coluna 2: Lembretes de Sono */}
         <Card>
           <h2 className="text-xl font-semibold mb-4 flex items-center"><Bell className="mr-2 h-5 w-5"/>Lembretes de Sono</h2>
            {/* Criar Lembrete */}
           <div className="mb-4 p-3 border rounded-md space-y-2">
             <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Lembrete</h3>
             <div className="flex flex-wrap gap-2 items-end mb-2">
               <Select label="Tipo" value={newReminderType} onChange={(e) => setNewReminderType(e.target.value as typeof newReminderType)} options={tipoLembreteOptions} className="min-w-[100px]" disabled={!currentUser || createReminderLoading} />
               <Input label="Horário" type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} className="w-28" disabled={!currentUser || createReminderLoading} />
             </div>
             <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dias da Semana</label>
                <div className="flex flex-wrap gap-1">
                    {diasSemanaOptions.map(opt => (
                        <Button
                            key={opt.value}
                            variant={newReminderDays.includes(opt.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDaysChange(opt.value)}
                            className="text-xs px-2 py-1 h-auto"
                            disabled={!currentUser || createReminderLoading}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
             </div>
             <Button onClick={handleCreateSleepReminder} disabled={!currentUser || createReminderLoading || newReminderDays.length === 0}>
               {createReminderLoading ? 'Criando...' : 'Adicionar Lembrete'}
             </Button>
             {createReminderError && <Alert variant="error" title="Erro">{createReminderError}</Alert>}
           </div>
           {/* Listar Lembretes */}
           <div className="p-3 border rounded-md space-y-2">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Lembretes Configurados</h3>
               <Button onClick={handleReadSleepReminders} size="sm" variant="outline" disabled={!currentUser || remindersLoading}>
                 {remindersLoading ? 'Buscando...' : 'Recarregar'}
               </Button>
             </div>
             {remindersLoading && <p>Carregando...</p>}
             {remindersError && <Alert variant="error" title="Erro">{remindersError}</Alert>}
             {!remindersLoading && !remindersError && sleepReminders.length === 0 && <p className="text-sm text-gray-500">Nenhum lembrete.</p>}
             {!remindersLoading && !remindersError && sleepReminders.length > 0 && (
               <ul className="space-y-1 max-h-60 overflow-y-auto">
                 {sleepReminders.map((l) => (
                   <li key={l.id} className="flex justify-between items-center text-sm p-1 bg-gray-50 dark:bg-gray-700 rounded">
                     <span>{l.tipo === 'ACORDAR' ? 'Acordar' : 'Dormir'} às {l.horario} ({l.diasSemana.join(', ')})</span>
                     <div className="flex items-center gap-1">
                       <Button onClick={() => handleToggleReminderActive(l)} variant="ghost" size="sm" className={l.ativo ? "text-green-500 hover:bg-green-100" : "text-gray-500 hover:bg-gray-100"} disabled={toggleReminderLoading === l.id}>
                         {toggleReminderLoading === l.id ? <Loader2 size={14} className="animate-spin"/> : l.ativo ? <Power size={14} /> : <PowerOff size={14} />}
                       </Button>
                       <Button onClick={() => handleDeleteSleepReminder(l.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteReminderLoading === l.id}>
                         {deleteReminderLoading === l.id ? '...' : <Trash2 size={14} />}
                       </Button>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
             {deleteReminderError && <Alert variant="error" title="Erro Deletar">{deleteReminderError}</Alert>}
           </div>
         </Card>

       </div>
    </Container>
  );
}