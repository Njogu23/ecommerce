// app/api/admin/activities/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all';
    const time = searchParams.get('time') || 'today';
    
    const skip = (page - 1) * limit;

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (time) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        dateFilter = {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        };
        break;
      case 'yesterday':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
        dateFilter = {
          createdAt: {
            gte: startOfYesterday,
            lt: endOfYesterday
          }
        };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = {
          createdAt: {
            gte: weekAgo
          }
        };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = {
          createdAt: {
            gte: monthAgo
          }
        };
        break;
      // 'all' - no date filter
    }

    // Since you might not have a unified Activity table, 
    // we'll aggregate activities from different tables
    let activities = [];

    // Get Orders (if type is 'all' or 'order_created')
    if (type === 'all' || type === 'order_created') {
      const orders = await prisma.order.findMany({
        where: dateFilter,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'order_created' ? limit : Math.ceil(limit / 4)
      });

      const orderActivities = orders.map(order => ({
        id: order.id,
        type: 'order_created',
        description: `New order #${order.id} created - $${order.total?.toFixed(2) || '0.00'}`,
        createdAt: order.createdAt,
        user: order.user,
        metadata: {
          orderId: order.id,
          total: order.total,
          status: order.status
        }
      }));

      activities.push(...orderActivities);
    }

    // Get User Registrations (if type is 'all' or 'user_registered')
    if (type === 'all' || type === 'user_registered') {
      const users = await prisma.user.findMany({
        where: dateFilter,
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          role: true
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'user_registered' ? limit : Math.ceil(limit / 4)
      });

      const userActivities = users.map(user => ({
        id: user.id,
        type: 'user_registered',
        description: `New user registered: ${user.username || user.email}`,
        createdAt: user.createdAt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        metadata: {
          userId: user.id,
          role: user.role
        }
      }));

      activities.push(...userActivities);
    }

    // Get Reviews (if type is 'all' or 'review_submitted')
    if (type === 'all' || type === 'review_submitted') {
      const reviews = await prisma.review.findMany({
        where: dateFilter,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'review_submitted' ? limit : Math.ceil(limit / 4)
      });

      const reviewActivities = reviews.map(review => ({
        id: review.id,
        type: 'review_submitted',
        description: `New ${review.rating}-star review for ${review.product?.name || 'product'}`,
        createdAt: review.createdAt,
        user: review.user,
        metadata: {
          reviewId: review.id,
          rating: review.rating,
          productId: review.product?.id,
          productName: review.product?.name
        }
      }));

      activities.push(...reviewActivities);
    }

    // Get Low Inventory Alerts (if type is 'all' or 'inventory_low')
    if (type === 'all' || type === 'inventory_low') {
      const lowInventory = await prisma.inventory.findMany({
        where: {
          ...dateFilter,
          quantity: {
            lte: 10 // Low stock threshold
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: type === 'inventory_low' ? limit : Math.ceil(limit / 4)
      });

      const inventoryActivities = lowInventory.map(inventory => ({
        id: inventory.id,
        type: 'inventory_low',
        description: `Low inventory alert: ${inventory.product?.name || 'Unknown Product'} (${inventory.quantity} remaining)`,
        createdAt: inventory.updatedAt || inventory.createdAt,
        user: null, // System generated
        metadata: {
          inventoryId: inventory.id,
          productId: inventory.product?.id,
          productName: inventory.product?.name,
          quantity: inventory.quantity,
          sku: inventory.product?.sku
        }
      }));

      activities.push(...inventoryActivities);
    }

    // Sort all activities by date and apply pagination
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = activities.length;
    const paginatedActivities = activities.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginatedActivities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// If you want to create a new activity log entry
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, description, userId, metadata } = await request.json();

    // If you have a dedicated Activity table, you can log activities here
    // const activity = await prisma.activity.create({
    //   data: {
    //     type,
    //     description,
    //     userId,
    //     metadata,
    //     createdAt: new Date()
    //   }
    // });

    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Activity logged successfully' 
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}