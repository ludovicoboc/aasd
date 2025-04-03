'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { ArrowLeft, User as UserIcon, Database, CheckCircle, AlertCircle, RefreshCcw, Save, Target, Eye, Bell, Coffee, Loader2 } from 'lucide-react'; // Adicionado Save, Target, Eye, Bell, Coffee, Loader2
import { Session, User } from '@supabase/supabase-js';

// Tipo simplificado para o perfil do usuário (baseado no schema Prisma User)
// Ajustar conforme o schema real no Supabase se for diferente
type UserProfile = {
  id: string;
  created_at: string;
  updatedAt?: string; // Supabase pode não ter este por padrão
  nome: string;
  prefAltoContraste: boolean;
  prefReducaoEstimulos: boolean;
  prefTextoGrande: boolean;
  metaHorasSono: number;
  metaTarefasPrioritarias: number;
  metaCoposAgua: number;
  metaPausasProgramadas: number;
  notificacoesAtivas: boolean;
  pausasAtivas: boolean;
  // Adicionar outros campos relevantes se necessário
};

// Valores padrão para um novo perfil ou reset
const defaultProfileValues: Omit<UserProfile, 'id' | 'created_at' | 'updatedAt'> = {
  nome: "Usuário",
  prefAltoContraste: false,
  prefReducaoEstimulos: false,
  prefTextoGrande: false,
  metaHorasSono: 8.0,
  metaTarefasPrioritarias: 3,
  metaCoposAgua: 8,
  metaPausasProgramadas: 4,
  notificacoesAtivas: true,
  pausasAtivas: true,
};


