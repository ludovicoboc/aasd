/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores primárias
        'primary': {
          DEFAULT: 'rgb(93, 77, 178)', // Roxo - cor principal
          'light': 'rgba(93, 77, 178, 0.1)', // Versão clara para fundos
          'dark': 'rgb(74, 61, 142)', // Versão escura para hover
        },
        'secondary': {
          DEFAULT: 'rgb(59, 130, 246)', // Azul - cor secundária
          'light': 'rgba(59, 130, 246, 0.1)', // Versão clara para fundos
          'dark': 'rgb(47, 104, 196)', // Versão escura para hover
        },
        'accent': {
          DEFAULT: 'rgb(239, 68, 68)', // Vermelho - destaque
          'light': 'rgba(239, 68, 68, 0.1)', // Versão clara para fundos
          'dark': 'rgb(191, 54, 54)', // Versão escura para hover
        },
        // Cores de semântica
        'success': 'rgb(16, 185, 129)', // Verde
        'warning': 'rgb(245, 158, 11)', // Amarelo
        'error': 'rgb(239, 68, 68)', // Vermelho (mesmo que accent)
        'info': 'rgb(59, 130, 246)', // Azul (mesmo que secondary)
        // Cores neutras limitadas
        'neutral': {
          50: 'rgb(249, 250, 251)', // Fundo muito claro
          100: 'rgb(243, 244, 246)', // Fundo alternativo
          200: 'rgb(229, 231, 235)', // Borda clara, fundo alternativo
          300: 'rgb(209, 213, 219)', // Borda média
          400: 'rgb(156, 163, 175)', // Texto secundário
          500: 'rgb(107, 114, 128)', // Texto terciário
          900: 'rgb(17, 24, 39)', // Texto principal (quase preto)
        },
        // Cores para cada seção, com contraste reduzido para evitar incômodo visual
        inicio: {
          primary: '#4F46E5', // Indigo
          secondary: '#818CF8',
          light: '#EEF2FF90', // Reduzida opacidade para suavizar
        },
        alimentacao: {
          primary: '#10B981', // Esmeralda
          secondary: '#34D399',
          light: '#ECFDF590', // Reduzida opacidade para suavizar
        },
        estudos: {
          primary: '#FF8C00', // Changed from Amber to a darker orange for better contrast
          secondary: '#FFB74D',
          light: '#FFF3E0', // Removed transparency for better contrast
          dark: '#E65100', // Added a dark version for dark mode
        },
        saude: {
          primary: '#EF4444', // Vermelho
          secondary: '#F87171',
          light: '#FEF2F290', // Reduzida opacidade para suavizar
        },
        lazer: {
          primary: '#8B5CF6', // Violeta
          secondary: '#A78BFA',
          light: '#F5F3FF90', // Reduzida opacidade para suavizar
        },
        financas: {
          primary: '#0EA5E9', // Azul céu
          secondary: '#38BDF8',
          light: '#E0F2FE90', // Reduzida opacidade para suavizar
        },
        hiperfocos: {
          primary: '#F97316', // Laranja intenso
          secondary: '#FB923C',
          light: '#FFF7ED90', // Reduzida opacidade para suavizar
        },
        sono: {
          primary: '#5D4DB2', // Roxo azulado (lembrando noite)
          secondary: '#7B6DC3',
          light: '#EDE9FF90', // Reduzida opacidade para suavizar
        },
        perfil: {
          primary: '#3B82F6', // Azul (representando identidade/personalização)
          secondary: '#60A5FA',
          light: '#EFF6FF90', // Reduzida opacidade para suavizar
        },
        autoconhecimento: {
          primary: '#6B7280', // Cinza azulado (calma, reflexão)
          secondary: '#9CA3AF',
          light: '#F9FAFB90', // Reduzida opacidade para suavizar
          hover: '#4B5563', // Versão mais escura para hover
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }], // Texto pequeno
        'sm': ['14px', { lineHeight: '20px' }], // Texto secundário
        'base': ['16px', { lineHeight: '24px' }], // Texto regular
        'lg': ['18px', { lineHeight: '28px' }], // Título H3
        'xl': ['20px', { lineHeight: '28px' }], // Título H2
        '2xl': ['24px', { lineHeight: '32px' }], // Título H1
      },
      spacing: {
        // Sistema de espaçamento baseado em múltiplos de 4px
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px', // Espaçamento padrão
        '6': '24px', // Entre componentes
        '8': '32px',
        '10': '40px', // Entre seções maiores
        '12': '48px',
        '16': '64px', // Margem desktop
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '8px', // Botões, inputs
        'lg': '12px', // Cards
        'xl': '16px',
        'full': '9999px', // Circular
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'focus': '0 0 0 3px rgba(93, 77, 178, 0.45)', // Roxo para foco
        'none': 'none',
      },
      transitionDuration: {
        DEFAULT: '200ms', // Duração de transição padrão
      },
    },
  },
  plugins: [
    // Plugin para acessibilidade aprimorada
    function ({ addBase, addComponents, theme }) {
      // Estilo global para foco
      addBase({
        // Remover outline padrão do navegador
        '*:focus': {
          outline: 'none',
        },
        // Adicionar estilo de foco personalizado para elementos interativos
        'a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible': {
          boxShadow: theme('boxShadow.focus'),
          outlineOffset: '2px',
        },
      });
      
      // Componentes utilitários para acessibilidade
      addComponents({
        '.visually-hidden': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
        '.focus-ring': {
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            inset: '-3px',
            borderRadius: 'inherit',
            border: `2px solid ${theme('colors.primary.DEFAULT')}`,
            opacity: '0',
            pointerEvents: 'none',
          },
          '&:focus-visible:after': {
            opacity: '1',
          },
        },
        // Componentes base para elementos neurodivergentes
        '.focus-mode': {
          backgroundColor: theme('colors.neutral.50'),
          '& > *:not(.focus-element)': {
            opacity: '0.5',
          },
          '& .focus-element': {
            boxShadow: theme('boxShadow.lg'),
            transform: 'scale(1.02)',
          },
        },
      });
    },
  ],
  // Habilitar modo dark para suporte a preferências de contraste
  darkMode: 'class',
  // Variantes adicionais para estados de interação
  variants: {
    extend: {
      backgroundColor: ['active', 'focus-visible'],
      textColor: ['active', 'focus-visible'],
      borderColor: ['active', 'focus-visible'],
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
}
