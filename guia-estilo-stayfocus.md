# Guia de Estilo StayFocus

## Sistema de Design para Usuários Neurodivergentes

Este guia de estilo estabelece os padrões visuais e de interação para o aplicativo StayFocus, com foco nas necessidades de usuários neurodivergentes. Os princípios e componentes aqui definidos visam criar uma experiência consistente, acessível e livre de distrações.

## Princípios de Design

1. **Simplicidade:** Eliminar elementos desnecessários e focar no essencial.
2. **Previsibilidade:** Manter padrões consistentes em toda a aplicação.
3. **Clareza:** Comunicar informações de forma direta e sem ambiguidades.
4. **Acessibilidade:** Garantir que todos os usuários possam interagir com a aplicação.
5. **Feedback Imediato:** Fornecer retorno visual para todas as ações do usuário.

## Sistema de Cores

### Cores Primárias

| Cor | Código RGB | Exemplo | Uso |
|-----|------------|---------|-----|
| Roxo | rgb(93, 77, 178) | <div style="background-color: rgb(93, 77, 178); width: 50px; height: 20px;"></div> | Cor principal da marca, elementos de destaque principal |
| Azul | rgb(59, 130, 246) | <div style="background-color: rgb(59, 130, 246); width: 50px; height: 20px;"></div> | Elementos secundários, links e botões alternativos |
| Vermelho | rgb(239, 68, 68) | <div style="background-color: rgb(239, 68, 68); width: 50px; height: 20px;"></div> | Alertas, erros e ações destrutivas |

### Cores Neutras

| Cor | Código RGB | Exemplo | Uso |
|-----|------------|---------|-----|
| Branco | rgb(255, 255, 255) | <div style="background-color: rgb(255, 255, 255); width: 50px; height: 20px; border: 1px solid #ccc;"></div> | Fundo principal, texto em fundos escuros |
| Preto | rgb(0, 0, 0) | <div style="background-color: rgb(0, 0, 0); width: 50px; height: 20px;"></div> | Texto principal |
| Cinza claro | rgb(229, 231, 235) | <div style="background-color: rgb(229, 231, 235); width: 50px; height: 20px;"></div> | Fundos alternativos, separadores |
| Cinza médio | rgb(156, 163, 175) | <div style="background-color: rgb(156, 163, 175); width: 50px; height: 20px;"></div> | Texto secundário, ícones não ativos |

## Tipografia

### Fonte

- **Família**: Inter (sem serifa)
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif

### Tamanhos de Fonte

| Uso | Tamanho | Peso | Exemplo |
|-----|---------|------|---------|
| Título principal (H1) | 24px | Bold (600) | <span style="font-size: 24px; font-weight: 600;">Título Principal</span> |
| Subtítulo (H2) | 20px | SemiBold (500) | <span style="font-size: 20px; font-weight: 500;">Subtítulo</span> |
| Título de seção (H3) | 18px | SemiBold (500) | <span style="font-size: 18px; font-weight: 500;">Título de Seção</span> |
| Texto regular | 16px | Regular (400) | <span style="font-size: 16px; font-weight: 400;">Texto regular para conteúdo principal</span> |
| Texto secundário | 14px | Regular (400) | <span style="font-size: 14px; font-weight: 400;">Texto secundário para informações adicionais</span> |
| Texto pequeno | 12px | Regular (400) | <span style="font-size: 12px; font-weight: 400;">Texto pequeno para notas e detalhes</span> |

## Espaçamento

### Sistema de Grid

- **Base**: 4px
- **Espaçamento interno padrão**: 16px (4 unidades)
- **Espaçamento entre componentes**: 24px (6 unidades)
- **Espaçamento entre seções**: 40px (10 unidades)

### Margens

- **Margem da página (mobile)**: 16px
- **Margem da página (desktop)**: 64px
- **Espaço entre itens de lista**: 16px

## Componentes

### Botões

#### Botão Primário

```html
<button class="btn-primary" aria-label="Descrição da ação">
  Texto do Botão
</button>
```

**Estilo**:
- Fundo: rgb(93, 77, 178) (roxo)
- Texto: rgb(255, 255, 255) (branco)
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: 500
- Transição: 0.2s ease-all

