'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react'; // Importar ChangeEvent
import Link from 'next/link';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { Select, SelectOption } from '@/app/components/ui/Select'; // Importar Select
import { ArrowLeft, LogIn, LogOut, RefreshCw, List, Save, FolderOpen, Loader2, AlertCircle, CheckCircle, Database, MessageSquare, History, Trash2 } from 'lucide-react'; // Importar ícones
import { obterDadosParaExportar } from '@/app/lib/dataService'; // Para obter dados para salvar
import { useDataTransferStore, TransferenciaStatus } from '@/app/stores/dataTransferStore'; // Importar store e tipo
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer'; // Importar DebugStateViewer

// Define a type for the API response structure
interface ApiResponse {
  success?: boolean;
  isAuthenticated?: boolean;
  files?: any[]; // Define a more specific type if possible
  fileId?: string;
  fileName?: string;
  data?: any; // Data loaded from backup
  message?: string;
  error?: string;
}

export default function DebugDrivePage() {
  // Estado da API
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fileIdToLoad, setFileIdToLoad] = useState<string>('');

  // Estado e ações da store de transferência
  const dataTransferState = useDataTransferStore();
  const {
    status: transferStatus,
    mensagem: transferMensagem,
    ultimaExportacao,
    ultimaImportacao,
    setStatus: setTransferStatus,
    setMensagem: setTransferMensagem,
    registrarExportacao,
    registrarImportacao,
    limparHistorico: limparHistoricoTransferencia,
  } = dataTransferState;

  // Estado local para controles da store
  const [manualStatus, setManualStatus] = useState<TransferenciaStatus>(transferStatus);
  const [manualMensagem, setManualMensagem] = useState<string>(transferMensagem);

  // Opções para o Select de status
  const statusOptions: SelectOption[] = [
    { value: 'idle', label: 'Idle' },
    { value: 'exporting', label: 'Exporting' },
    { value: 'importing', label: 'Importing' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
  ];

  const clearMessages = () => {
    setApiResponse(null);
    setApiError(null);
  };

  const handleApiCall = useCallback(async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    setIsLoading(true);
    clearMessages();
    try {
      const options: RequestInit = { method };
      if (method === 'POST' && body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setApiResponse(data);
      // Update auth status specifically after checkAuth or disconnect
      if (endpoint === '/api/drive/checkAuth') {
        setAuthStatus(data.isAuthenticated ?? false);
      } else if (endpoint === '/api/auth/google/disconnect' && data.success) {
        setAuthStatus(false);
      } else if (endpoint === '/api/auth/google/connect') {
         // Connect redirects, so this part might not be reached directly
         // Auth status will be updated on page load after callback
      }

    } catch (error: any) {
      console.error(`Error calling ${endpoint}:`, error);
      setApiError(error.message || 'An unknown error occurred.');
       // Reset auth status on error during check? Maybe not, keep last known status.
       // setAuthStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array as it uses state setters

  // Check auth status on load
  useEffect(() => {
    handleApiCall('/api/drive/checkAuth');
  }, [handleApiCall]); // Add handleApiCall as dependency

  // Sincronizar estado local com store
  useEffect(() => {
    setManualStatus(transferStatus);
  }, [transferStatus]);

  useEffect(() => {
    setManualMensagem(transferMensagem);
  }, [transferMensagem]);


  const handleSave = () => {
    const data = obterDadosParaExportar();
    if (data) {
      handleApiCall('/api/drive/save', 'POST', data);
      // Idealmente, a API retornaria sucesso e então chamaríamos registrarExportacao
      // Simulando sucesso aqui para debug:
      // registrarExportacao();
    } else {
      setApiError('Failed to gather data for saving.');
    }
  };

  const handleLoad = () => {
    if (!fileIdToLoad.trim()) {
        setApiError('Please enter a File ID to load.');
        return;
    }
    handleApiCall(`/api/drive/load?fileId=${fileIdToLoad}`);
    // Idealmente, a API retornaria sucesso e então chamaríamos registrarImportacao
    // Simulando sucesso aqui para debug:
    // registrarImportacao();
  };


  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        {/* Simple Drive-like icon */}
        <svg className="h-7 w-7 text-blue-500 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L18 2L22 8L12 22L2 8L6 2Z M7.4 4L4.6 8L12 19.2L19.4 8L16.6 4L7.4 4Z M12 10.5L8.8 16H15.2L12 10.5Z"/></svg>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Autenticação/Drive & Transferência</h1>
      </div>

      {/* Status/Result Area API */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Status & Resultados API</h2>
        {isLoading && (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin mr-2" size={16} /> Carregando API...
          </div>
        )}
        {apiError && (
          <div className="flex items-start gap-2 p-3 rounded-md text-sm border bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
            <span className="flex-grow">Erro API: {apiError}</span>
          </div>
        )}
        {apiResponse && !apiError && (
           <div className="flex items-start gap-2 p-3 rounded-md text-sm border bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300">
             <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
             <pre className="text-xs overflow-x-auto flex-grow">Sucesso API: {JSON.stringify(apiResponse, null, 2)}</pre>
           </div>
        )}
         <div className="mt-3 text-sm">
            Status Autenticação: {authStatus === null ? 'Verificando...' : authStatus ? <span className="font-medium text-green-600 dark:text-green-400">Autenticado</span> : <span className="font-medium text-red-600 dark:text-red-400">Não Autenticado</span>}
         </div>
      </Card>

      {/* Visualizador Estado Store Transferência */}
      <DebugStateViewer title="Estado da Store (useDataTransferStore)" state={dataTransferState} defaultOpen />


      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Controles API */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Controles API Google Drive</h2>
          <div className="space-y-4">
            {/* Auth Controls */}
            <div className="space-y-2">
               <h3 className="font-medium">Autenticação</h3>
               <Button onClick={() => window.location.href='/api/auth/google/connect'} disabled={isLoading || authStatus === true} className="w-full" icon={<LogIn size={16}/>}>
                 Conectar ao Drive
               </Button>
               <Button onClick={() => handleApiCall('/api/auth/google/disconnect', 'POST')} disabled={isLoading || authStatus === false} className="w-full" variant="destructive" icon={<LogOut size={16}/>}>
                 Desconectar Drive
               </Button>
               <Button onClick={() => handleApiCall('/api/drive/checkAuth')} disabled={isLoading} className="w-full" variant="outline" icon={<RefreshCw size={16}/>}>
                 Verificar Autenticação
               </Button>
            </div>

            {/* File Operations */}
            <div className="space-y-2">
               <h3 className="font-medium">Operações de Arquivo</h3>
               <Button onClick={() => handleApiCall('/api/drive/list')} disabled={isLoading || authStatus === false} className="w-full" variant="outline" icon={<List size={16}/>}>
                 Listar Backups
               </Button>
               <Button onClick={handleSave} disabled={isLoading || authStatus === false} className="w-full" variant="outline" icon={<Save size={16}/>}>
                 Salvar Backup Atual
               </Button>
            </div>

             {/* Load Operation */}
             <div className="space-y-2">
                <h3 className="font-medium">Carregar Arquivo</h3>
                <Input
                  label="File ID para Carregar"
                  value={fileIdToLoad}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileIdToLoad(e.target.value)}
                  placeholder="Cole o ID do arquivo aqui"
                  disabled={isLoading || authStatus === false}
                />
                <Button onClick={handleLoad} disabled={isLoading || authStatus === false || !fileIdToLoad.trim()} className="w-full" variant="outline" icon={<FolderOpen size={16}/>}>
                  Carregar Backup por ID
                </Button>
             </div>
          </div>
        </Card>

        {/* Controles Store Transferência */}
        <Card>
           <h2 className="text-xl font-semibold mb-4">Controles Store Transferência</h2>
           <div className="space-y-4">
              {/* Controle Manual de Status */}
              <div className="space-y-2">
                 <h3 className="font-medium">Definir Status Manualmente</h3>
                 <Select
                   label="Status"
                   value={manualStatus}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setManualStatus(e.target.value as TransferenciaStatus)}
                   options={statusOptions}
                 />
                 <Button onClick={() => setTransferStatus(manualStatus)} size="sm" variant="outline">Aplicar Status</Button>
              </div>
               {/* Controle Manual de Mensagem */}
              <div className="space-y-2">
                 <h3 className="font-medium">Definir Mensagem Manualmente</h3>
                 <Input
                   label="Mensagem"
                   value={manualMensagem}
                   onChange={(e) => setManualMensagem(e.target.value)}
                 />
                 <Button onClick={() => setTransferMensagem(manualMensagem)} size="sm" variant="outline">Aplicar Mensagem</Button>
              </div>
               {/* Ações de Registro */}
              <div className="space-y-2">
                 <h3 className="font-medium">Registrar Ações</h3>
                 <Button onClick={registrarExportacao} size="sm" icon={<Database size={14}/>}>Registrar Exportação</Button>
                 <Button onClick={() => registrarImportacao()} size="sm" icon={<Database size={14}/>} className="ml-2">Registrar Importação</Button>
              </div>
               {/* Limpar Histórico */}
              <div className="space-y-2">
                 <h3 className="font-medium">Histórico</h3>
                 <p className="text-xs">Última Exportação: {ultimaExportacao ? new Date(ultimaExportacao).toLocaleString() : 'Nenhuma'}</p>
                 <p className="text-xs">Última Importação: {ultimaImportacao ? new Date(ultimaImportacao).toLocaleString() : 'Nenhuma'}</p>
                 <Button onClick={limparHistoricoTransferencia} size="sm" variant="destructive" icon={<Trash2 size={14}/>}>Limpar Histórico</Button>
              </div>
           </div>
        </Card>
      </div>
    </Container>
  );
}