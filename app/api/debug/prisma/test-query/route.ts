import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true }, // Seleciona apenas o ID
      take: 1, // Pega apenas o primeiro usuário encontrado
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("API Prisma Test Query Error:", error);
    return NextResponse.json(
      { message: error.message || 'Failed to execute test query' },
      { status: 500 }
    );
  }
}