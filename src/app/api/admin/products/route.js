// app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { categoryId: category }),
      ...(status === 'in-stock' && { inventory: { inStock: true } }),
      ...(status === 'out-of-stock' && { inventory: { inStock: false } }),
      ...(status === 'low-stock' && { 
        inventory: { 
          AND: [
            { inStock: true },
            { quantity: { lte: prisma.raw('low_stock_threshold') } }
          ]
        }
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          images: true,
          inventory: true,
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Create product with inventory
    const product = await prisma.$transaction(async (prisma) => {
      const newProduct = await prisma.product.create({
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: body.price,
          tax: body.tax || 0,
          discount: body.discount || 0,
          costPrice: body.costPrice || null,
          categoryId: body.categoryId || null,
          images: {
            create: body.images?.map(image => ({
              url: image.url,
              altText: image.altText || null
            })) || []
          }
        },
        include: {
          category: true,
          images: true
        }
      });

      // Create inventory record
      await prisma.inventory.create({
        data: {
          productId: newProduct.id,
          quantity: body.inventory?.quantity || 0,
          lowStockThreshold: body.inventory?.lowStockThreshold || 5,
          inStock: (body.inventory?.quantity || 0) > 0
        }
      });

      return newProduct;
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}