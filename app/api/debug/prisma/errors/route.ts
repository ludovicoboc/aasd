import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.supabaseErrorLog.findMany({
      take: 5, // Pega os últimos 5 logs
      orderBy: {
        createdAt: 'desc', // Ordena pelos mais recentes primeiro
      },
      select: { // Seleciona apenas os campos necessários para o frontend
        id: true,
        createdAt: true,
        service: true,
        errorMessage: true,
        errorCode: true,
        userId: true,
        source: true,
      },
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("API Prisma Fetch Errors Error:", error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch error logs' },
      { status: 500 }
    );
  }
}