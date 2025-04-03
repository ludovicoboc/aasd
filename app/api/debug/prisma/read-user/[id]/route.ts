import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// Define o tipo esperado para os parâmetros da rota
interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params; // Extrai o ID da URL

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      // Você pode selecionar campos específicos se necessário
      // select: { id: true, nome: true, createdAt: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: `User with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: user });

  } catch (error: any) {
    console.error(`API Prisma Read Test User (ID: ${id}) Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to read test user' },
      { status: 500 }
    );
  }
}