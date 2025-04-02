'use client';

import React, { useState, useCallback, useRef } from 'react'; // Adicionar useRef
import { useSimuladoStore, SimuladoData } from '@/app/stores/simuladoStore';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea'; // Importar Textarea
import { Alert } from '@/app/components/ui/Alert'; // Usando Alert existente para erros
import { Upload, ClipboardPaste } from 'lucide-react'; // Importar ícones

const SimuladoLoader: React.FC = () => {
  const { loadSimulado, setStatus } = useSimuladoStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonText, setJsonText] = useState(''); // Estado para o texto da textarea
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo

  // Função genérica para processar os dados JSON (seja de arquivo ou texto)
  const processJsonData = (jsonData: string) => {
    try {
      const data: SimuladoData = JSON.parse(jsonData);

      // Validação básica da estrutura do JSON (pode ser mais robusta)
      if (!data.metadata || !data.questoes || !Array.isArray(data.questoes)) {
        throw new Error('Estrutura do JSON inválida. Verifique o formato do arquivo/texto.');
      }
      if (data.questoes.length === 0) {
        throw new Error('O JSON não contém questões.');
      }
      // Validação mais profunda das questões pode ser adicionada aqui

      loadSimulado(data); // Carrega os dados no store (que mudará o status para 'reviewing')
    } catch (err) {
      console.error('Erro ao processar o JSON:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar o JSON.');
      setStatus('idle'); // Volta para o estado inicial em caso de erro
      setIsLoading(false); // Garante que o loading pare em caso de erro
    }
    // O finally que estava aqui foi movido para os handlers específicos
  };


  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setError('Nenhum arquivo selecionado.');
        return;
      }

      if (file.type !== 'application/json') {
        setError('Formato de arquivo inválido. Por favor, selecione um arquivo .json.');
        return;
      }

      setError(null);
      setIsLoading(true);
      setStatus('loading');

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          processJsonData(text); // Chama a função genérica
        } else {
          setError('Falha ao ler o conteúdo do arquivo.');
          setStatus('idle');
        }
        // O setIsLoading(false) agora é chamado dentro de processJsonData em caso de sucesso/erro
      };
      reader.onerror = () => {
        // O setIsLoading(false) é chamado aqui também
        setError('Erro ao ler o arquivo.');
        setIsLoading(false); // Adicionado aqui
        setStatus('idle');
      };
      reader.readAsText(file);
    },
    [loadSimulado, setStatus, processJsonData] // Adicionar processJsonData às dependências
  );

  // Handler para carregar do texto da textarea
  const handleLoadFromText = () => {
    if (!jsonText.trim()) {
      setError('A caixa de texto está vazia.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setStatus('loading');
    // Adiciona um pequeno delay para o feedback visual do loading ser percebido
    setTimeout(() => {
        processJsonData(jsonText);
        // O setIsLoading(false) é chamado dentro de processJsonData
    }, 100);
  };


  return (
    <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-4 text-center">Carregar Simulado</h2>

      {/* Mensagem de erro global */}
      {error && (
        <Alert variant="error" className="w-full mb-4">
          {error}
        </Alert>
      )}

      {/* Opção 1: Carregar Arquivo */}
      <div className="mb-6">
        <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
          Opção 1: Carregar arquivo .json
        </label>
        <div className="flex items-center gap-2">
           <Button
             onClick={() => fileInputRef.current?.click()}
             disabled={isLoading}
             variant="outline"
             className="flex-grow justify-center"
           >
             <Upload size={16} className="mr-2" /> Selecionar Arquivo
           </Button>
           <Input
             id="file-upload"
             ref={fileInputRef}
             type="file"
             accept=".json"
             onChange={handleFileChange}
             disabled={isLoading}
             className="hidden" // Esconde o input padrão
           />
        </div>
      </div>

      {/* Divisor */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-sm text-muted-foreground">OU</span>
        </div>
      </div>

      {/* Opção 2: Colar Texto */}
      <div>
        <label htmlFor="json-text" className="block text-sm font-medium mb-2">
          Opção 2: Colar o texto JSON aqui
        </label>
        <Textarea
          id="json-text"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Cole o conteúdo JSON gerado pela IA aqui..."
          rows={8}
          className="mb-2"
          disabled={isLoading}
        />
        <Button
          onClick={handleLoadFromText}
          disabled={isLoading || !jsonText.trim()}
          className="w-full justify-center"
        >
          {isLoading ? (
             <><Upload size={16} className="mr-2 animate-pulse" /> Carregando...</>
          ) : (
             <><ClipboardPaste size={16} className="mr-2" /> Carregar Texto Colado</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SimuladoLoader;
