'use client';

import { useState, ChangeEvent, useEffect } from 'react'; // Importar useEffect
import Link from 'next/link';
import { usePerfilStore } from '@/app/stores/perfilStore';
import { DebugStateViewer } from '@/app/debug/components/DebugStateViewer';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { ArrowLeft, User, Target, Eye, Bell, Coffee } from 'lucide-react';

export default function DebugPerfilPage() {
  // Obter estado e ações da store
  const perfilState = usePerfilStore();
  const {
    nome,
    metasDiarias,
    preferenciasVisuais,
    notificacoesAtivas,
    pausasAtivas,
    atualizarNome,
    atualizarMetasDiarias,
    atualizarPreferenciasVisuais,
    alternarNotificacoes,
    alternarPausas,
    resetarPerfil,
  } = perfilState;

  // Estados locais para controles
  const [novoNome, setNovoNome] = useState(nome);
  // Usar um estado local para todas as metas para facilitar a atualização
  const [novasMetas, setNovasMetas] = useState(metasDiarias);

  // Atualizar estado local se metas da store mudarem (evita dessincronização)
  useEffect(() => { // Corrigido: usar useEffect
    setNovasMetas(metasDiarias);
  }, [metasDiarias]); // Dependência correta para useEffect

  const handleMetaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovasMetas(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  return (
    <Container>
      <Link href="/debug" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Debug Home
      </Link>

      <div className="flex items-center mb-6">
        <User className="h-7 w-7 text-perfil-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Debug - Perfil</h1>
      </div>

      {/* Visualizador de Estado */}
      <DebugStateViewer title="Estado da Store (usePerfilStore)" state={perfilState} defaultOpen />

      {/* Controles */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Controles da Store</h2>
        <div className="space-y-4">

          {/* Controle Informações Pessoais */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><User size={16} className="mr-2"/>Informações Pessoais</h3>
            <div className="flex gap-2 items-end">
              <Input
                label="Nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => atualizarNome(novoNome)} size="sm">
                Atualizar Nome
              </Button>
            </div>
          </Card>

          {/* Controle Metas Diárias */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Target size={16} className="mr-2"/>Metas Diárias</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <Input
                label="Horas Sono"
                type="number"
                name="horasSono" // Adicionar name
                min="1" max="12"
                value={novasMetas.horasSono}
                onChange={handleMetaChange} // Usar handler
              />
              <Input
                label="Tarefas Prio."
                type="number"
                name="tarefasPrioritarias" // Adicionar name
                min="0"
                value={novasMetas.tarefasPrioritarias}
                onChange={handleMetaChange} // Usar handler
              />
              <Input
                label="Copos Água"
                type="number"
                name="coposAgua" // Adicionar name
                min="0"
                value={novasMetas.coposAgua}
                onChange={handleMetaChange} // Usar handler
              />
              <Input
                label="Pausas Prog."
                type="number"
                name="pausasProgramadas" // Adicionar name
                min="0"
                value={novasMetas.pausasProgramadas}
                onChange={handleMetaChange} // Usar handler
              />
            </div>
             <Button onClick={() => atualizarMetasDiarias(novasMetas)} size="sm">
               Atualizar Todas as Metas
             </Button>
          </Card>

          {/* Controle Preferências Visuais */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center"><Eye size={16} className="mr-2"/>Preferências Visuais</h3>
            <div className="flex flex-wrap gap-2"> {/* Usar flex-wrap */}
              <Button onClick={() => atualizarPreferenciasVisuais({ altoContraste: !preferenciasVisuais.altoContraste })} size="sm" variant="outline">
                Alto Contraste: {preferenciasVisuais.altoContraste ? 'ON' : 'OFF'}
              </Button>
              <Button onClick={() => atualizarPreferenciasVisuais({ reducaoEstimulos: !preferenciasVisuais.reducaoEstimulos })} size="sm" variant="outline">
                Red. Estímulos: {preferenciasVisuais.reducaoEstimulos ? 'ON' : 'OFF'}
              </Button>
               <Button onClick={() => atualizarPreferenciasVisuais({ textoGrande: !preferenciasVisuais.textoGrande })} size="sm" variant="outline">
                Texto Grande: {preferenciasVisuais.textoGrande ? 'ON' : 'OFF'}
              </Button>
            </div>
          </Card>

           {/* Controle Preferências Gerais */}
          <Card>
            <h3 className="font-medium mb-2 flex items-center">Preferências Gerais</h3>
            <div className="flex flex-wrap gap-2"> {/* Usar flex-wrap */}
              <Button onClick={alternarNotificacoes} size="sm" variant="outline" icon={<Bell size={14}/>}>
                Lembretes: {notificacoesAtivas ? 'ON' : 'OFF'}
              </Button>
              <Button onClick={alternarPausas} size="sm" variant="outline" icon={<Coffee size={14}/>}>
                Pausas: {pausasAtivas ? 'ON' : 'OFF'}
              </Button>
            </div>
          </Card>

          {/* Reset */}
           <Card>
             <h3 className="font-medium mb-2 text-red-600">Resetar Perfil</h3>
             <Button onClick={resetarPerfil} variant="destructive" size="sm">
               Resetar Configurações do Perfil
             </Button>
             <p className="text-xs text-red-500 mt-1">Atenção: Esta ação restaurará todas as configurações do perfil para o padrão.</p>
           </Card>

        </div>
      </Card>
    </Container>
  );
}