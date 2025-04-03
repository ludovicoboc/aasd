import { PrismaClient } from '@prisma/client';

// Declara uma variável global para armazenar a instância do Prisma Client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Cria a instância do Prisma Client, reutilizando a instância global em desenvolvimento
// ou criando uma nova instância em produção.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Opcional: Adicionar logs de query para debug
    // log: ['query', 'info', 'warn', 'error'],
  });

// Em desenvolvimento, atribui a nova instância à variável global
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Exporta a instância configurada
export default prisma;