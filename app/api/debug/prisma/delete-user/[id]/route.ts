import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: `User with ID ${id} deleted successfully` });

  } catch (error: any) {
    console.error(`API Prisma Delete Test User (ID: ${id}) Error:`, error);
    // Verifica se o erro é porque o usuário não foi encontrado
    if (error.code === 'P2025') { // Código de erro do Prisma para registro não encontrado
       return NextResponse.json(
        { success: false, message: `User with ID ${id} not found for deletion` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete test user' },
      { status: 500 }
    );
  }
}