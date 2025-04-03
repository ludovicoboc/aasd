'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient'; // Importa o cliente Supabase
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { ArrowLeft, Utensils, Database, User as UserIcon, CheckCircle, AlertCircle, Plus, RefreshCcw, Trash2 } from 'lucide-react'; // Adicionado Plus, RefreshCcw, Trash2
import { Session, User } from '@supabase/supabase-js'; // Tipos do Supabase

// Tipo simplificado para MealLog (ajustar conforme schema real do Supabase se necessário)
type MealLog = {
  id: string;
  created_at: string;
  dataHora?: string;
  descricao: string;
  tipoIcone?: string | null;
  fotoUrl?: string | null;
  userId?: string;
};

// Tipo simplificado para MealPlanTemplate
type MealPlanTemplate = {
    id: string;
    created_at: string;
    horario: string;
    descricao: string;
    userId?: string;
};

// Tipo simplificado para HydrationLog
type HydrationLog = {
    id: string;
    created_at: string;
    data?: string; // Ou o nome correto do campo de data/hora
    quantidade: number;
    userId?: string;
};

export default function DebugSupabaseAlimentacaoPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados para MealLog CRUD
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [mealLogsLoading, setMealLogsLoading] = useState(false);
  const [mealLogsError, setMealLogsError] = useState<string | null>(null);
  const [newMealLogDesc, setNewMealLogDesc] = useState('Refeição Supabase Teste');
  const [createMealLogLoading, setCreateMealLogLoading] = useState(false);
  const [createMealLogError, setCreateMealLogError] = useState<string | null>(null);
  const [deleteMealLogLoading, setDeleteMealLogLoading] = useState<string | null>(null); // Armazena o ID do log sendo deletado
  const [deleteMealLogError, setDeleteMealLogError] = useState<string | null>(null);

  // Estados para MealPlanTemplate CRUD
  const [mealPlans, setMealPlans] = useState<MealPlanTemplate[]>([]);
  const [mealPlansLoading, setMealPlansLoading] = useState(false);
  const [mealPlansError, setMealPlansError] = useState<string | null>(null);
  const [newPlanHorario, setNewPlanHorario] = useState('08:00');
  const [newPlanDesc, setNewPlanDesc] = useState('Café da Manhã Padrão');
  const [createPlanLoading, setCreatePlanLoading] = useState(false);
  const [createPlanError, setCreatePlanError] = useState<string | null>(null);
  const [deletePlanLoading, setDeletePlanLoading] = useState<string | null>(null);
  const [deletePlanError, setDeletePlanError] = useState<string | null>(null);

  // Estados para HydrationLog CRUD
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [hydrationLogsLoading, setHydrationLogsLoading] = useState(false);
  const [hydrationLogsError, setHydrationLogsError] = useState<string | null>(null);
  const [newHydrationQuantity, setNewHydrationQuantity] = useState(250); // Ex: 250ml
  const [createHydrationLogLoading, setCreateHydrationLogLoading] = useState(false);
  const [createHydrationLogError, setCreateHydrationLogError] = useState<string | null>(null);
  const [deleteHydrationLogLoading, setDeleteHydrationLogLoading] = useState<string | null>(null);
  const [deleteHydrationLogError, setDeleteHydrationLogError] = useState<string | null>(null);

  // --- Efeitos para buscar dados iniciais ---
  // 1. Verificar Conexão e Sessão Supabase
  useEffect(() => {
    const checkSupabase = async () => {
      setConnectionStatus('checking');
      setSessionLoading(true);
      try {
        // Tenta obter a sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(`Session Error: ${sessionError.message}`);
        }

        setSessionInfo(session);
        setCurrentUser(session?.user ?? null);

        // Se chegou aqui, a comunicação básica funcionou
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

    // Opcional: Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionInfo(session);
      setCurrentUser(session?.user ?? null);
      // Re-checar conexão se o estado mudar (opcional, pode ser redundante)
      // checkSupabase();
    });

    // Limpar o listener ao desmontar
    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  // --- Funções CRUD (MealLog) ---

  // Ler MealLogs
  const handleReadMealLogs = async () => {
    if (!currentUser) {
      setMealLogsError("Usuário não autenticado.");
      return;
    }
    setMealLogsLoading(true);
    setMealLogsError(null);
    setMealLogs([]); // Limpa antes de buscar
    try {
      const { data, error } = await supabase
        .from('MealLog') // Nome da tabela no Supabase (verificar se é igual ao modelo Prisma)
        .select('*')
        .eq('userId', currentUser.id) // Filtra pelo usuário logado
        .order('created_at', { ascending: false })
        .limit(10); // Limita a 10 registros

      if (error) throw error;
      setMealLogs(data || []);
    } catch (error: any) {
      console.error("Failed to read MealLogs:", error);
      setMealLogsError(error.message || "Erro ao buscar registros de refeição.");
    } finally {
      setMealLogsLoading(false);
    }
  };

  // Criar MealLog
  const handleCreateMealLog = async () => {
     if (!currentUser) {
      setCreateMealLogError("Usuário não autenticado.");
      return;
    }
    setCreateMealLogLoading(true);
    setCreateMealLogError(null);
    try {
      const newLog = {
        // id: uuidv4(), // Supabase gera automaticamente se a coluna for PK e tipo UUID
        userId: currentUser.id,
        descricao: newMealLogDesc || 'Registro sem descrição',
        dataHora: new Date().toISOString(), // Usar formato ISO para timestampz
        // tipoIcone: 'utensils', // Exemplo
      };

      const { error } = await supabase
        .from('MealLog')
        .insert(newLog);

      if (error) throw error;

      setNewMealLogDesc(''); // Limpa input
      await handleReadMealLogs(); // Recarrega a lista após criar

    } catch (error: any) {
      console.error("Failed to create MealLog:", error);
      setCreateMealLogError(error.message || "Erro ao criar registro de refeição.");
    } finally {
      setCreateMealLogLoading(false);
    }
  };

  // Deletar MealLog
  const handleDeleteMealLog = async (logId: string) => {
    if (!logId) return;
    if (!confirm(`Tem certeza que deseja deletar o registro de refeição com ID: ${logId}?`)) {
        return;
    }
    setDeleteMealLogLoading(logId); // Indica qual está sendo deletado
    setDeleteMealLogError(null);
    try {
      const { error } = await supabase
        .from('MealLog')
        .delete()
        .match({ id: logId }); // Deleta pelo ID

      if (error) throw error;

      await handleReadMealLogs(); // Recarrega a lista após deletar

    } catch (error: any) { // Adicionada a chave de abertura {
      console.error("Failed to delete MealLog:", error);
      setDeleteMealLogError(error.message || "Erro ao deletar registro de refeição.");
    } finally {
      setDeleteMealLogLoading(null); // Limpa o loading
    }
  };

   // Efeito para carregar logs iniciais quando o usuário estiver disponível
   useEffect(() => {
    if (currentUser) {
      handleReadMealLogs();
    }
   }, [currentUser]);

  // --- Funções CRUD (MealPlanTemplate) ---

  // Ler MealPlanTemplates
  const handleReadMealPlans = async () => {
    if (!currentUser) {
      setMealPlansError("Usuário não autenticado.");
      return;
    }
    setMealPlansLoading(true);
    setMealPlansError(null);
    setMealPlans([]);
    try {
      const { data, error } = await supabase
        .from('MealPlanTemplate') // Nome da tabela no Supabase
        .select('*')
        .eq('userId', currentUser.id)
        .order('horario', { ascending: true });

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error: any) {
      console.error("Failed to read MealPlanTemplates:", error);
      setMealPlansError(error.message || "Erro ao buscar modelos de refeição.");
    } finally {
      setMealPlansLoading(false);
    }
  };

  // Criar MealPlanTemplate
  const handleCreateMealPlan = async () => {
     if (!currentUser) {
      setCreatePlanError("Usuário não autenticado.");
      return;
    }
    setCreatePlanLoading(true);
    setCreatePlanError(null);
    try {
      const newPlan = {
        userId: currentUser.id,
        horario: newPlanHorario,
        descricao: newPlanDesc,
      };

      const { error } = await supabase
        .from('MealPlanTemplate')
        .insert(newPlan);

      if (error) throw error;

      setNewPlanHorario('08:00'); // Reset inputs
      setNewPlanDesc('');
      await handleReadMealPlans(); // Recarrega a lista

    } catch (error: any) {
      console.error("Failed to create MealPlanTemplate:", error);
      setCreatePlanError(error.message || "Erro ao criar modelo de refeição.");
    } finally {
      setCreatePlanLoading(false);
    }
  };

  // Deletar MealPlanTemplate
  const handleDeleteMealPlan = async (planId: string) => {
    if (!planId) return;
     if (!confirm(`Tem certeza que deseja deletar o modelo de refeição com ID: ${planId}?`)) {
        return;
    }
    setDeletePlanLoading(planId);
    setDeletePlanError(null);
    try {
      const { error } = await supabase
        .from('MealPlanTemplate')
        .delete()
        .match({ id: planId });

      if (error) throw error;

      await handleReadMealPlans(); // Recarrega a lista

    } catch (error: any) {
      console.error("Failed to delete MealPlanTemplate:", error);
      setDeletePlanError(error.message || "Erro ao deletar modelo de refeição.");
    } finally {
      setDeletePlanLoading(null);
    }
  };

  // Efeito para carregar planos iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadMealPlans();
    }
  }, [currentUser]);

  // --- Funções CRUD (HydrationLog) ---

   // Ler HydrationLogs
  const handleReadHydrationLogs = async () => {
    if (!currentUser) {
      setHydrationLogsError("Usuário não autenticado.");
      return;
    }
    setHydrationLogsLoading(true);
    setHydrationLogsError(null);
    setHydrationLogs([]);
    try {
      const { data, error } = await supabase
        .from('HydrationLog') // Nome da tabela no Supabase
        .select('*')
        .eq('userId', currentUser.id)
        .order('created_at', { ascending: false }) // Ou ordenar por 'data' se existir
        .limit(15); // Limita a 15 registros

      if (error) throw error;
      setHydrationLogs(data || []);
    } catch (error: any) {
      console.error("Failed to read HydrationLogs:", error);
      setHydrationLogsError(error.message || "Erro ao buscar registros de hidratação.");
    } finally {
      setHydrationLogsLoading(false);
    }
  };

  // Criar HydrationLog
  const handleCreateHydrationLog = async () => {
     if (!currentUser) {
      setCreateHydrationLogError("Usuário não autenticado.");
      return;
    }
    setCreateHydrationLogLoading(true);
    setCreateHydrationLogError(null);
    try {
      const newLog = {
        userId: currentUser.id,
        quantidade: newHydrationQuantity,
        data: new Date().toISOString(), // Usar data atual
      };

      const { error } = await supabase
        .from('HydrationLog')
        .insert(newLog);

      if (error) throw error;

      // Não reseta a quantidade, pode ser útil manter
      await handleReadHydrationLogs(); // Recarrega a lista

    } catch (error: any) {
      console.error("Failed to create HydrationLog:", error);
      setCreateHydrationLogError(error.message || "Erro ao criar registro de hidratação.");
    } finally {
      setCreateHydrationLogLoading(false);
    }
  };

  // Deletar HydrationLog
  const handleDeleteHydrationLog = async (logId: string) => {
    if (!logId) return;
     if (!confirm(`Tem certeza que deseja deletar o registro de hidratação com ID: ${logId}?`)) {
        return;
    }
    setDeleteHydrationLogLoading(logId);
    setDeleteHydrationLogError(null);
    try {
      const { error } = await supabase
        .from('HydrationLog')
        .delete()
        .match({ id: logId });

      if (error) throw error;

      await handleReadHydrationLogs(); // Recarrega a lista

    } catch (error: any) {
      console.error("Failed to delete HydrationLog:", error);
      setDeleteHydrationLogError(error.message || "Erro ao deletar registro de hidratação.");
    } finally {
      setDeleteHydrationLogLoading(null);
    }
  };

  // Efeito para carregar logs de hidratação iniciais
  useEffect(() => {
    if (currentUser) {
      handleReadHydrationLogs();
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
        <Utensils className="h-7 w-7 text-alimentacao-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Supabase - Alimentação</h1>
      </div>

      {/* Status da Conexão Supabase */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="mr-2 h-5 w-5" /> Status da Conexão Supabase
        </h2>
        {connectionStatus === 'checking' && <p className="text-gray-500 dark:text-gray-400">Verificando conexão...</p>}
        {connectionStatus === 'connected' && (
          <Alert variant="success" title="Conectado com Sucesso">
             A comunicação inicial com o Supabase (getSession) foi bem-sucedida.
          </Alert>
        )}
        {connectionStatus === 'error' && (
          <Alert variant="error" title="Erro de Conexão">
             Falha ao comunicar com o Supabase. Verifique as variáveis de ambiente e a console do navegador/servidor.
          </Alert>
        )}
      </Card>

      {/* Informações da Sessão Supabase */}
      <Card className="mb-6">
         <h2 className="text-xl font-semibold mb-4 flex items-center">
           <UserIcon className="mr-2 h-5 w-5" /> Sessão de Autenticação Supabase
         </h2>
          {sessionLoading && <p className="text-gray-500 dark:text-gray-400">Carregando informações da sessão...</p>}
          {!sessionLoading && currentUser && (
            <div className="space-y-2 text-sm">
              <p><strong>ID do Usuário:</strong> {currentUser.id}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Último Login:</strong> {currentUser.last_sign_in_at ? new Date(currentUser.last_sign_in_at).toLocaleString() : 'N/A'}</p>
              {/* Exibir mais detalhes se necessário, como app_metadata */}
              {/* <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre> */}
            </div>
          )}
          {!sessionLoading && !currentUser && (
            <p className="text-gray-500 dark:text-gray-400">Nenhuma sessão de usuário ativa encontrada.</p>
          )}
          {/* TODO: Adicionar botões de Login/Logout para teste */}
      </Card>

      {/* CRUD MealLog */}
      <Card className="mt-6">
         <h2 className="text-xl font-semibold mb-4">CRUD - Registros de Refeição (MealLog)</h2>

         {/* Criar Novo Registro */}
         <div className="mb-4 p-3 border rounded-md space-y-2">
            <h3 className="font-medium flex items-center"><Plus className="mr-1 h-4 w-4"/> Criar Novo Registro</h3>
             <div className="flex items-end gap-2">
               <Input
                 label="Descrição da Refeição"
                 value={newMealLogDesc}
                 onChange={(e) => setNewMealLogDesc(e.target.value)}
                 className="flex-grow"
                 disabled={!currentUser || createMealLogLoading}
               />
               <Button onClick={handleCreateMealLog} disabled={!currentUser || createMealLogLoading || !newMealLogDesc}>
                 {createMealLogLoading ? 'Criando...' : 'Criar Registro'}
               </Button>
             </div>
             {createMealLogError && (
                <Alert variant="error" title="Erro ao Criar">
                  {createMealLogError}
                </Alert>
             )}
         </div>

         {/* Listar Registros */}
         <div className="p-3 border rounded-md space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center"><RefreshCcw className="mr-1 h-4 w-4"/> Últimos Registros</h3>
              <Button onClick={handleReadMealLogs} size="sm" variant="outline" disabled={!currentUser || mealLogsLoading}>
                {mealLogsLoading ? 'Buscando...' : 'Recarregar'}
              </Button>
            </div>

            {mealLogsLoading && <p className="text-gray-500 dark:text-gray-400">Carregando registros...</p>}
            {mealLogsError && (
                <Alert variant="error" title="Erro ao Ler">
                  {mealLogsError}
                </Alert>
             )}
            {!mealLogsLoading && !mealLogsError && mealLogs.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum registro de refeição encontrado para este usuário.</p>
            )}
            {!mealLogsLoading && !mealLogsError && mealLogs.length > 0 && (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {mealLogs.map((log) => (
                  <li key={log.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="font-medium">{log.descricao}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({log.dataHora ? new Date(log.dataHora).toLocaleString() : new Date(log.created_at).toLocaleDateString()})
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDeleteMealLog(log.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto"
                      aria-label={`Remover registro ${log.descricao}`}
                      disabled={deleteMealLogLoading === log.id} // Desabilita apenas o botão do item sendo deletado
                    >
                      {deleteMealLogLoading === log.id ? <span className="text-xs">...</span> : <Trash2 size={14} />}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
             {deleteMealLogError && (
                <Alert variant="error" title="Erro ao Deletar" className="mt-2">
                  {deleteMealLogError}
                </Alert>
             )}
         </div>
      </Card>

      {/* CRUD MealPlanTemplate */}
      <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">CRUD - Modelos de Refeição (MealPlanTemplate)</h2>

          {/* Criar Novo Modelo */}
          <div className="mb-4 p-3 border rounded-md space-y-2">
              <h3 className="font-medium flex items-center"><Plus className="mr-1 h-4 w-4"/> Criar Novo Modelo</h3>
              <div className="flex items-end gap-2">
              <Input
                  label="Horário"
                  type="time"
                  value={newPlanHorario}
                  onChange={(e) => setNewPlanHorario(e.target.value)}
                  className="w-32"
                  disabled={!currentUser || createPlanLoading}
              />
              <Input
                  label="Descrição do Modelo"
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  className="flex-grow"
                  disabled={!currentUser || createPlanLoading}
              />
              <Button onClick={handleCreateMealPlan} disabled={!currentUser || createPlanLoading || !newPlanDesc || !newPlanHorario}>
                  {createPlanLoading ? 'Criando...' : 'Criar Modelo'}
              </Button>
              </div>
              {createPlanError && (
                  <Alert variant="error" title="Erro ao Criar Modelo">
                  {createPlanError}
                  </Alert>
              )}
          </div>

          {/* Listar Modelos */}
          <div className="p-3 border rounded-md space-y-2">
              <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center"><RefreshCcw className="mr-1 h-4 w-4"/> Modelos Existentes</h3>
              <Button onClick={handleReadMealPlans} size="sm" variant="outline" disabled={!currentUser || mealPlansLoading}>
                  {mealPlansLoading ? 'Buscando...' : 'Recarregar'}
              </Button>
              </div>

              {mealPlansLoading && <p className="text-gray-500 dark:text-gray-400">Carregando modelos...</p>}
              {mealPlansError && (
                  <Alert variant="error" title="Erro ao Ler Modelos">
                  {mealPlansError}
                  </Alert>
              )}
              {!mealPlansLoading && !mealPlansError && mealPlans.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum modelo de refeição encontrado para este usuário.</p>
              )}
              {!mealPlansLoading && !mealPlansError && mealPlans.length > 0 && (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {mealPlans.map((plan) => (
                  <li key={plan.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                      <span className="font-medium">{plan.horario}</span> - <span>{plan.descricao}</span>
                      </div>
                      <Button
                      onClick={() => handleDeleteMealPlan(plan.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto"
                      aria-label={`Remover modelo ${plan.descricao}`}
                      disabled={deletePlanLoading === plan.id}
                      >
                      {deletePlanLoading === plan.id ? <span className="text-xs">...</span> : <Trash2 size={14} />}
                      </Button>
                  </li>
                  ))}
              </ul>
              )}
              {deletePlanError && (
                  <Alert variant="error" title="Erro ao Deletar Modelo" className="mt-2">
                  {deletePlanError}
                  </Alert>
              )}
          </div>
      </Card>

      {/* CRUD HydrationLog */}
      <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">CRUD - Registros de Hidratação (HydrationLog)</h2>

          {/* Criar Novo Log */}
          <div className="mb-4 p-3 border rounded-md space-y-2">
              <h3 className="font-medium flex items-center"><Plus className="mr-1 h-4 w-4"/> Adicionar Registro de Hidratação</h3>
              <div className="flex items-end gap-2">
              <Input
                  label="Quantidade (ml)"
                  type="number"
                  value={newHydrationQuantity}
                  onChange={(e) => setNewHydrationQuantity(Number(e.target.value))}
                  min="1"
                  step="50"
                  className="w-32"
                  disabled={!currentUser || createHydrationLogLoading}
              />
              <Button onClick={handleCreateHydrationLog} disabled={!currentUser || createHydrationLogLoading || newHydrationQuantity <= 0}>
                  {createHydrationLogLoading ? 'Adicionando...' : 'Adicionar'}
              </Button>
              </div>
              {createHydrationLogError && (
                  <Alert variant="error" title="Erro ao Adicionar">
                  {createHydrationLogError}
                  </Alert>
              )}
          </div>

          {/* Listar Logs */}
          <div className="p-3 border rounded-md space-y-2">
              <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center"><RefreshCcw className="mr-1 h-4 w-4"/> Últimos Registros de Hidratação</h3>
              <Button onClick={handleReadHydrationLogs} size="sm" variant="outline" disabled={!currentUser || hydrationLogsLoading}>
                  {hydrationLogsLoading ? 'Buscando...' : 'Recarregar'}
              </Button>
              </div>

              {hydrationLogsLoading && <p className="text-gray-500 dark:text-gray-400">Carregando registros...</p>}
              {hydrationLogsError && (
                  <Alert variant="error" title="Erro ao Ler Registros">
                  {hydrationLogsError}
                  </Alert>
              )}
              {!hydrationLogsLoading && !hydrationLogsError && hydrationLogs.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum registro de hidratação encontrado para este usuário.</p>
              )}
              {!hydrationLogsLoading && !hydrationLogsError && hydrationLogs.length > 0 && (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {hydrationLogs.map((log) => (
                  <li key={log.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                      <span className="font-medium">{log.quantidade} ml</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({log.data ? new Date(log.data).toLocaleString() : new Date(log.created_at).toLocaleDateString()})
                      </span>
                      </div>
                      <Button
                      onClick={() => handleDeleteHydrationLog(log.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 px-1 py-0 h-auto"
                      aria-label={`Remover registro de ${log.quantidade}ml`}
                      disabled={deleteHydrationLogLoading === log.id}
                      >
                      {deleteHydrationLogLoading === log.id ? <span className="text-xs">...</span> : <Trash2 size={14} />}
                      </Button>
                  </li>
                  ))}
              </ul>
              )}
              {deleteHydrationLogError && (
                  <Alert variant="error" title="Erro ao Deletar Registro" className="mt-2">
                  {deleteHydrationLogError}
                  </Alert>
              )}
          </div>
      </Card>

    </Container>
  );
}