import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // Importa a instância do Prisma

export async function GET() {
  try {
    // Tenta fazer uma consulta simples para verificar a conexão
    // $queryRaw`SELECT 1` é eficiente para apenas checar a conexão
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'connected' });
  } catch (error: any) {
    console.error("API Prisma Status Check Error:", error);
    // Retorna um erro 500 com a mensagem de erro
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to connect to database' },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão seja desconectada se o Prisma Client a mantiver aberta
    // await prisma.$disconnect(); // Descomentar se necessário, mas geralmente não é preciso com a instância global
  }
}