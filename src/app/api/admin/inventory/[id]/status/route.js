// app/api/admin/inventory/[id]/status/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;;
    const { inStock } = await request.json();

    if (typeof inStock !== 'boolean') {
      return NextResponse.json(
        { error: 'inStock must be a boolean value' },
        { status: 400 }
      );
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: { 
        inStock,
        updatedAt: new Date()
      },
      include: {
        product: {
          include: {
            images: true,
            category: true
          }
        }
      }
    });

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error('Inventory status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory status' },
      { status: 500 }
    );
  }
}