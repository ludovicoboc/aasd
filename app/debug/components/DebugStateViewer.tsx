'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui/Card'; // Reutilizar Card existente
import { Button } from '@/app/components/ui/Button'; // Reutilizar Button existente
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DebugStateViewerProps {
  title: string;
  state: object; // O estado da store Zustand
  defaultOpen?: boolean;
}

/**
 * Componente reutilizável para exibir o estado de uma store Zustand formatado.
 */
export function DebugStateViewer({ title, state, defaultOpen = false }: DebugStateViewerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h3>
        <Button variant="ghost" size="sm" aria-label={isOpen ? 'Esconder estado' : 'Mostrar estado'}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      {isOpen && (
        <pre className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-xs overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </Card>
  );
}