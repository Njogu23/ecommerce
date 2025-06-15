// app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
            create: body.images.map(image => ({
              url: image.url,
              altText: image.altText || null
            }))
          }
        }
      });

      // Create inventory record
      await prisma.inventory.create({
        data: {
          productId: newProduct.id,
          quantity: 0, // Default to 0, admin can update
          lowStockThreshold: 5 // Default threshold
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