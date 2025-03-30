'use client';

import React, { useState, useCallback } from 'react';
import { useSimuladoStore, SimuladoData } from '@/app/stores/simuladoStore';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Alert } from '@/app/components/ui/Alert'; // Usando Alert existente para erros

const SimuladoLoader: React.FC = () => {
  const { loadSimulado, setStatus } = useSimuladoStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      setError(null); // Limpa erros anteriores
      setIsLoading(true);
      setStatus('loading'); // Atualiza status global

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error('Falha ao ler o conteúdo do arquivo.');
          }
          const data: SimuladoData = JSON.parse(text);

          // Validação básica da estrutura do JSON (pode ser mais robusta)
          if (!data.metadata || !data.questoes || !Array.isArray(data.questoes)) {
            throw new Error('Estrutura do JSON inválida. Verifique o formato do arquivo.');
          }
          if (data.questoes.length === 0) {
            throw new Error('O arquivo JSON não contém questões.');
          }
          // Validação mais profunda das questões pode ser adicionada aqui

          loadSimulado(data); // Carrega os dados no store (que mudará o status para 'reviewing')
        } catch (err) {
          console.error('Erro ao processar o arquivo JSON:', err);
          setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar o arquivo.');
          setStatus('idle'); // Volta para o estado inicial em caso de erro
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Erro ao ler o arquivo.');
        setIsLoading(false);
        setStatus('idle');
      };
      reader.readAsText(file);
    },
    [loadSimulado, setStatus]
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Carregar Simulado</h2>
      <p className="text-muted-foreground mb-6 text-center">
        Selecione o arquivo JSON do seu simulado para iniciar a conferência.
      </p>
      <Input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        disabled={isLoading}
        className="mb-4"
      />
      {isLoading && <p>Carregando...</p>}
      {error && (
        <Alert variant="error" className="w-full mb-4">
          {error}
        </Alert>
      )}
      {/* O botão de carregar é o próprio input type="file" estilizado ou um label associado */}
    </div>
  );
};

export default SimuladoLoader;
