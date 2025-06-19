// app/admin/activities/page.js (SERVER COMPONENT)
import ActivityMonitoringClient from './ActivityMonitoringClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import { serializePrismaData } from '@/utils/prisma';

const prisma = new PrismaClient();

async function getActivitiesData(type, time, page, limit) {
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
    description: `New order #${order.id} created - $${order.total ? Number(order.total).toFixed(2) : '0.00'}`,
    createdAt: order.createdAt,
    user: order.user,
    metadata: {
      orderId: order.id,
      total: order.total ? Number(order.total) : 0, // Convert Decimal to number
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
            slug: true // Use slug instead of sku, or remove if not needed
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
        slug: inventory.product?.slug // Use slug instead of sku
      }
    }));

    activities.push(...inventoryActivities);
  }

  // Sort all activities by date and apply pagination
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const total = activities.length;
  const paginatedActivities = activities.slice(skip, skip + limit);

  return {
    data: paginatedActivities,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

async function getStatsData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Parallel queries for better performance
  const [
    totalActivitiesCount,
    todayRevenue,
    newUsersToday,
    ordersToday,
    totalUsers,
    totalOrders,
    totalProducts,
    lowInventoryCount
  ] = await Promise.all([
    // Total activities (approximate)
    Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.inventory.count({ where: { quantity: { lte: 10 } } })
    ]).then(([orders, users, reviews, inventory]) => orders + users + reviews + inventory),

    // Today's revenue
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
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

  return {
    totalActivities: totalActivitiesCount,
    revenue: {
      today: todayRevenue._sum.total ? Number(todayRevenue._sum.total) : 0 // Convert Decimal to number
    },
    newUsersToday,
    ordersToday,
    overview: {
      totalUsers,
      totalOrders,
      totalProducts,
      lowInventoryCount
    }
  };
}

export default async function Page({ searchParams }) {
  // Check authentication and admin role
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Handle async searchParams properly
  const resolvedSearchParams = await searchParams;
  
  const page = parseInt(resolvedSearchParams.page || '1');
  const type = resolvedSearchParams.type || 'all';
  const time = resolvedSearchParams.time || 'today';
  const limit = 10;

  try {
    const [activitiesData, stats] = await Promise.all([
  getActivitiesData(type, time, page, limit),
  getStatsData()
]);

return (
  <ActivityMonitoringClient
    activities={serializePrismaData(activitiesData.data) || []}
    stats={serializePrismaData(stats) || {}}
    page={page}
    limit={limit}
    total={activitiesData.total || 0}
  />
);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    
    // Return component with empty data on error
    return (
      <ActivityMonitoringClient
        activities={[]}
        stats={{}}
        page={page}
        limit={limit}
        total={0}
      />
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Add metadata for the page
export const metadata = {
  title: 'Activity Monitoring | Admin Dashboard',
  description: 'Monitor system activities and user behavior',
};