export default function DebugSupabasePerfilPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estado do Perfil
  const [profile, setProfile] = useState<Partial<UserProfile>>(defaultProfileValues); // Começa com padrão
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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

  // --- Funções CRUD (UserProfile) ---
  const handleReadProfile = async () => {
    if (!currentUser) { setProfileError("Não autenticado."); return; }
    setProfileLoading(true); setProfileError(null);
    try {
      // Tenta ler da tabela 'User' (ou 'profiles' se for o caso no Supabase)
      const { data, error } = await supabase
        .from('User') // << VERIFICAR NOME DA TABELA NO SUPABASE >>
        .select('*')
        .eq('id', currentUser.id)
        .single(); // Espera apenas um resultado

      if (error && error.code !== 'PGRST116') { // Ignora erro "No rows found"
         throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Se não encontrar, mantém os valores padrão (ou pode tentar criar um perfil inicial)
        setProfile(defaultProfileValues);
        console.log("Nenhum perfil encontrado para o usuário, usando valores padrão.");
      }
    } catch (error: any) {
      console.error("Read Profile failed:", error);
      setProfileError(error.message || "Erro ao buscar perfil.");
      setProfile(defaultProfileValues); // Volta aos padrões em caso de erro
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) { setUpdateError("Não autenticado."); return; }
    setUpdateLoading(true); setUpdateError(null);
    try {
      const { error } = await supabase
        .from('User') // << VERIFICAR NOME DA TABELA >>
        .update(updates)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualiza o estado local otimisticamente ou relendo
      // setProfile(prev => ({ ...prev, ...updates })); // Otimista
      await handleReadProfile(); // Relê para garantir consistência

    } catch (error: any) {
      console.error("Update Profile failed:", error);
      setUpdateError(error.message || "Erro ao atualizar perfil.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handlers específicos para cada campo/grupo
  const handleNomeChange = (e: ChangeEvent<HTMLInputElement>) => setProfile(p => ({ ...p, nome: e.target.value }));
  const handleMetaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: parseFloat(value) || 0 })); // Usar parseFloat para horasSono
  };
  const handlePrefToggle = (pref: keyof UserProfile) => {
     if (typeof profile[pref] === 'boolean') {
        handleUpdateProfile({ [pref]: !profile[pref] });
     }
  };
   const handleGeralToggle = (pref: keyof UserProfile) => {
     if (typeof profile[pref] === 'boolean') {
        handleUpdateProfile({ [pref]: !profile[pref] });
     }
  };


  // Efeito para carregar perfil inicial
  useEffect(() => {
    if (currentUser) {
      handleReadProfile();
    } else {
      setProfile(defaultProfileValues); // Reset se deslogar
    }
  }, [currentUser]);

  // --- Renderização ---
  return (
    <Container>
       <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
         <ArrowLeft size={16} className="mr-1" /> Voltar
       </Link>
       <div className="flex items-center mb-6">
         <UserIcon className="h-7 w-7 text-perfil-primary mr-3" />
         <h1 className="text-2xl font-bold">Debug - Supabase - Perfil</h1>
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

       {/* Visualizador/Editor do Perfil */}
       <Card>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-semibold flex items-center"><UserIcon className="mr-2 h-5 w-5"/>Perfil do Usuário (Supabase)</h2>
             <Button onClick={handleReadProfile} size="sm" variant="outline" disabled={!currentUser || profileLoading}>
                {profileLoading ? 'Buscando...' : 'Recarregar Perfil'}
             </Button>
          </div>

          {profileLoading && <p>Carregando perfil...</p>}
          {profileError && <Alert variant="error" title="Erro ao Ler Perfil">{profileError}</Alert>}
          {updateError && <Alert variant="error" title="Erro ao Atualizar">{updateError}</Alert>}

          {!profileLoading && !profileError && currentUser && (
            <div className="space-y-4">
              {/* Nome */}
              <Card>
                <h3 className="font-medium mb-2">Nome</h3>
                <div className="flex items-end gap-2">
                  <Input label="Nome" value={profile.nome || ''} onChange={handleNomeChange} className="flex-grow" />
                  <Button onClick={() => handleUpdateProfile({ nome: profile.nome })} size="sm" icon={<Save size={14}/>} disabled={updateLoading}>
                    {updateLoading ? 'Salvando...' : 'Salvar Nome'}
                  </Button>
                </div>
              </Card>

              {/* Metas Diárias */}
              <Card>
                 <h3 className="font-medium mb-2 flex items-center"><Target size={16} className="mr-2"/>Metas Diárias</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                   <Input label="Horas Sono" type="number" name="metaHorasSono" step="0.1" value={profile.metaHorasSono || 0} onChange={handleMetaChange} />
                   <Input label="Tarefas Prio." type="number" name="metaTarefasPrioritarias" value={profile.metaTarefasPrioritarias || 0} onChange={handleMetaChange} />
                   <Input label="Copos Água" type="number" name="metaCoposAgua" value={profile.metaCoposAgua || 0} onChange={handleMetaChange} />
                   <Input label="Pausas Prog." type="number" name="metaPausasProgramadas" value={profile.metaPausasProgramadas || 0} onChange={handleMetaChange} />
                 </div>
                 <Button onClick={() => handleUpdateProfile({
                     metaHorasSono: profile.metaHorasSono,
                     metaTarefasPrioritarias: profile.metaTarefasPrioritarias,
                     metaCoposAgua: profile.metaCoposAgua,
                     metaPausasProgramadas: profile.metaPausasProgramadas
                 })} size="sm" icon={<Save size={14}/>} disabled={updateLoading}>
                    {updateLoading ? 'Salvando...' : 'Salvar Metas'}
                 </Button>
              </Card>

              {/* Preferências Visuais */}
              <Card>
                 <h3 className="font-medium mb-2 flex items-center"><Eye size={16} className="mr-2"/>Preferências Visuais</h3>
                 <div className="flex flex-wrap gap-2">
                   <Button onClick={() => handlePrefToggle('prefAltoContraste')} size="sm" variant={profile.prefAltoContraste ? 'default' : 'outline'} disabled={updateLoading}>
                     Alto Contraste: {profile.prefAltoContraste ? 'ON' : 'OFF'} {updateLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                   </Button>
                   <Button onClick={() => handlePrefToggle('prefReducaoEstimulos')} size="sm" variant={profile.prefReducaoEstimulos ? 'default' : 'outline'} disabled={updateLoading}>
                     Red. Estímulos: {profile.prefReducaoEstimulos ? 'ON' : 'OFF'} {updateLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                   </Button>
                   <Button onClick={() => handlePrefToggle('prefTextoGrande')} size="sm" variant={profile.prefTextoGrande ? 'default' : 'outline'} disabled={updateLoading}>
                     Texto Grande: {profile.prefTextoGrande ? 'ON' : 'OFF'} {updateLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                   </Button>
                 </div>
              </Card>

              {/* Preferências Gerais */}
              <Card>
                 <h3 className="font-medium mb-2">Preferências Gerais</h3>
                 <div className="flex flex-wrap gap-2">
                   <Button onClick={() => handleGeralToggle('notificacoesAtivas')} size="sm" variant={profile.notificacoesAtivas ? 'default' : 'outline'} icon={<Bell size={14}/>} disabled={updateLoading}>
                     Lembretes: {profile.notificacoesAtivas ? 'ON' : 'OFF'} {updateLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                   </Button>
                   <Button onClick={() => handleGeralToggle('pausasAtivas')} size="sm" variant={profile.pausasAtivas ? 'default' : 'outline'} icon={<Coffee size={14}/>} disabled={updateLoading}>
                     Pausas: {profile.pausasAtivas ? 'ON' : 'OFF'} {updateLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                   </Button>
                 </div>
              </Card>

              {/* Reset (Opcional - pode ser perigoso no DB real) */}
              {/* <Card> ... Botão para resetar para defaultProfileValues ... </Card> */}

            </div>
          )}
          {!currentUser && <p className="text-sm text-gray-500">Faça login para ver e editar o perfil.</p>}

       </Card>

    </Container>
  );
}