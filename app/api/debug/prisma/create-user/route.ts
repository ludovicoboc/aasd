import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST() {
  try {
    // Dados de exemplo para o novo usuário
    const testUserData = {
      id: `test-user-${Date.now()}`, // ID único simples para teste
      nome: 'Usuário de Teste',
      updatedAt: new Date(), // Adicionado para satisfazer o schema
      // Adicione outros campos obrigatórios com valores padrão, se houver
      // Ex: email: `test-${Date.now()}@example.com`,
    };

    const newUser = await prisma.user.create({
      data: testUserData,
      select: { id: true, nome: true }, // Retorna apenas alguns campos para confirmação
    });

    return NextResponse.json({ success: true, user: newUser });

  } catch (error: any) {
    console.error("API Prisma Create Test User Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create test user' },
      { status: 500 }
    );
  }
}