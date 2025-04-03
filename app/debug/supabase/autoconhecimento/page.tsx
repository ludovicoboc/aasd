'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient'; // Importa o cliente Supabase
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea'; // Usar Textarea para conteúdo
import { Select, SelectOption } from '@/app/components/ui/Select';
import { Card } from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { ArrowLeft, Anchor, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { Session, User } from '@supabase/supabase-js';

// Tipo simplificado para SelfKnowledgeNote (ajustar conforme schema real)
type SelfKnowledgeNote = {
  id: string;
  created_at: string;
  titulo: string;
  conteudo: string;
  secao: 'quem-sou' | 'meus-porques' | 'meus-padroes'; // Ajustar se os valores forem diferentes no DB
  tags?: string[] | null;
  imagemUrl?: string | null;
  userId?: string;
};

// Opções para o Select de seção (devem corresponder ao tipo e ao DB)
const secaoOptions: SelectOption[] = [
  { value: 'quem-sou', label: 'Quem sou' },
  { value: 'meus-porques', label: 'Meus porquês' },
  { value: 'meus-padroes', label: 'Meus padrões' },
];

export default function DebugSupabaseAutoconhecimentoPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados para SelfKnowledgeNote CRUD
  const [notes, setNotes] = useState<SelfKnowledgeNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('Nota Supabase Teste');
  const [newNoteContent, setNewNoteContent] = useState('Conteúdo da nota via Supabase.');
  const [newNoteSection, setNewNoteSection] = useState<'quem-sou' | 'meus-porques' | 'meus-padroes'>('quem-sou');
  const [createNoteLoading, setCreateNoteLoading] = useState(false);
  const [createNoteError, setCreateNoteError] = useState<string | null>(null);
  const [deleteNoteLoading, setDeleteNoteLoading] = useState<string | null>(null);
  const [deleteNoteError, setDeleteNoteError] = useState<string | null>(null);

  // --- Efeitos para buscar dados iniciais ---
  useEffect(() => {
    const checkSupabase = async () => {
      // ... (código de verificação de conexão e sessão - igual ao de alimentação) ...
       setConnectionStatus('checking');
      setSessionLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(`Session Error: ${sessionError.message}`);
        setSessionInfo(session);
        setCurrentUser(session?.user ?? null);
        setConnectionStatus('connected');
      } catch (error) {
        console.error("Supabase connection/session check failed:", error);
        setConnectionStatus('error');
        setSessionInfo(null);
        setCurrentUser(null);
      } finally {
        setSessionLoading(false);
      }
    };
    checkSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionInfo(session);
      setCurrentUser(session?.user ?? null);
    });
    return () => { subscription?.unsubscribe(); };
  }, []);

  // --- Funções CRUD (SelfKnowledgeNote) ---

  // Ler Notas
  const handleReadNotes = async () => {
    if (!currentUser) {
      setNotesError("Usuário não autenticado.");
      return;
    }
    setNotesLoading(true);
    setNotesError(null);
    setNotes([]);
    try {
      const { data, error } = await supabase
        .from('SelfKnowledgeNote') // Nome da tabela no Supabase
        .select('*')
        .eq('userId', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error("Failed to read SelfKnowledgeNotes:", error);
      setNotesError(error.message || "Erro ao buscar notas.");
    } finally {
      setNotesLoading(false);
    }
  };

  // Criar Nota
  const handleCreateNote = async () => {
     if (!currentUser) {
      setCreateNoteError("Usuário não autenticado.");
      return;
    }
    setCreateNoteLoading(true);
    setCreateNoteError(null);
    try {
      const newNote = {
        userId: currentUser.id,
        titulo: newNoteTitle || 'Nota sem título',
        conteudo: newNoteContent,
        secao: newNoteSection,
        // tags: [], // Adicionar se necessário
      };

      const { error } = await supabase
        .from('SelfKnowledgeNote')
        .insert(newNote);

      if (error) throw error;

      setNewNoteTitle(''); // Limpa inputs
      setNewNoteContent('');
      setNewNoteSection('quem-sou');
      await handleReadNotes(); // Recarrega a lista

    } catch (error: any) {
      console.error("Failed to create SelfKnowledgeNote:", error);
      setCreateNoteError(error.message || "Erro ao criar nota.");
    } finally {
      setCreateNoteLoading(false);
    }
  };

  // Deletar Nota
  const handleDeleteNote = async (noteId: string) => {
    if (!noteId) return;
     if (!confirm(`Tem certeza que deseja deletar a nota com ID: ${noteId}?`)) {
        return;
    }
    setDeleteNoteLoading(noteId);
    setDeleteNoteError(null);
    try {
      const { error } = await supabase
        .from('SelfKnowledgeNote')
        .delete()
        .match({ id: noteId });

      if (error) throw error;

      await handleReadNotes(); // Recarrega a lista

    } catch (error: any) {
      console.error("Failed to delete SelfKnowledgeNote:", error);
      setDeleteNoteError(error.message || "Erro ao deletar nota.");
    } finally {
      setDeleteNoteLoading(null);
    }
  };

  // Efeito para carregar notas iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadNotes();
    }
  }, [currentUser]);


  // --- Renderização ---
  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <Anchor className="h-7 w-7 text-autoconhecimento-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Supabase - Autoconhecimento</h1>
      </div>

      {/* Status da Conexão e Sessão (igual aos outros debugs supabase) */}
       <Card className="mb-6">
         <h2 className="text-xl font-semibold mb-4 flex items-center">
           <Database className="mr-2 h-5 w-5" /> Status Supabase
         </h2>
         {/* ... (conteúdo do status da conexão) ... */}
          {connectionStatus === 'checking' && <p className="text-gray-500 dark:text-gray-400">Verificando conexão...</p>}
          {connectionStatus === 'connected' && <Alert variant="success" title="Conectado">Comunicação inicial com Supabase OK.</Alert>}
          {connectionStatus === 'error' && <Alert variant="error" title="Erro de Conexão">Falha ao conectar/obter sessão Supabase.</Alert>}
       </Card>
       <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserIcon className="mr-2 h-5 w-5" /> Sessão Supabase
          </h2>
          {/* ... (conteúdo da sessão) ... */}
          {sessionLoading && <p>Carregando...</p>}
          {!sessionLoading && currentUser && <div>ID: {currentUser.id}, Email: {currentUser.email}</div>}
          {!sessionLoading && !currentUser && <p>Não autenticado.</p>}
       </Card>

      {/* CRUD SelfKnowledgeNote */}
      <Card className="mt-6">
         <h2 className="text-xl font-semibold mb-4">CRUD - Notas de Autoconhecimento (SelfKnowledgeNote)</h2>

         {/* Criar Nova Nota */}
         <div className="mb-4 p-3 border rounded-md space-y-2">
            <h3 className="font-medium flex items-center"><Plus className="mr-1 h-4 w-4"/> Criar Nova Nota</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start mb-2">
               <Input
                 label="Título"
                 value={newNoteTitle}
                 onChange={(e) => setNewNoteTitle(e.target.value)}
                 disabled={!currentUser || createNoteLoading}
               />
               <Textarea
                 label="Conteúdo"
                 value={newNoteContent}
                 onChange={(e) => setNewNoteContent(e.target.value)}
                 rows={3}
                 className="md:col-span-2"
                 disabled={!currentUser || createNoteLoading}
               />
                <Select
                  label="Seção"
                  value={newNoteSection}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewNoteSection(e.target.value as typeof newNoteSection)}
                  options={secaoOptions}
                  disabled={!currentUser || createNoteLoading}
                />
             </div>
             <Button onClick={handleCreateNote} disabled={!currentUser || createNoteLoading || !newNoteTitle || !newNoteContent}>
               {createNoteLoading ? 'Criando...' : 'Criar Nota'}
             </Button>
             {createNoteError && (
                <Alert variant="error" title="Erro ao Criar Nota">
                  {createNoteError}
                </Alert>
             )}
         </div>

         {/* Listar Notas */}
         <div className="p-3 border rounded-md space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center"><RefreshCcw className="mr-1 h-4 w-4"/> Notas Existentes</h3>
              <Button onClick={handleReadNotes} size="sm" variant="outline" disabled={!currentUser || notesLoading}>
                {notesLoading ? 'Buscando...' : 'Recarregar'}
              </Button>
            </div>

            {notesLoading && <p className="text-gray-500 dark:text-gray-400">Carregando notas...</p>}
            {notesError && (
                <Alert variant="error" title="Erro ao Ler Notas">
                  {notesError}
                </Alert>
             )}
            {!notesLoading && !notesError && notes.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma nota encontrada para este usuário.</p>
            )}
            {!notesLoading && !notesError && notes.length > 0 && (
              <ul className="space-y-2 max-h-96 overflow-y-auto"> {/* Aumentado max-h */}
                {notes.map((note) => (
                  <li key={note.id} className="flex justify-between items-start text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex-1 mr-2">
                      <span className="font-medium block">{note.titulo} <span className="text-xs font-normal text-gray-500">({note.secao})</span></span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.conteudo.substring(0, 100)}{note.conteudo.length > 100 ? '...' : ''}</p>
                      <span className="text-xs text-gray-400">({new Date(note.created_at).toLocaleDateString()})</span>
                    </div>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto mt-1" // Ajuste de margem
                      aria-label={`Remover nota ${note.titulo}`}
                      disabled={deleteNoteLoading === note.id}
                    >
                      {deleteNoteLoading === note.id ? <span className="text-xs">...</span> : <Trash2 size={14} />}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
             {deleteNoteError && (
                <Alert variant="error" title="Erro ao Deletar Nota" className="mt-2">
                  {deleteNoteError}
                </Alert>
             )}
         </div>
      </Card>

    </Container>
  );
}