**Estados**:
- Hover: Escurecer 10%
- Focus: Borda branca de 2px com outline offset
- Active: Escurecer 15%
- Disabled: Opacidade 50%

#### Botão Secundário

```html
<button class="btn-secondary" aria-label="Descrição da ação">
  Texto do Botão
</button>
```

**Estilo**:
- Fundo: Transparente
- Borda: rgb(93, 77, 178) (roxo) 1px sólida
- Texto: rgb(93, 77, 178) (roxo)
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: 500
- Transição: 0.2s ease-all

**Estados**:
- Hover: Fundo com 10% da cor primária
- Focus: Borda azul de 2px com outline offset
- Active: Fundo com 15% da cor primária
- Disabled: Opacidade 50%

#### Botão de Ação Destrutiva

```html
<button class="btn-destructive" aria-label="Descrição da ação de remoção">
  Remover
</button>
```

**Estilo**:
- Fundo: rgb(239, 68, 68) (vermelho)
- Texto: rgb(255, 255, 255) (branco)
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: 500
- Transição: 0.2s ease-all

#### Botão de Ícone

```html
<button class="btn-icon" aria-label="Descrição da ação">
  <svg><!-- Ícone --></svg>
</button>
```

**Estilo**:
- Fundo: Transparente
- Tamanho: 40px x 40px
- Border-radius: 20px (circular)
- Ícone: cor do texto principal (adapta-se ao contexto)
- Transição: 0.2s ease-all

### Cards

```html
<div class="card">
  <h3 class="card-title">Título do Card</h3>
  <p class="card-content">Conteúdo do card.</p>
  <div class="card-actions">
    <!-- Botões ou links -->
  </div>
</div>
```

**Estilo**:
- Fundo: rgb(255, 255, 255) (branco)
- Borda: rgb(229, 231, 235) (cinza claro) 1px sólida
- Border-radius: 12px
- Padding: 16px
- Box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)

### Formulários

#### Campos de Texto

```html
<div class="form-group">
  <label for="nome" id="label-nome">Nome</label>
  <input type="text" id="nome" class="form-input" 
         aria-labelledby="label-nome" 
         placeholder="Digite seu nome" />
</div>
```

**Estilo**:
- Fundo: rgb(255, 255, 255) (branco)
- Borda: rgb(156, 163, 175) (cinza médio) 1px sólida
- Border-radius: 8px
- Padding: 12px 16px
- Font-size: 16px

**Estados**:
- Focus: Borda rgb(93, 77, 178) (roxo) 2px sólida
- Error: Borda rgb(239, 68, 68) (vermelho) 2px sólida

#### Switches

```html
<label class="switch">
  <input type="checkbox" aria-label="Ativar opção" />
  <span class="slider"></span>
  <span class="switch-label">Opção</span>
</label>
```

**Estilo**:
- Altura: 24px
- Largura: 44px
- Border-radius: 12px
- Background (off): rgb(156, 163, 175) (cinza médio)
- Background (on): rgb(93, 77, 178) (roxo)

### Ícones

Utilizar o pacote Lucide Icons para todos os ícones da aplicação.

**Tamanhos**:
- Pequeno: 16px x 16px
- Médio: 20px x 20px (padrão)
- Grande: 24px x 24px

**Integração com texto**:
```html
<div class="icon-text">
  <svg class="icon"><!-- Ícone --></svg>
  <span>Texto com ícone</span>
</div>
```

## Estrutura de Página Padrão

```html
<main class="page-container">
  <header class="page-header">
    <h1>Título da Página</h1>
    <p class="page-description">Descrição breve da página</p>
  </header>
  
  <nav class="skip-links" aria-label="Links de atalho">
    <a href="#main-content">Pular para o conteúdo principal</a>
  </nav>
  
  <section id="main-content" class="content-section">
    <h2>Seção Principal</h2>
    <!-- Conteúdo -->
  </section>
  
  <section class="content-section">
    <h2>Seção Secundária</h2>
    <!-- Conteúdo -->
  </section>
  
  <nav class="page-navigation" aria-label="Navegação principal">
    <!-- Menu de navegação -->
  </nav>
</main>
```

