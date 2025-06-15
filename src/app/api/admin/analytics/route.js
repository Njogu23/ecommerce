// app/api/admin/analytics/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, eachDayOfInterval, format, isSameDay } from 'date-fns';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';
    
    let days;
    switch (range) {
      case 'day':
        days = 1;
        break;
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      default:
        days = 7;
    }

    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get previous period for comparison
    const prevStartDate = subDays(startDate, days);
    const prevEndDate = subDays(endDate, days);
    const prevOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate
        }
      }
    });

    // Calculate summary metrics
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const prevTotalRevenue = prevOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const revenueChange = prevTotalRevenue > 0 
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;

    const totalOrders = orders.length;
    const prevTotalOrders = prevOrders.length;
    const ordersChange = prevTotalOrders > 0 
      ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 
      : totalOrders > 0 ? 100 : 0;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;
    const avgOrderValueChange = prevAvgOrderValue > 0 
      ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100 
      : avgOrderValue > 0 ? 100 : 0;

    // Get inventory data
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    const inventorySummary = {
      totalProducts: inventory.length,
      inStock: inventory.filter(item => item.quantity > 0).length,
      lowStock: inventory.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length,
      outOfStock: inventory.filter(item => item.quantity <= 0).length
    };

    // Prepare sales trend data
    const salesTrend = dateRange.map(date => {
      const dayOrders = orders.filter(order => 
        isSameDay(new Date(order.createdAt), date)
      );
      const dayTotal = dayOrders.reduce((sum, order) => sum + Number(order.total), 0);
      return {
        date: date.toISOString(),
        total: Number(dayTotal.toFixed(2))
      };
    });

    // Prepare profit trend data
    const profitTrend = dateRange.map(date => {
      const dayOrders = orders.filter(order => 
        isSameDay(new Date(order.createdAt), date)
      );
      
      let totalRevenue = 0;
      let totalCost = 0;
      
      dayOrders.forEach(order => {
        order.items.forEach(item => {
          totalRevenue += Number(item.price) * item.quantity;
          totalCost += Number(item.product.costPrice || 0) * item.quantity;
        });
      });

      const margin = totalRevenue > 0 
        ? ((totalRevenue - totalCost) / totalRevenue) * 100 
        : 0;

      return {
        date: date.toISOString(),
        margin: Number(margin.toFixed(1))
      };
    });

    // Get top performing products
    const productRevenue = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productRevenue[item.productId]) {
          productRevenue[item.productId] = {
            name: item.product.name,
            revenue: 0
          };
        }
        productRevenue[item.productId].revenue += Number(item.price) * item.quantity;
      });
    });

    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(product => ({
        ...product,
        revenue: Number(product.revenue.toFixed(2))
      }));

    // Format recent orders for frontend
    const recentOrders = orders.slice(0, 5).map(order => ({
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    return NextResponse.json({
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        revenueChange: Number(revenueChange.toFixed(1)),
        totalOrders,
        ordersChange: Number(ordersChange.toFixed(1)),
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        avgOrderValueChange: Number(avgOrderValueChange.toFixed(1))
      },
      inventorySummary,
      salesTrend,
      profitTrend,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}