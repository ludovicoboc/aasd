// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Fornece o caminho para o seu aplicativo Next.js para carregar next.config.js e arquivos .env no seu ambiente de teste
  dir: './',
})

// Adiciona qualquer configuração personalizada a ser passada para o Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Adiciona mais opções de configuração antes de cada teste ser executado
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Descomente se criar um arquivo de setup

  testEnvironment: 'jest-environment-jsdom', // Usa o ambiente jsdom para testes semelhantes ao navegador
  moduleNameMapper: {
    // Lida com aliases de módulo (deve corresponder aos caminhos do tsconfig.json)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'], // Ignora estes diretórios
  transform: {
    // Usa babel-jest para transpilar testes com o preset next/babel
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // Adiciona matchers do jest-dom
}

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js que é assíncrona
module.exports = createJestConfig(customJestConfig)