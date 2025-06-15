import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;;

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: true,
            category: true
          }
        }
      }
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Inventory item fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;;
    const { change, reason, notes, threshold } = await request.json();

    if (!change || !reason) {
      return NextResponse.json(
        { error: 'Change amount and reason are required' },
        { status: 400 }
      );
    }

    // Start a transaction to update inventory and create log
    const result = await prisma.$transaction(async (tx) => {
      // Get current inventory
      const currentInventory = await tx.inventory.findUnique({
        where: { id },
        include: {
          product: {
            include: {
              images: true,
              category: true
            }
          }
        }
      });

      if (!currentInventory) {
        throw new Error('Inventory item not found');
      }

      const newQuantity = Math.max(0, currentInventory.quantity + change);
      
      // Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id },
        data: {
          quantity: newQuantity,
          ...(threshold !== undefined && { lowStockThreshold: threshold }),
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

      // Create inventory log
      const log = await tx.inventoryLog.create({
        data: {
          inventoryId: id,
          change,
          newQuantity,
          reason,
          metadata: notes ? { notes } : null
        }
      });

      return { inventory: updatedInventory, log };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