## Diretrizes de Acessibilidade

### Requisitos Obrigatórios

1. **ARIA Labels**: Todos os elementos interativos devem ter atributos `aria-label` ou `aria-labelledby`.
2. **Navegação por Teclado**: Todos os elementos interativos devem ser acessíveis via teclado.
3. **Contraste de Cores**: Todo texto deve ter contraste mínimo de 4.5:1 (WCAG AA).
4. **Tamanho de Toque**: Áreas de toque mínimas de 44px x 44px para dispositivos móveis.
5. **Skip Links**: Todas as páginas devem ter links para pular para o conteúdo principal.

### Boas Práticas

1. **Texto Alternativo**: Todas as imagens devem ter texto alternativo descritivo.
2. **Estados Focados**: Todos os elementos interativos devem ter estados de foco visíveis.
3. **Mensagens de Erro**: Erros devem ser claramente comunicados textualmente e visualmente.
4. **Formulários Acessíveis**: Labels associados a cada campo, grupos lógicos com fieldset/legend.
5. **Hierarquia Clara**: Estrutura de cabeçalhos (H1-H6) deve seguir uma hierarquia lógica.

## Componentes Específicos para Usuários Neurodivergentes

### Modo de Foco

```html
<button class="focus-mode-toggle" aria-label="Ativar modo foco">
  <svg><!-- Ícone --></svg>
  <span>Modo Foco</span>
</button>

<div class="focus-mode-container">
  <!-- Conteúdo simplificado -->
</div>
```

**Comportamento**:
- Remove elementos secundários da interface
- Aumenta o espaço em branco entre elementos
- Reduz animações e transições
- Simplifica cores para reduzir distrações

### Timer de Hiperfoco

```html
<div class="hyperfocus-timer">
  <h3>Timer de Hiperfoco</h3>
  <div class="timer-display">25:00</div>
  <div class="timer-controls">
    <button aria-label="Iniciar timer">Iniciar</button>
    <button aria-label="Pausar timer">Pausar</button>
    <button aria-label="Reiniciar timer">Reiniciar</button>
  </div>
</div>
```

**Funcionalidades**:
- Configurável: 5 a 60 minutos
- Alertas visuais e sonoros opcionais
- Pausa automática após cada ciclo

### Indicador de Progresso

```html
<div class="progress-indicator" aria-label="Progresso: 60% concluído">
  <div class="progress-bar" style="width: 60%"></div>
  <div class="progress-text">60%</div>
</div>
```

**Estilo**:
- Altura: 8px
- Border-radius: 4px
- Cor de fundo: rgb(229, 231, 235) (cinza claro)
- Cor de preenchimento: rgb(93, 77, 178) (roxo)

## Responsividade

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Grid Layout

- **Mobile**: 1 coluna
- **Tablet**: 2 colunas
- **Desktop**: 3-4 colunas

### Adaptações Específicas

1. **Menus**: Collapsible em mobile, expandido em desktop
2. **Tabelas**: Scroll horizontal em mobile, completas em desktop
3. **Imagens**: Responsivas com max-width 100%

## Implementação Técnica

### Tecnologias Recomendadas

1. **Tailwind CSS**: Para implementação rápida e consistente do sistema de design
2. **Zustand**: Para gerenciamento de estado simples e eficiente
3. **Lucide Icons**: Para conjunto de ícones consistente
4. **Headless UI**: Para componentes acessíveis base

### Classes de Utilidade Recomendadas

```css
/* Exemplo de classes de utilidade para implementação */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus-ring {
  outline: 2px solid rgb(93, 77, 178);
  outline-offset: 2px;
}
```

---

## Checklist de Implementação

- [ ] Implementar tokens de design no Tailwind config
- [ ] Criar componentes base seguindo os padrões definidos
- [ ] Implementar suporte à acessibilidade em todos os componentes
- [ ] Validar contrastes de cor com ferramenta automatizada
- [ ] Testar toda a interface com leitores de tela
- [ ] Validar navegação por teclado em todos os fluxos
- [ ] Realizar testes com usuários neurodivergentes 