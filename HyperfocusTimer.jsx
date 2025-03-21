import React, { useEffect, useState } from 'react';
import { Play, Pause, Stop, Settings, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import useFocusStore from './focusStore';

/**
 * Componente Timer de Hiperfoco
 * 
 * Um componente especializado para ajudar usuários neurodivergentes a gerenciar
 * o hiperfoco, utilizando a técnica Pomodoro com temporizadores visuais claros,
 * feedback imediato e controles simplificados.
 */
const HyperfocusTimer = () => {
  const {
    hyperfocus,
    startHyperfocusSession,
    pauseHyperfocusSession,
    resumeHyperfocusSession,
    stopHyperfocusSession,
    updateHyperfocusSetting,
  } = useFocusStore();

  const [showSettings, setShowSettings] = useState(false);
  const [localDuration, setLocalDuration] = useState(hyperfocus.duration);
  const [localBreakDuration, setLocalBreakDuration] = useState(hyperfocus.breakDuration);
  
  // Solicitar permissão para notificações se necessário
  useEffect(() => {
    if (hyperfocus.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [hyperfocus.notificationsEnabled]);

  // Formatar o tempo restante em MM:SS
  const formatTime = (totalSeconds) => {
    if (!totalSeconds && totalSeconds !== 0) return '--:--';
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular a porcentagem de progresso para o indicador visual
  const calculateProgress = () => {
    if (!hyperfocus.currentSession) return 0;
    
    const { type, remainingSeconds } = hyperfocus.currentSession;
    const totalDuration = type === 'focus' 
      ? hyperfocus.duration * 60 
      : hyperfocus.breakDuration * 60;
    
    return 100 - (remainingSeconds / totalDuration * 100);
  };

  // Definir a cor do timer baseado no tipo de sessão
  const getTimerColor = () => {
    if (!hyperfocus.currentSession) return 'rgb(93, 77, 178)'; // Roxo padrão
    
    return hyperfocus.currentSession.type === 'focus'
      ? 'rgb(93, 77, 178)' // Roxo para foco
      : 'rgb(16, 185, 129)'; // Verde para pausa
  };

  // Aplicar configurações e fechar o modal
  const applySettings = () => {
    updateHyperfocusSetting('duration', localDuration);
    updateHyperfocusSetting('breakDuration', localBreakDuration);
    setShowSettings(false);
  };

  // Toggle para as configurações de som e notificação
  const toggleNotifications = () => {
    updateHyperfocusSetting('notificationsEnabled', !hyperfocus.notificationsEnabled);
  };

  const toggleSound = () => {
    updateHyperfocusSetting('soundEnabled', !hyperfocus.soundEnabled);
  };

  return (
    <div 
      className="hyperfocus-timer bg-white rounded-xl p-6 shadow-md border border-neutral-200 max-w-sm mx-auto"
      aria-labelledby="hyperfocus-title"
    >
      <h2 
        id="hyperfocus-title" 
        className="text-xl font-semibold text-neutral-900 mb-4 flex items-center"
      >
        {hyperfocus.currentSession 
          ? hyperfocus.currentSession.type === 'focus'
            ? 'Sessão de Hiperfoco'
            : 'Tempo de Pausa'
          : 'Timer de Hiperfoco'
        }
        
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="ml-auto p-2 text-neutral-500 hover:text-primary rounded-full hover:bg-primary-light focus-ring transition-colors"
          aria-label="Configurações do timer"
        >
          <Settings size={20} />
        </button>
      </h2>

      {/* Indicador Visual de Tempo */}
      <div className="timer-display mb-6 relative">
        <div 
          className="timer-progress-bg w-full h-4 bg-neutral-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={calculateProgress()}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div 
            className="timer-progress-fill h-full transition-all duration-1000"
            style={{ 
              width: `${calculateProgress()}%`,
              backgroundColor: getTimerColor()
            }}
          />
        </div>
        
        <div className="time-text text-center mt-4 text-4xl font-medium text-neutral-900">
          {formatTime(hyperfocus.currentSession?.remainingSeconds)}
        </div>
        
        {hyperfocus.currentSession && (
          <p className="text-center text-sm text-neutral-500 mt-1">
            {hyperfocus.currentSession.type === 'focus' 
              ? 'Concentre-se na sua tarefa' 
              : 'Faça uma pausa'
            }
          </p>
        )}
      </div>

      {/* Sessões Completadas */}
      {hyperfocus.completedSessions > 0 && (
        <div className="sessions-count text-center mb-4">
          <span className="text-sm text-neutral-500">
            Sessões completadas hoje: 
            <span className="font-medium text-primary ml-1">
              {hyperfocus.completedSessions}
            </span>
          </span>
        </div>
      )}

      {/* Controles do Timer */}
      <div className="timer-controls flex justify-center space-x-3">
        {!hyperfocus.enabled ? (
          <button
            type="button"
            onClick={startHyperfocusSession}
            className="bg-primary text-white py-2 px-6 rounded-lg flex items-center focus-ring transition-colors hover:bg-primary-dark"
            aria-label="Iniciar timer de hiperfoco"
          >
            <Play size={20} className="mr-2" />
            <span>Iniciar</span>
          </button>
        ) : (
          <>
            {hyperfocus.currentSession?.paused ? (
              <button
                type="button"
                onClick={resumeHyperfocusSession}
                className="bg-primary text-white py-2 px-4 rounded-lg flex items-center focus-ring transition-colors hover:bg-primary-dark"
                aria-label="Retomar timer"
              >
                <Play size={20} className="mr-2" />
                <span>Retomar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseHyperfocusSession}
                className="bg-neutral-700 text-white py-2 px-4 rounded-lg flex items-center focus-ring transition-colors hover:bg-neutral-800"
                aria-label="Pausar timer"
              >
                <Pause size={20} className="mr-2" />
                <span>Pausar</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={stopHyperfocusSession}
              className="bg-accent text-white py-2 px-4 rounded-lg flex items-center focus-ring transition-colors hover:bg-accent-dark"
              aria-label="Parar timer"
            >
              <Stop size={20} className="mr-2" />
              <span>Parar</span>
            </button>
          </>
        )}
      </div>
      
      {/* Settings Panel (Conditional) */}
      {showSettings && (
        <div 
          className="settings-panel mt-6 pt-4 border-t border-neutral-200"
          role="dialog" 
          aria-labelledby="settings-title"
        >
          <h3 id="settings-title" className="text-lg font-medium text-neutral-900 mb-3">
            Configurações
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="focus-duration" className="block text-sm font-medium text-neutral-700 mb-1">
                Duração do Foco (minutos)
              </label>
              <input
                type="number"
                id="focus-duration"
                min="1"
                max="90"
                value={localDuration}
                onChange={(e) => setLocalDuration(parseInt(e.target.value) || 25)}
                className="w-full p-2 border border-neutral-300 rounded-md focus-ring"
                aria-label="Duração do foco em minutos"
              />
            </div>
            
            <div>
              <label htmlFor="break-duration" className="block text-sm font-medium text-neutral-700 mb-1">
                Duração da Pausa (minutos)
              </label>
              <input
                type="number"
                id="break-duration"
                min="1"
                max="30"
                value={localBreakDuration}
                onChange={(e) => setLocalBreakDuration(parseInt(e.target.value) || 5)}
                className="w-full p-2 border border-neutral-300 rounded-md focus-ring"
                aria-label="Duração da pausa em minutos"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={toggleNotifications}
                className={`flex items-center px-3 py-2 rounded-md focus-ring ${
                  hyperfocus.notificationsEnabled 
                    ? 'bg-primary-light text-primary' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}
                aria-label={hyperfocus.notificationsEnabled ? "Desativar notificações" : "Ativar notificações"}
                aria-pressed={hyperfocus.notificationsEnabled}
              >
                {hyperfocus.notificationsEnabled ? (
                  <Bell size={18} className="mr-2" />
                ) : (
                  <BellOff size={18} className="mr-2" />
                )}
                <span className="text-sm">Notificações</span>
              </button>
              
              <button
                type="button"
                onClick={toggleSound}
                className={`flex items-center px-3 py-2 rounded-md focus-ring ${
                  hyperfocus.soundEnabled 
                    ? 'bg-primary-light text-primary' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}
                aria-label={hyperfocus.soundEnabled ? "Desativar sons" : "Ativar sons"}
                aria-pressed={hyperfocus.soundEnabled}
              >
                {hyperfocus.soundEnabled ? (
                  <Volume2 size={18} className="mr-2" />
                ) : (
                  <VolumeX size={18} className="mr-2" />
                )}
                <span className="text-sm">Sons</span>
              </button>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 focus-ring"
                aria-label="Cancelar alterações"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={applySettings}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus-ring"
                aria-label="Aplicar configurações"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HyperfocusTimer; 