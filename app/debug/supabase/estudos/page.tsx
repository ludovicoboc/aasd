'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { Select, SelectOption } from '@/app/components/ui/Select';
import { Card } from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { ArrowLeft, BookOpen, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2, CheckSquare, Square, Loader2 } from 'lucide-react'; // Adicionado Loader2
import { Session, User } from '@supabase/supabase-js';

// Tipos simplificados (ajustar conforme schema real)
type StudySession = {
  id: string;
  created_at: string;
  inicio: string; // Supabase timestampz
  fim?: string | null;
  materia: string;
  tecnica?: string | null; // Ex: 'POMODORO', 'BLOCOS', 'LIVRE'
  produtividade?: number | null; // Ex: 1-5
  notas?: string | null;
  completo: boolean;
  userId?: string;
};

type StudyMaterial = {
    id: string;
    created_at: string;
    titulo: string;
    tipo: string; // Ex: 'LIVRO', 'VIDEO', 'ARTIGO'
    url?: string | null;
    progresso?: number; // Ex: 0-100
    notas?: string | null;
    userId?: string;
};

// Opções para Selects (exemplo)
const tecnicaOptions: SelectOption[] = [
    { value: 'POMODORO', label: 'Pomodoro' },
    { value: 'BLOCOS', label: 'Blocos de Tempo' },
    { value: 'LIVRE', label: 'Livre' },
];
const materialTipoOptions: SelectOption[] = [
    { value: 'LIVRO', label: 'Livro' },
    { value: 'VIDEO', label: 'Vídeo' },
    { value: 'ARTIGO', label: 'Artigo' },
    { value: 'EXERCICIO', label: 'Exercício' },
    { value: 'OUTRO', label: 'Outro' },
];


export default function DebugSupabaseEstudosPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados CRUD StudySession
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [newSessionMateria, setNewSessionMateria] = useState('Supabase Debug');
  const [newSessionNotas, setNewSessionNotas] = useState('');
  const [createSessionLoading, setCreateSessionLoading] = useState(false);
  const [createSessionError, setCreateSessionError] = useState<string | null>(null);
  const [deleteSessionLoading, setDeleteSessionLoading] = useState<string | null>(null);
  const [deleteSessionError, setDeleteSessionError] = useState<string | null>(null);
  const [toggleCompleteLoading, setToggleCompleteLoading] = useState<string | null>(null);

  // Estados CRUD StudyMaterial
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [newMaterialTitle, setNewMaterialTitle] = useState('Documentação Supabase');
  const [newMaterialType, setNewMaterialType] = useState('ARTIGO');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [createMaterialLoading, setCreateMaterialLoading] = useState(false);
  const [createMaterialError, setCreateMaterialError] = useState<string | null>(null);
  const [deleteMaterialLoading, setDeleteMaterialLoading] = useState<string | null>(null);
  const [deleteMaterialError, setDeleteMaterialError] = useState<string | null>(null);


  // --- Efeitos e Funções de Conexão/Sessão (igual aos outros) ---
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

  // --- Funções CRUD (StudySession) ---
  const handleReadStudySessions = async () => {
    if (!currentUser) { setSessionsError("Não autenticado."); return; }
    setSessionsLoading(true); setSessionsError(null); setStudySessions([]);
    try {
      const { data, error } = await supabase.from('StudySession').select('*').eq('userId', currentUser.id).order('inicio', { ascending: false }).limit(10);
      if (error) throw error;
      setStudySessions(data || []);
    } catch (error: any) { console.error("Read StudySessions failed:", error); setSessionsError(error.message); }
    finally { setSessionsLoading(false); }
  };

  const handleCreateStudySession = async () => {
    if (!currentUser) { setCreateSessionError("Não autenticado."); return; }
    setCreateSessionLoading(true); setCreateSessionError(null);
    try {
      const newSession = { userId: currentUser.id, materia: newSessionMateria || 'Estudo Rápido', inicio: new Date().toISOString(), notas: newSessionNotas, completo: false };
      const { error } = await supabase.from('StudySession').insert(newSession);
      if (error) throw error;
      setNewSessionMateria(''); setNewSessionNotas('');
      await handleReadStudySessions();
    } catch (error: any) { console.error("Create StudySession failed:", error); setCreateSessionError(error.message); }
    finally { setCreateSessionLoading(false); }
  };

  const handleDeleteStudySession = async (sessionId: string) => {
    if (!sessionId || !confirm(`Deletar sessão ${sessionId}?`)) return;
    setDeleteSessionLoading(sessionId); setDeleteSessionError(null);
    try {
      const { error } = await supabase.from('StudySession').delete().match({ id: sessionId });
      if (error) throw error;
      await handleReadStudySessions();
    } catch (error: any) { console.error("Delete StudySession failed:", error); setDeleteSessionError(error.message); }
    finally { setDeleteSessionLoading(null); }
  };

   const handleToggleCompleteSession = async (session: StudySession) => {
    if (!session) return;
    setToggleCompleteLoading(session.id);
    try {
        const updates = {
            completo: !session.completo,
            fim: !session.completo ? new Date().toISOString() : null // Marca fim ao completar, remove ao desmarcar
        };
        const { error } = await supabase
            .from('StudySession')
            .update(updates)
            .match({ id: session.id });
        if (error) throw error;
        await handleReadStudySessions(); // Recarrega para mostrar mudança
    } catch (error: any) {
        console.error("Toggle complete StudySession failed:", error);
        // Poderia adicionar um estado de erro específico para toggle
    } finally {
        setToggleCompleteLoading(null);
    }
  };

  // --- Funções CRUD (StudyMaterial) ---
   const handleReadStudyMaterials = async () => {
    if (!currentUser) { setMaterialsError("Não autenticado."); return; }
    setMaterialsLoading(true); setMaterialsError(null); setStudyMaterials([]);
    try {
      const { data, error } = await supabase.from('StudyMaterial').select('*').eq('userId', currentUser.id).order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      setStudyMaterials(data || []);
    } catch (error: any) { console.error("Read StudyMaterials failed:", error); setMaterialsError(error.message); }
    finally { setMaterialsLoading(false); }
  };

   const handleCreateStudyMaterial = async () => {
    if (!currentUser) { setCreateMaterialError("Não autenticado."); return; }
    setCreateMaterialLoading(true); setCreateMaterialError(null);
    try {
      const newMaterial = { userId: currentUser.id, titulo: newMaterialTitle || 'Novo Material', tipo: newMaterialType, url: newMaterialUrl || null };
      const { error } = await supabase.from('StudyMaterial').insert(newMaterial);
      if (error) throw error;
      setNewMaterialTitle(''); setNewMaterialType('ARTIGO'); setNewMaterialUrl('');
      await handleReadStudyMaterials();
    } catch (error: any) { console.error("Create StudyMaterial failed:", error); setCreateMaterialError(error.message); }
    finally { setCreateMaterialLoading(false); }
  };

   const handleDeleteStudyMaterial = async (materialId: string) => {
    if (!materialId || !confirm(`Deletar material ${materialId}?`)) return;
    setDeleteMaterialLoading(materialId); setDeleteMaterialError(null);
    try {
      const { error } = await supabase.from('StudyMaterial').delete().match({ id: materialId });
      if (error) throw error;
      await handleReadStudyMaterials();
    } catch (error: any) { console.error("Delete StudyMaterial failed:", error); setDeleteMaterialError(error.message); }
    finally { setDeleteMaterialLoading(null); }
  };


  // Efeitos para carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadStudySessions();
      handleReadStudyMaterials();
    }
  }, [currentUser]);


  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <BookOpen className="h-7 w-7 text-estudos-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Estudos</h1>
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

         {/* Coluna Sessões de Estudo */}
         <Card>
           <h2 className="text-xl font-semibold mb-4">CRUD - Sessões de Estudo (StudySession)</h2>

           {/* Criar */}
           <div className="mb-4 p-3 border rounded-md space-y-2">
             <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Nova Sessão</h3>
             <Input label="Matéria/Tópico" value={newSessionMateria} onChange={(e) => setNewSessionMateria(e.target.value)} disabled={!currentUser || createSessionLoading} />
             <Textarea label="Notas (Opcional)" value={newSessionNotas} onChange={(e) => setNewSessionNotas(e.target.value)} rows={2} disabled={!currentUser || createSessionLoading} />
             <Button onClick={handleCreateStudySession} disabled={!currentUser || createSessionLoading || !newSessionMateria}>
               {createSessionLoading ? 'Criando...' : 'Iniciar Sessão'}
             </Button>
             {createSessionError && <Alert variant="error" title="Erro">{createSessionError}</Alert>}
           </div>

           {/* Listar */}
           <div className="p-3 border rounded-md space-y-2">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Sessões Recentes</h3>
               <Button onClick={handleReadStudySessions} size="sm" variant="outline" disabled={!currentUser || sessionsLoading}>
                 {sessionsLoading ? 'Buscando...' : 'Recarregar'}
               </Button>
             </div>
             {sessionsLoading && <p>Carregando...</p>}
             {sessionsError && <Alert variant="error" title="Erro">{sessionsError}</Alert>}
             {!sessionsLoading && !sessionsError && studySessions.length === 0 && <p className="text-sm text-gray-500">Nenhuma sessão.</p>}
             {!sessionsLoading && !sessionsError && studySessions.length > 0 && (
               <ul className="space-y-2 max-h-60 overflow-y-auto">
                 {studySessions.map((s) => (
                   <li key={s.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                     <div className="flex items-center gap-2 flex-1 mr-2">
                        <Button onClick={() => handleToggleCompleteSession(s)} variant="ghost" size="sm" className="p-0 h-auto" disabled={toggleCompleteLoading === s.id}>
                            {toggleCompleteLoading === s.id ? <Loader2 size={14} className="animate-spin"/> : s.completo ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} />}
                        </Button>
                        <span className={s.completo ? 'line-through text-gray-500' : ''}>
                            {s.materia} <span className="text-xs text-gray-400">({new Date(s.inicio).toLocaleString()})</span>
                        </span>
                     </div>
                     <Button onClick={() => handleDeleteStudySession(s.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteSessionLoading === s.id}>
                       {deleteSessionLoading === s.id ? '...' : <Trash2 size={14} />}
                     </Button>
                   </li>
                 ))}
               </ul>
             )}
             {deleteSessionError && <Alert variant="error" title="Erro Deletar">{deleteSessionError}</Alert>}
           </div>
         </Card>

         {/* Coluna Materiais de Estudo */}
         <Card>
           <h2 className="text-xl font-semibold mb-4">CRUD - Materiais de Estudo (StudyMaterial)</h2>

            {/* Criar */}
           <div className="mb-4 p-3 border rounded-md space-y-2">
             <h3 className="font-medium"><Plus className="inline mr-1 h-4 w-4"/> Novo Material</h3>
             <Input label="Título" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} disabled={!currentUser || createMaterialLoading} />
             <Select label="Tipo" value={newMaterialType} onChange={(e) => setNewMaterialType(e.target.value)} options={materialTipoOptions} disabled={!currentUser || createMaterialLoading} />
             <Input label="URL (Opcional)" value={newMaterialUrl} onChange={(e) => setNewMaterialUrl(e.target.value)} disabled={!currentUser || createMaterialLoading} />
             <Button onClick={handleCreateStudyMaterial} disabled={!currentUser || createMaterialLoading || !newMaterialTitle}>
               {createMaterialLoading ? 'Criando...' : 'Adicionar Material'}
             </Button>
             {createMaterialError && <Alert variant="error" title="Erro">{createMaterialError}</Alert>}
           </div>

            {/* Listar */}
           <div className="p-3 border rounded-md space-y-2">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-medium"><RefreshCcw className="inline mr-1 h-4 w-4"/> Materiais Recentes</h3>
               <Button onClick={handleReadStudyMaterials} size="sm" variant="outline" disabled={!currentUser || materialsLoading}>
                 {materialsLoading ? 'Buscando...' : 'Recarregar'}
               </Button>
             </div>
             {materialsLoading && <p>Carregando...</p>}
             {materialsError && <Alert variant="error" title="Erro">{materialsError}</Alert>}
             {!materialsLoading && !materialsError && studyMaterials.length === 0 && <p className="text-sm text-gray-500">Nenhum material.</p>}
             {!materialsLoading && !materialsError && studyMaterials.length > 0 && (
               <ul className="space-y-2 max-h-60 overflow-y-auto">
                 {studyMaterials.map((m) => (
                   <li key={m.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                     <div className="flex-1 mr-2">
                        <span className="font-medium">{m.titulo}</span> <span className="text-xs text-gray-500">({m.tipo})</span>
                        {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 block truncate hover:underline">{m.url}</a>}
                     </div>
                     <Button onClick={() => handleDeleteStudyMaterial(m.id)} variant="ghost" size="sm" className="text-red-500 px-1 py-0 h-auto" disabled={deleteMaterialLoading === m.id}>
                       {deleteMaterialLoading === m.id ? '...' : <Trash2 size={14} />}
                     </Button>
                   </li>
                 ))}
               </ul>
             )}
             {deleteMaterialError && <Alert variant="error" title="Erro Deletar">{deleteMaterialError}</Alert>}
           </div>
         </Card>

       </div>
    </Container>
  );
}