import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;
  let updateData: { nome?: string } = {};

  try {
    // Tenta pegar o novo nome do corpo da requisição
    const body = await request.json();
    if (body.nome && typeof body.nome === 'string') {
      updateData.nome = body.nome;
    } else {
      // Se nenhum nome for fornecido, usa um nome padrão de atualização
      updateData.nome = `Nome Atualizado ${Date.now()}`;
    }

  } catch (e) {
     // Se o corpo JSON falhar, usa o nome padrão
     updateData.nome = `Nome Atualizado ${Date.now()}`;
  }


  if (!id) {
    return NextResponse.json(
      { success: false, message: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: { id: true, nome: true }, // Retorna o usuário atualizado
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error(`API Prisma Update Test User (ID: ${id}) Error:`, error);
    // Verifica se o erro é porque o usuário não foi encontrado
    if (error.code === 'P2025') { // Código de erro do Prisma para registro não encontrado
       return NextResponse.json(
        { success: false, message: `User with ID ${id} not found for update` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update test user' },
      { status: 500 }
    );
  }
}