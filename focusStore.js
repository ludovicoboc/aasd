import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store para gerenciar preferências de acessibilidade e modos de foco
 * para usuários neurodivergentes.
 * 
 * Inclui:
 * - Modo de foco global (reduz elementos na interface)
 * - Modo de hiperfoco (temporizador e notificações)
 * - Preferências de interface (animações, densidade, etc.)
 * - Persistência local das configurações
 */
const useFocusStore = create(
  // Middleware para persistir no localStorage
  persist(
    (set, get) => ({
      // Estado do modo de foco
      focusModeEnabled: false,
      // Configurações de interface
      interfaceSettings: {
        reduceAnimations: false,     // Reduzir ou desativar animações
        highContrast: false,         // Aumentar contraste para melhor legibilidade
        largerText: false,           // Texto maior para melhor legibilidade
        reducedDensity: false,       // Espaçamento maior entre elementos
        simplerInterface: false,     // Interface mais simplificada (menos elementos)
        useSystemPreferences: true,  // Usar preferências do sistema quando disponíveis
      },
      // Configurações de hiperfoco
      hyperfocus: {
        enabled: false,              // Temporizador de hiperfoco ativo
        duration: 25,                // Duração em minutos (padrão 25min)
        breakDuration: 5,            // Duração da pausa em minutos
        currentSession: null,        // Sessão atual (null quando inativo)
        completedSessions: 0,        // Contagem de sessões concluídas
        notificationsEnabled: true,  // Notificações habilitadas
        soundEnabled: true,          // Som habilitado
      },
      // Estado dos elementos em foco
      focusedElements: [],           // IDs de elementos em foco especial

      // Ações para modo de foco
      toggleFocusMode: () => set(state => ({ 
        focusModeEnabled: !state.focusModeEnabled 
      })),
      
      setFocusMode: (enabled) => set({ 
        focusModeEnabled: enabled 
      }),
      
      // Ações para configurações de interface
      updateInterfaceSetting: (setting, value) => set(state => ({
        interfaceSettings: {
          ...state.interfaceSettings,
          [setting]: value,
        }
      })),
      
      resetInterfaceSettings: () => set({
        interfaceSettings: {
          reduceAnimations: false,
          highContrast: false,
          largerText: false,
          reducedDensity: false,
          simplerInterface: false,
          useSystemPreferences: true,
        }
      }),
      
      // Ações para hiperfoco
      startHyperfocusSession: () => {
        const { hyperfocus } = get();
        if (hyperfocus.enabled) return; // Já está ativo
        
        set(state => ({
          hyperfocus: {
            ...state.hyperfocus,
            enabled: true,
            currentSession: {
              startTime: new Date(),
              endTime: new Date(Date.now() + state.hyperfocus.duration * 60 * 1000),
              remainingSeconds: state.hyperfocus.duration * 60,
              type: 'focus', // 'focus' ou 'break'
              paused: false,
            }
          }
        }));
        
        // Iniciar o intervalo para atualizar o tempo restante (a cada segundo)
        const intervalId = setInterval(() => {
          const { hyperfocus } = get();
          if (!hyperfocus.enabled || hyperfocus.currentSession.paused) return;
          
          const remaining = Math.max(0, 
            Math.floor((hyperfocus.currentSession.endTime - new Date()) / 1000)
          );
          
          if (remaining <= 0) {
            // Sessão concluída
            clearInterval(intervalId);
            get().completeHyperfocusSession();
          } else {
            // Atualizar tempo restante
            set(state => ({
              hyperfocus: {
                ...state.hyperfocus,
                currentSession: {
                  ...state.hyperfocus.currentSession,
                  remainingSeconds: remaining,
                }
              }
            }));
          }
        }, 1000);
        
        // Armazenar o ID do intervalo para limpeza
        set(state => ({
          hyperfocus: {
            ...state.hyperfocus,
            timerIntervalId: intervalId,
          }
        }));
      },
      
      pauseHyperfocusSession: () => {
        set(state => ({
          hyperfocus: {
            ...state.hyperfocus,
            currentSession: {
              ...state.hyperfocus.currentSession,
              paused: true,
            }
          }
        }));
      },
      
      resumeHyperfocusSession: () => {
        set(state => ({
          hyperfocus: {
            ...state.hyperfocus,
            currentSession: {
              ...state.hyperfocus.currentSession,
              paused: false,
            }
          }
        }));
      },
      
      stopHyperfocusSession: () => {
        const { hyperfocus } = get();
        if (hyperfocus.timerIntervalId) {
          clearInterval(hyperfocus.timerIntervalId);
        }
        
        set(state => ({
          hyperfocus: {
            ...state.hyperfocus,
            enabled: false,
            currentSession: null,
            timerIntervalId: null,
          }
        }));
      },
      
      completeHyperfocusSession: () => {
        const { hyperfocus } = get();
        const isBreak = hyperfocus.currentSession?.type === 'break';
        
        // Limpar o intervalo atual
        if (hyperfocus.timerIntervalId) {
          clearInterval(hyperfocus.timerIntervalId);
        }
        
        // Se for uma sessão de foco, mostrar notificação e aumentar contagem
        if (!isBreak) {
          if (hyperfocus.notificationsEnabled) {
            // Mostrar notificação de conclusão
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Sessão de Hiperfoco Concluída', {
                body: 'Hora de fazer uma pausa!',
                icon: '/logo.png'
              });
            }
          }
          
          if (hyperfocus.soundEnabled) {
            // Tocar som de conclusão
            const sound = new Audio('/sounds/complete.mp3');
            sound.play().catch(() => {
              console.log('Não foi possível reproduzir o som de conclusão');
            });
          }
          
          // Iniciar sessão de pausa
          set(state => ({
            hyperfocus: {
              ...state.hyperfocus,
              completedSessions: state.hyperfocus.completedSessions + 1,
              currentSession: {
                startTime: new Date(),
                endTime: new Date(Date.now() + state.hyperfocus.breakDuration * 60 * 1000),
                remainingSeconds: state.hyperfocus.breakDuration * 60,
                type: 'break',
                paused: false,
              }
            }
          }));
          
          // Iniciar novo intervalo para a pausa
          const breakIntervalId = setInterval(() => {
            const { hyperfocus } = get();
            if (!hyperfocus.enabled || !hyperfocus.currentSession || 
                hyperfocus.currentSession.paused) return;
            
            const remaining = Math.max(0, 
              Math.floor((hyperfocus.currentSession.endTime - new Date()) / 1000)
            );
            
            if (remaining <= 0) {
              // Pausa concluída
              clearInterval(breakIntervalId);
              
              // Notificar fim da pausa
              if (hyperfocus.notificationsEnabled) {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Pausa Concluída', {
                    body: 'Hora de retornar ao foco!',
                    icon: '/logo.png'
                  });
                }
              }
              
              // Resetar para iniciar nova sessão
              set(state => ({
                hyperfocus: {
                  ...state.hyperfocus,
                  enabled: false,
                  currentSession: null,
                  timerIntervalId: null,
                }
              }));
            } else {
              // Atualizar tempo restante da pausa
              set(state => ({
                hyperfocus: {
                  ...state.hyperfocus,
                  currentSession: {
                    ...state.hyperfocus.currentSession,
                    remainingSeconds: remaining,
                  }
                }
              }));
            }
          }, 1000);
          
          // Armazenar o ID do intervalo para limpeza
          set(state => ({
            hyperfocus: {
              ...state.hyperfocus,
              timerIntervalId: breakIntervalId,
            }
          }));
        } else {
          // Se for pausa, finalizar o ciclo completo
          set(state => ({
            hyperfocus: {
              ...state.hyperfocus,
              enabled: false,
              currentSession: null,
              timerIntervalId: null,
            }
          }));
        }
      },
      
      updateHyperfocusSetting: (setting, value) => set(state => ({
        hyperfocus: {
          ...state.hyperfocus,
          [setting]: value,
        }
      })),
      
      // Gerenciamento de elementos em foco
      addFocusedElement: (elementId) => set(state => ({
        focusedElements: [...state.focusedElements, elementId]
      })),
      
      removeFocusedElement: (elementId) => set(state => ({
        focusedElements: state.focusedElements.filter(id => id !== elementId)
      })),
      
      clearFocusedElements: () => set({ focusedElements: [] }),
      
      // Verificar se um elemento está em foco
      isElementFocused: (elementId) => {
        const { focusedElements } = get();
        return focusedElements.includes(elementId);
      },
    }),
    {
      name: 'focus-store', // Nome para o armazenamento no localStorage
      partialize: (state) => ({
        // Armazenar apenas as configurações do usuário, não o estado da sessão atual
        interfaceSettings: state.interfaceSettings,
        hyperfocus: {
          duration: state.hyperfocus.duration,
          breakDuration: state.hyperfocus.breakDuration,
          notificationsEnabled: state.hyperfocus.notificationsEnabled,
          soundEnabled: state.hyperfocus.soundEnabled,
          completedSessions: state.hyperfocus.completedSessions,
        },
      }),
    }
  )
);

export default useFocusStore; 