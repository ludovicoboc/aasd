import React, { useState } from 'react';
import { X, Clock, Check, AlertTriangle } from 'lucide-react';

/**
 * Card Component
 * 
 * Um componente de card acessível e otimizado para usuários neurodivergentes,
 * com suporte para diferentes variantes, foco visual claro e interações simplificadas.
 * 
 * @param {Object} props
 * @param {string} props.title - Título do card
 * @param {string} props.description - Descrição do conteúdo (opcional)
 * @param {React.ReactNode} props.children - Conteúdo adicional do card
 * @param {boolean} props.isDismissible - Se o card pode ser fechado
 * @param {function} props.onDismiss - Função chamada ao fechar o card
 * @param {string} props.variant - Variante do card (default, info, success, warning, error)
 * @param {boolean} props.isInteractive - Se o card inteiro é clicável
 * @param {function} props.onClick - Função chamada ao clicar no card (se isInteractive=true)
 */
const Card = ({
  title,
  description,
  children,
  isDismissible = false,
  onDismiss,
  variant = 'default',
  isInteractive = false,
  onClick,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Determina as cores e ícones baseado na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return {
          borderColor: 'rgb(59, 130, 246)', // Azul
          icon: <Clock size={20} className="text-blue-500" />,
          headingId: `card-info-heading-${title.replace(/\s+/g, '-').toLowerCase()}`,
        };
      case 'success':
        return {
          borderColor: 'rgb(16, 185, 129)', // Verde
          icon: <Check size={20} className="text-green-500" />,
          headingId: `card-success-heading-${title.replace(/\s+/g, '-').toLowerCase()}`,
        };
      case 'warning':
        return {
          borderColor: 'rgb(245, 158, 11)', // Amarelo
          icon: <AlertTriangle size={20} className="text-amber-500" />,
          headingId: `card-warning-heading-${title.replace(/\s+/g, '-').toLowerCase()}`,
        };
      case 'error':
        return {
          borderColor: 'rgb(239, 68, 68)', // Vermelho
          icon: <AlertTriangle size={20} className="text-red-500" />,
          headingId: `card-error-heading-${title.replace(/\s+/g, '-').toLowerCase()}`,
        };
      default:
        return {
          borderColor: 'rgb(229, 231, 235)', // Cinza claro
          icon: null,
          headingId: `card-heading-${title.replace(/\s+/g, '-').toLowerCase()}`,
        };
    }
  };

  const variantStyles = getVariantStyles();
  
  // Manipuladores de eventos
  const handleDismiss = (e) => {
    e.stopPropagation(); // Previne propagação se o card for interativo
    if (onDismiss) onDismiss();
  };
  
  const handleCardClick = () => {
    if (isInteractive && onClick) onClick();
  };
  
  const toggleFocusMode = (e) => {
    e.stopPropagation(); // Previne propagação se o card for interativo
    setIsFocusMode(!isFocusMode);
  };

  // Classes condicionais
  const cardClasses = `
    relative
    bg-white
    rounded-xl
    p-4
    border-l-4
    shadow-sm
    transition-all
    duration-200
    ${isFocusMode ? 'p-6 border-l-8' : 'p-4 border-l-4'} 
    ${isInteractive ? 'cursor-pointer hover:shadow-md' : ''}
  `;
  
  // Atributos de acessibilidade para cards interativos
  const interactiveProps = isInteractive ? {
    role: 'button',
    tabIndex: 0,
    onClick: handleCardClick,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    'aria-labelledby': variantStyles.headingId,
  } : {};

  return (
    <div 
      className={cardClasses}
      style={{ borderLeftColor: variantStyles.borderColor }}
      {...interactiveProps}
    >
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {variantStyles.icon && (
            <span className="inline-flex" aria-hidden="true">
              {variantStyles.icon}
            </span>
          )}
          <h3 
            id={variantStyles.headingId}
            className="text-lg font-medium text-gray-900"
          >
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão de modo foco */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label={isFocusMode ? "Desativar modo foco" : "Ativar modo foco"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r={isFocusMode ? "8" : "4"} />
            </svg>
          </button>
          
          {/* Botão fechar (condicional) */}
          {isDismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Descrição (condicional) */}
      {description && (
        <p className={`text-gray-600 mb-4 ${isFocusMode ? 'text-base' : 'text-sm'}`}>
          {description}
        </p>
      )}
      
      {/* Conteúdo principal */}
      <div className={isFocusMode ? 'space-y-4' : 'space-y-2'}>
        {children}
      </div>
    </div>
  );
};

/**
 * Exemplo de uso do componente Card
 */
export const CardExample = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Card padrão */}
      <Card 
        title="Card Simples" 
        description="Este é um exemplo de card básico seguindo o guia de estilo."
      >
        <p>Conteúdo do card com informações relevantes para o usuário.</p>
      </Card>
      
      {/* Card informativo */}
      <Card 
        title="Lembrete de Medicação" 
        description="Você tem uma medicação agendada para hoje."
        variant="info"
        isDismissible
        onDismiss={() => console.log('Card informativo fechado')}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">Concerta 15mg</span>
          <span>10:00</span>
        </div>
      </Card>
      
      {/* Card de sucesso */}
      <Card 
        title="Tarefa Concluída" 
        variant="success"
      >
        <p>Você completou sua rotina matinal!</p>
        <div className="mt-2 flex justify-end">
          <button 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
            aria-label="Ver detalhes da tarefa concluída"
          >
            Ver detalhes
          </button>
        </div>
      </Card>
      
      {/* Card interativo */}
      <Card 
        title="Card Clicável" 
        description="Clique neste card para abrir detalhes."
        isInteractive
        onClick={() => console.log('Card clicado')}
      >
        <p>Este card inteiro é clicável e possui estado de foco e hover adequados.</p>
      </Card>
    </div>
  );
};

export default Card; 