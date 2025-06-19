// app/api/admin/stats/route.js
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

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalActivitiesCount,
      todayOrders,
      todayRevenue,
      newUsersToday,
      ordersToday,
      totalUsers,
      totalOrders,
      totalProducts,
      lowInventoryCount
    ] = await Promise.all([
      // Total activities (approximate - you might want to create an actual activities table)
      Promise.all([
        prisma.order.count(),
        prisma.user.count(),
        prisma.review.count(),
        prisma.inventory.count({ where: { quantity: { lte: 10 } } })
      ]).then(([orders, users, reviews, inventory]) => orders + users + reviews + inventory),

      // Today's orders
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        select: {
          total: true
        }
      }),

      // Today's revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: {
            in: ['COMPLETED', 'SHIPPED', 'DELIVERED']
          }
        },
        _sum: {
          total: true
        }
      }),

      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),

      // Orders count today
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),

      // Total users
      prisma.user.count(),

      // Total orders
      prisma.order.count(),

      // Total products
      prisma.product.count(),

      // Low inventory count
      prisma.inventory.count({
        where: {
          quantity: {
            lte: 10
          }
        }
      })
    ]);

    // Calculate revenue
    const revenueToday = todayRevenue._sum.total || 0;

    // Additional stats for the week
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const [weeklyRevenue, weeklyOrders, weeklyUsers] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: weekAgo
          },
          status: {
            in: ['COMPLETED', 'SHIPPED', 'DELIVERED']
          }
        },
        _sum: {
          total: true
        }
      }),
      
      prisma.order.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      }),
      
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      })
    ]);

    // Recent activity summary
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    const stats = {
      totalActivities: totalActivitiesCount,
      revenue: {
        today: revenueToday,
        week: weeklyRevenue._sum.total || 0
      },
      newUsersToday,
      ordersToday,
      overview: {
        totalUsers,
        totalOrders,
        totalProducts,
        lowInventoryCount
      },
      weekly: {
        revenue: weeklyRevenue._sum.total || 0,
        orders: weeklyOrders,
        users: weeklyUsers
      },
      recent: {
        orders: recentOrders.map(order => ({
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          customer: order.user?.username || order.user?.email || 'Guest'
        })),
        users: recentUsers.map(user => ({
          id: user.id,
          name: user.username || user.email,
          createdAt: user.createdAt
        }))
      },
      // Growth calculations (you might want to cache these)
      growth: {
        usersThisWeek: weeklyUsers,
        ordersThisWeek: weeklyOrders,
        revenueThisWeek: weeklyRevenue._sum.total || 0
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}