'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card'; // Corrigido
import { Button } from '@/app/components/ui/Button';
import { Alert } from '@/app/components/ui/Alert'; // Corrigido
import { Input } from '@/app/components/ui/Input'; // Adicionado Input
import { Database, AlertCircle, User as UserIcon, ListChecks, ServerCrash, CheckCircle, UserPlus, Search, Edit, Trash2 } from 'lucide-react'; // Ícones Lucide e adicionados UserPlus, Search, Edit, Trash2

// TODO: Importar funções/hooks para obter sessão Supabase
// TODO: Importar funções/hooks para obter sessão Supabase (ainda simulado)
// import { useSession } from '@/app/hooks/useSession'; // Exemplo

// Tipo para os logs de erro (deve corresponder ao select na API)
type SupabaseErrorLog = {
  id: string;
  createdAt: Date;
  service: string;
  errorMessage: string;
  errorCode?: string | null;
  userId?: string | null;
  source: string;
};

// Tipo para o resultado da consulta de teste (deve corresponder ao select na API)
type TestQueryResult = { id: string }[] | null;
type TestQueryError = Error | null;

// Tipos para CRUD
type CreateUserResult = { success: boolean; user?: { id: string; nome: string }; message?: string } | null;
type ReadUserResult = { success: boolean; user?: any; message?: string } | null; // Usar 'any' por enquanto para o usuário completo

