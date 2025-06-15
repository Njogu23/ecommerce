import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;;

    const logs = await prisma.inventoryLog.findMany({
      where: {
        inventoryId: id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 logs for performance
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Inventory logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory logs' },
      { status: 500 }
    );
  }
}