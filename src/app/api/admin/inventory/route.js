import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let where = {};
    
    // Fix: Use proper Prisma raw query syntax for comparing fields
    if (filter === 'low') {
      // Items where quantity > 0 but <= lowStockThreshold
      const inventory = await prisma.inventory.findMany({
        where: {
          quantity: { gt: 0 }
        },
        include: {
          product: {
            include: {
              images: true,
              category: true
            }
          }
        },
        orderBy: {
          quantity: 'asc'
        }
      });
      
      // Filter in JavaScript since Prisma doesn't support field comparison in this way
      const lowStockItems = inventory.filter(item => 
        item.quantity <= item.lowStockThreshold
      );
      
      return NextResponse.json(lowStockItems);
    } else if (filter === 'out') {
      where = {
        quantity: { lte: 0 }
      };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            images: true,
            category: true
          }
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}