export default function PrismaDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [sessionInfo, setSessionInfo] = useState<any>(null); // TODO: Usar tipo da sessão Supabase
  const [sessionLoading, setSessionLoading] = useState(true);
  const [errorLogs, setErrorLogs] = useState<SupabaseErrorLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [testQueryResult, setTestQueryResult] = useState<TestQueryResult>(null);
  const [testQueryError, setTestQueryError] = useState<TestQueryError>(null);
  const [testQueryLoading, setTestQueryLoading] = useState(false);

  // Estados para CRUD Teste
  const [createUserResult, setCreateUserResult] = useState<CreateUserResult>(null);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [readUserId, setReadUserId] = useState('');
  const [readUserResult, setReadUserResult] = useState<ReadUserResult>(null);
  const [readUserLoading, setReadUserLoading] = useState(false);
  const [updateUserName, setUpdateUserName] = useState(''); // Nome para atualização
  const [updateUserResult, setUpdateUserResult] = useState<CreateUserResult>(null); // Reusa tipo CreateUserResult
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [deleteUserResult, setDeleteUserResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  // --- Efeitos para buscar dados ---

  // 1. Verificar Conexão Prisma (via consulta de teste inicial ou API dedicada)
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      try {
        const response = await fetch('/api/debug/prisma/status');
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        setConnectionStatus(data.status === 'connected' ? 'connected' : 'error');
      } catch (error) {
        console.error("Prisma connection check failed:", error);
        setConnectionStatus('error');
      }
    };
    checkConnection();
  }, []);

  // 2. Obter Informações da Sessão Supabase
  useEffect(() => {
    const fetchSession = async () => {
      setSessionLoading(true);
      try {
        // TODO: Implementar lógica real para buscar sessão Supabase
        // Por enquanto, mantemos a simulação para focar na integração Prisma
        await new Promise(resolve => setTimeout(resolve, 100)); // Delay mínimo para simulação
        setSessionInfo({ // Dados Simulados
          user: { id: 'simulated-user-123', email: 'user@example.com' },
          // token: 'simulated-jwt-token...' // Omitir se não for seguro exibir
        });
      } catch (error) {
        console.error("Failed to fetch Supabase session:", error);
        setSessionInfo(null);
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSession();
  }, []);

  // 3. Buscar Últimos Logs de Erro Prisma/Supabase
  useEffect(() => {
    const fetchErrorLogs = async () => {
      setLogsLoading(true);
      setErrorLogs([]); // Limpa logs antigos
      try {
        const response = await fetch('/api/debug/prisma/errors');
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
        const data: SupabaseErrorLog[] = await response.json();
        // Converte string de data para objeto Date se necessário (JSON não preserva Date)
        const formattedData = data.map(log => ({
          ...log,
          createdAt: new Date(log.createdAt),
        }));
        setErrorLogs(formattedData);
      } catch (error) {
        console.error("Failed to fetch error logs:", error);
        setErrorLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };
    fetchErrorLogs();
  }, []);

  // --- Funções ---

  // 4. Executar Consulta de Teste Prisma
  const handleRunTestQuery = async () => {
    setTestQueryLoading(true);
    setTestQueryResult(null);
    setTestQueryError(null);
    try {
      const response = await fetch('/api/debug/prisma/test-query');
      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }
      const data: TestQueryResult = await response.json();
      setTestQueryResult(data);
    } catch (error) {
      console.error("Test query failed:", error);
      setTestQueryError(error instanceof Error ? error : new Error('Unknown test query error'));
    } finally {
      setTestQueryLoading(false);
    }
  };

  // 5. Criar Usuário de Teste
  const handleCreateTestUser = async () => {
    setCreateUserLoading(true);
    setCreateUserResult(null);
    try {
      const response = await fetch('/api/debug/prisma/create-user', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `API Error: ${response.statusText}`);
      }
      setCreateUserResult(data);
      // Atualiza o ID no campo de leitura automaticamente
      if (data.user?.id) {
        setReadUserId(data.user.id);
      }
    } catch (error) {
      console.error("Create test user failed:", error);
      setCreateUserResult({ success: false, message: error instanceof Error ? error.message : 'Unknown create user error' });
    } finally {
      setCreateUserLoading(false);
    }
  };

  // 6. Ler Usuário de Teste por ID
  const handleReadTestUser = async () => {
    if (!readUserId) {
      setReadUserResult({ success: false, message: 'Por favor, insira um ID de usuário.' });
      return;
    }
    setReadUserLoading(true);
    setReadUserResult(null);
    try {
      const response = await fetch(`/api/debug/prisma/read-user/${encodeURIComponent(readUserId)}`);
      const data = await response.json();
       if (!response.ok || !data.success) {
        throw new Error(data.message || `API Error: ${response.statusText}`);
      }
      setReadUserResult(data);
    } catch (error) {
      console.error("Read test user failed:", error);
      setReadUserResult({ success: false, message: error instanceof Error ? error.message : 'Unknown read user error' });
    } finally {
      setReadUserLoading(false);
    }
  };

  // 7. Atualizar Usuário de Teste por ID
  const handleUpdateTestUser = async () => {
    if (!readUserId) {
       setUpdateUserResult({ success: false, message: 'Por favor, crie ou leia um usuário primeiro para obter um ID.' });
       return;
    }
    setUpdateUserLoading(true);
    setUpdateUserResult(null);
    try {
      const response = await fetch(`/api/debug/prisma/update-user/${encodeURIComponent(readUserId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Envia o novo nome ou deixa a API usar o padrão se vazio
        body: JSON.stringify({ nome: updateUserName || undefined }),
      });
      const data = await response.json();
       if (!response.ok || !data.success) {
        throw new Error(data.message || `API Error: ${response.statusText}`);
      }
      setUpdateUserResult(data);
      // Limpa o campo de nome após sucesso
      setUpdateUserName('');
      // Opcional: Atualiza automaticamente a leitura para ver a mudança
      // handleReadTestUser();
    } catch (error) {
      console.error("Update test user failed:", error);
      setUpdateUserResult({ success: false, message: error instanceof Error ? error.message : 'Unknown update user error' });
    } finally {
      setUpdateUserLoading(false);
    }
  };

  // 8. Deletar Usuário de Teste por ID
  const handleDeleteTestUser = async () => {
     if (!readUserId) {
       setDeleteUserResult({ success: false, message: 'Por favor, crie ou leia um usuário primeiro para obter um ID.' });
       return;
    }
    if (!confirm(`Tem certeza que deseja deletar o usuário com ID: ${readUserId}?`)) {
        return;
    }
    setDeleteUserLoading(true);
    setDeleteUserResult(null);
     try {
      const response = await fetch(`/api/debug/prisma/delete-user/${encodeURIComponent(readUserId)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
       if (!response.ok || !data.success) {
        throw new Error(data.message || `API Error: ${response.statusText}`);
      }
      setDeleteUserResult(data);
      // Limpa os campos e resultados relacionados ao usuário deletado
      setReadUserId('');
      setReadUserResult(null);
      setUpdateUserResult(null);
      setUpdateUserName('');
    } catch (error) {
      console.error("Delete test user failed:", error);
      setDeleteUserResult({ success: false, message: error instanceof Error ? error.message : 'Unknown delete user error' });
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Debug - Integração Prisma/Supabase</h1>

      {/* Status da Conexão Prisma */}
      <Card title={
        <span className="flex items-center"> {/* Título como elemento para incluir ícone */}
          <Database className="mr-2 h-5 w-5" /> Status da Conexão Prisma (via API)
        </span>
      }>
          {connectionStatus === 'checking' && <p className="text-gray-500 dark:text-gray-400">Verificando conexão com a API...</p>}
          {connectionStatus === 'connected' && (
            <Alert variant="success" title="Conectado com Sucesso">
               A API `/api/debug/prisma/status` confirmou a conexão com o banco de dados via Prisma.
            </Alert>
          )}
          {connectionStatus === 'error' && (
            <Alert variant="error" title="Erro de Conexão">
               Falha ao verificar a conexão com o banco de dados via API `/api/debug/prisma/status`. Verifique os logs do servidor/API.
            </Alert>
          )}
      </Card>

      {/* Informações da Sessão Supabase */}
      <Card title={
        <span className="flex items-center">
          <UserIcon className="mr-2 h-5 w-5" /> Sessão de Autenticação Supabase
        </span>
      }>
          {sessionLoading && <p className="text-gray-500 dark:text-gray-400">Carregando informações da sessão (simulado)...</p>}
          {!sessionLoading && sessionInfo?.user && (
            <div className="space-y-2">
              <p><strong>ID do Usuário:</strong> {sessionInfo.user.id}</p>
              <p><strong>Email:</strong> {sessionInfo.user.email}</p>
              {/* <p><strong>Token JWT:</strong> {sessionInfo.token ? 'Presente (não exibido)' : 'Não disponível'}</p> */}
              <p><small className="text-gray-500 dark:text-gray-400">(Dados da sessão ainda simulados)</small></p>
            </div>
          )}
          {!sessionLoading && !sessionInfo?.user && (
            <p className="text-gray-500 dark:text-gray-400">Nenhuma sessão de usuário ativa encontrada (simulado).</p>
          )}
      </Card>

      {/* Últimos Erros Registrados */}
      <Card title={
         <span className="flex items-center">
           <ListChecks className="mr-2 h-5 w-5" /> Últimos 5 Erros (SupabaseErrorLog)
         </span>
      }>
          {logsLoading && <p className="text-gray-500 dark:text-gray-400">Carregando logs de erro via API...</p>}
          {!logsLoading && errorLogs.length > 0 && (
            <ul className="space-y-3 max-h-60 overflow-y-auto"> {/* Adicionado scroll */}
              {errorLogs.map((log) => (
                <li key={log.id} className="border p-3 rounded-md bg-red-50 border-red-200">
                  <p><strong>Data:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                  <p><strong>Serviço:</strong> {log.service}</p>
                  <p><strong>Erro:</strong> {log.errorMessage}</p>
                  {log.errorCode && <p><strong>Código:</strong> {log.errorCode}</p>}
                  {log.userId && <p><strong>Usuário ID:</strong> {log.userId}</p>}
                  <p><strong>Origem:</strong> {log.source}</p>
                </li>
              ))}
            </ul>
          )}
          {!logsLoading && errorLogs.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">Nenhum erro encontrado nos últimos 5 registros via API.</p>
          )}
      </Card>

      {/* Consulta de Teste Prisma */}
      <Card title={
        <span className="flex items-center">
          <Database className="mr-2 h-5 w-5" /> Consulta de Teste Prisma
        </span>
      } className="space-y-4"> {/* Aplicando space-y ao CardContent interno */}
          <p>Executa a seguinte consulta via API `/api/debug/prisma/test-query`: <code className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-sm">prisma.user.findMany(&#123; select: &#123; id: true &#125;, take: 1 &#125;)</code></p>
          <Button onClick={handleRunTestQuery} disabled={testQueryLoading}>
            {testQueryLoading ? 'Executando API...' : 'Executar Consulta'}
          </Button>
          {testQueryLoading && <p className="text-gray-500 dark:text-gray-400">Aguardando resultado da API...</p>}
          {testQueryError && (
            <Alert variant="error" title="Erro na Consulta">
               {testQueryError.message}
            </Alert>
          )}
          {testQueryResult && (
             <Alert variant="info" title="Resultado da Consulta (API)"> {/* Mudado para info */}
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testQueryResult, null, 2)}
                </pre>
            </Alert>
          )}
      </Card>

      {/* CRUD Teste (User) */}
      <Card title={
        <span className="flex items-center">
          <UserPlus className="mr-2 h-5 w-5" /> CRUD Teste (User)
        </span>
      } className="space-y-4">

        {/* Criar Usuário */}
        <div className="space-y-2 p-3 border rounded-md">
          <h3 className="font-semibold flex items-center"><UserPlus className="mr-1 h-4 w-4"/> Criar Usuário de Teste</h3>
          <Button onClick={handleCreateTestUser} disabled={createUserLoading}>
            {createUserLoading ? 'Criando...' : 'Criar Usuário'}
          </Button>
          {createUserLoading && <p className="text-gray-500 dark:text-gray-400">Aguardando API...</p>}
          {createUserResult && !createUserResult.success && (
            <Alert variant="error" title="Erro ao Criar">
              {createUserResult.message}
            </Alert>
          )}
          {createUserResult && createUserResult.success && createUserResult.user && (
            <Alert variant="success" title="Usuário Criado">
              <p>ID: {createUserResult.user.id}</p>
              <p>Nome: {createUserResult.user.nome}</p>
              <p><small>(ID copiado para o campo de leitura abaixo)</small></p>
            </Alert>
          )}
        </div>

        {/* Ler Usuário */}
        <div className="space-y-2 p-3 border rounded-md">
           <h3 className="font-semibold flex items-center"><Search className="mr-1 h-4 w-4"/> Ler Usuário por ID</h3>
           <div className="flex items-center space-x-2">
             <Input
               type="text"
               placeholder="Digite o ID do usuário"
               value={readUserId}
               onChange={(e) => setReadUserId(e.target.value)}
               className="flex-grow"
             />
             <Button onClick={handleReadTestUser} disabled={readUserLoading || !readUserId}>
               {readUserLoading ? 'Lendo...' : 'Ler Usuário'}
             </Button>
           </div>
           {readUserLoading && <p className="text-gray-500 dark:text-gray-400">Aguardando API...</p>}
           {readUserResult && !readUserResult.success && (
             <Alert variant="error" title="Erro ao Ler">
               {readUserResult.message}
             </Alert>
           )}
           {readUserResult && readUserResult.success && readUserResult.user && (
             <Alert variant="info" title="Dados do Usuário (API)">
               <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-x-auto">
                 {JSON.stringify(readUserResult.user, null, 2)}
               </pre>
             </Alert>
           )}
        </div>

        {/* Atualizar Usuário */}
        <div className="space-y-2 p-3 border rounded-md">
           <h3 className="font-semibold flex items-center"><Edit className="mr-1 h-4 w-4"/> Atualizar Nome do Usuário (ID: {readUserId || 'N/A'})</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Atualiza o nome do usuário com o ID atualmente no campo de leitura acima. Deixe o campo abaixo em branco para usar um nome padrão.</p>
           <div className="flex items-center space-x-2">
             <Input
               type="text"
               placeholder="Novo nome (opcional)"
               value={updateUserName}
               onChange={(e) => setUpdateUserName(e.target.value)}
               className="flex-grow"
               disabled={!readUserId} // Desabilita se não houver ID
             />
             <Button onClick={handleUpdateTestUser} disabled={updateUserLoading || !readUserId}>
               {updateUserLoading ? 'Atualizando...' : 'Atualizar Nome'}
             </Button>
           </div>
           {updateUserLoading && <p className="text-gray-500 dark:text-gray-400">Aguardando API...</p>}
           {updateUserResult && !updateUserResult.success && (
             <Alert variant="error" title="Erro ao Atualizar">
               {updateUserResult.message}
             </Alert>
           )}
           {updateUserResult && updateUserResult.success && updateUserResult.user && (
             <Alert variant="success" title="Nome Atualizado">
               <p>ID: {updateUserResult.user.id}</p>
               <p>Novo Nome: {updateUserResult.user.nome}</p>
             </Alert>
           )}
        </div>

         {/* Deletar Usuário */}
        <div className="space-y-2 p-3 border rounded-md">
           <h3 className="font-semibold flex items-center"><Trash2 className="mr-1 h-4 w-4"/> Deletar Usuário (ID: {readUserId || 'N/A'})</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Deleta o usuário com o ID atualmente no campo de leitura acima.</p>
           <Button
             variant="destructive" // Botão com estilo de perigo
             onClick={handleDeleteTestUser}
             disabled={deleteUserLoading || !readUserId}
           >
             {deleteUserLoading ? 'Deletando...' : 'Deletar Usuário'}
           </Button>
           {deleteUserLoading && <p className="text-gray-500 dark:text-gray-400">Aguardando API...</p>}
           {deleteUserResult && !deleteUserResult.success && (
             <Alert variant="error" title="Erro ao Deletar">
               {deleteUserResult.message}
             </Alert>
           )}
           {deleteUserResult && deleteUserResult.success && (
             <Alert variant="success" title="Usuário Deletado">
               {deleteUserResult.message}
             </Alert>
           )}
        </div>

      </Card>

    </div>
  );
}