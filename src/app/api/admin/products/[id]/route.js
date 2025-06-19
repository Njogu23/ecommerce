// app/api/admin/products/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: true,
        inventory: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    
    const product = await prisma.$transaction(async (prisma) => {
      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id: params.id },
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: body.price,
          tax: body.tax || 0,
          discount: body.discount || 0,
          costPrice: body.costPrice || null,
          categoryId: body.categoryId || null,
        },
        include: {
          category: true,
          images: true,
          inventory: true
        }
      });

      // Update inventory if provided
      if (body.inventory) {
        await prisma.inventory.upsert({
          where: { productId: params.id },
          update: {
            quantity: body.inventory.quantity,
            lowStockThreshold: body.inventory.lowStockThreshold,
            inStock: body.inventory.quantity > 0
          },
          create: {
            productId: params.id,
            quantity: body.inventory.quantity || 0,
            lowStockThreshold: body.inventory.lowStockThreshold || 5,
            inStock: (body.inventory.quantity || 0) > 0
          }
        });
      }

      // Handle images if provided
      if (body.images) {
        // Delete existing images
        await prisma.productImage.deleteMany({
          where: { productId: params.id }
        });
        
        // Create new images
        if (body.images.length > 0) {
          await prisma.productImage.createMany({
            data: body.images.map(image => ({
              productId: params.id,
              url: image.url,
              altText: image.altText || null
            }))
          });
        }
      }

      return updatedProduct;
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}