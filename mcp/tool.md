# Documentação: Recomendações de Uso de Ferramentas MCP - StayFocus

Este documento sugere como as ferramentas do Model Context Protocol (MCP), incluindo as ferramentas padrão e potenciais ferramentas customizadas, podem auxiliar no desenvolvimento e depuração do projeto StayFocus.

## 1. Ferramentas MCP Padrão

Estas são ferramentas geralmente disponíveis que podem ser usadas diretamente para auxiliar no fluxo de trabalho.

*   **`execute_command`:**
    *   **Executar Testes:** Rodar suítes de testes unitários ou de integração (`npm run test`, `yarn test`).
    *   **Iniciar Servidores:** Iniciar servidores de desenvolvimento do frontend e backend (`npm run dev`, `yarn start`).
    *   **Builds:** Executar processos de build (`npm run build`).
    *   **Linting/Formatação:** Rodar linters ou formatadores manualmente (`npm run lint`, `npx prettier --check .`).
    *   **Scripts Customizados:** Executar scripts definidos no `package.json` para tarefas específicas (deploy, seed de banco de dados, etc.).
    *   **Instalar Dependências:** `npm install` ou `yarn install` após clonar o repositório ou trocar de branch.

*   **`read_file`:**
    *   **Verificar Logs:** Ler arquivos de log gerados pelo backend ou outros processos para investigar erros.
    *   **Inspecionar Configurações:** Verificar o conteúdo de arquivos de configuração (`.env`, `tsconfig.json`, etc.) em diferentes ambientes.
    *   **Analisar Saída de Builds:** Ler arquivos gerados durante o processo de build para depuração.

*   **`search_files`:**
    *   **Encontrar Padrões de Código:** Localizar usos específicos de funções, componentes, variáveis ou padrões de código em toda a base (frontend/backend). Útil para refatorações ou investigações.
    *   **Localizar Mensagens de Erro:** Buscar por strings de erro específicas nos logs ou no código.
    *   **Identificar TODOs:** Procurar por comentários `// TODO:` para revisar tarefas pendentes.
    *   **Analisar Uso de API:** Encontrar onde endpoints específicos da API backend são consumidos no frontend.

*   **`list_files`:**
    *   **Explorar Estrutura:** Verificar a estrutura de pastas e arquivos em diferentes partes do projeto ou em diretórios de build/logs.

*   **`replace_in_file` / `write_to_file`:**
    *   **Modificações Rápidas:** Fazer pequenas alterações em arquivos de configuração ou código (com cautela, preferencialmente via Git).
    *   **Scaffolding:** Gerar arquivos básicos de componentes ou módulos (usar com moderação).

## 2. Potenciais Ferramentas MCP Customizadas

Conforme o projeto evolui, pode ser útil criar servidores MCP customizados para tarefas mais específicas do StayFocus:

*   **`stayfocus-debug-mcp` (Exemplo):**
    *   **`get_rag_context(userId, query)`:** Ferramenta para simular a recuperação de contexto do RAG para um usuário e consulta específicos, ajudando a depurar por que o assistente está dando certas respostas.
    *   **`check_user_data(userId, dataType)`:** Ferramenta para inspecionar dados específicos de um usuário no banco de dados (ex: últimas medicações registradas, metas ativas) em um ambiente de teste/staging.
    *   **`trigger_whatsapp_message(userId, message)`:** Ferramenta para enviar uma mensagem de teste via WhatsApp para um usuário específico em staging.
    *   **`view_api_logs(filter)`:** Ferramenta para buscar e exibir logs específicos da API backend em staging/produção (com filtros por usuário, rota, etc.).
    *   **`simulate_pix_payment(userId, plan)`:** Ferramenta para simular um pagamento PIX e ativar/desativar planos de assinatura em staging.

## 3. Fluxos de Trabalho Auxiliados por MCP

*   **Debugging de Erros de Produção/Staging:**
    1.  Usar `search_files` ou `stayfocus-debug-mcp.view_api_logs` para encontrar logs relevantes.
    2.  Usar `read_file` para inspecionar logs completos.
    3.  Usar `stayfocus-debug-mcp.check_user_data` para verificar o estado dos dados do usuário afetado.
    4.  Usar `search_files` no código para localizar a origem do erro.
    5.  (Após correção) Usar `execute_command` para rodar testes relacionados.

*   **Desenvolvimento de Funcionalidades RAG:**
    1.  Implementar a lógica no backend/RAG system.
    2.  Usar `stayfocus-debug-mcp.get_rag_context` para testar a recuperação de contexto.
    3.  Usar `execute_command` para rodar testes unitários/integração do RAG.
    4.  Usar `stayfocus-debug-mcp.trigger_whatsapp_message` ou interagir via frontend de staging para testar o fluxo completo.

*   **Setup de Ambiente:**
    1.  Clonar repositório (manual ou via Git).
    2.  Usar `execute_command` para rodar `npm install` ou `yarn install` no frontend e backend.
    3.  Usar `write_to_file` ou `replace_in_file` para configurar arquivos `.env` básicos (com cuidado para não expor segredos).
    4.  Usar `execute_command` para iniciar servidores de desenvolvimento.

## Conclusão

A integração de ferramentas MCP no fluxo de trabalho de desenvolvimento e depuração pode aumentar a eficiência, permitindo realizar tarefas comuns de forma programática e contextualizada. A criação de ferramentas MCP customizadas, especialmente para interagir com ambientes de staging ou depurar sistemas complexos como o RAG, pode oferecer um valor significativo à medida que o projeto StayFocus cresce.
