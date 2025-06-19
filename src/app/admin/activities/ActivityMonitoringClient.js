"use client"
import AuthGuard from '@/app/components/AuthGuard';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ActivityMonitoringClient({ activities = [], stats = {}, page = 1, limit = 10, total = 0 }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activityFilter, setActivityFilter] = useState(searchParams.get('type') || 'all');
  const [timeFilter, setTimeFilter] = useState(searchParams.get('time') || 'today');

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (activityFilter !== 'all') params.set('type', activityFilter);
    if (timeFilter !== 'today') params.set('time', timeFilter);
    params.set('page', '1'); // Reset to first page when filtering
    router.push(`/admin/activities?${params.toString()}`);
  };

  const formatDate = (dateStr) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true
      }).format(new Date(dateStr));
    } catch (error) {
      return dateStr;
    }
  };

  const getActivityTypeLabel = (type) => {
    const typeLabels = {
      'order_created': 'Order Created',
      'user_registered': 'User Registered',
      'review_submitted': 'Review Submitted',
      'inventory_low': 'Low Inventory Alert',
      'login': 'User Login',
      'logout': 'User Logout'
    };
    return typeLabels[type] || type;
  };

  const getActivityIcon = (type) => {
    const icons = {
      'order_created': '🛒',
      'user_registered': '👤',
      'review_submitted': '⭐',
      'inventory_low': '📦',
      'login': '🔐',
      'logout': '🚪'
    };
    return icons[type] || '📋';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Monitoring</h1>
              <p className="text-gray-600 mt-1">Monitor system activities and user behavior in real-time</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={timeFilter}
                  onChange={e => setTimeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <select
                  value={activityFilter}
                  onChange={e => setActivityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Activities</option>
                  <option value="order_created">Orders</option>
                  <option value="user_registered">User Registration</option>
                  <option value="review_submitted">Reviews</option>
                  <option value="inventory_low">Inventory Alerts</option>
                  <option value="login">User Logins</option>
                  <option value="logout">User Logouts</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleFilterChange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalActivities || 0}
                  </p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${stats.revenue?.today?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Users Today</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.newUsersToday || 0}
                  </p>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orders Today</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.ordersToday || 0}
                  </p>
                </div>
                <div className="text-2xl">🛍️</div>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            </div>
            
            {activities.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more activities.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.map(activity => (
                  <Link 
                    href={`/admin/activities/${activity.type}-${activity.id}`} 
                    key={activity.id} 
                    className="block hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {activity.description || getActivityTypeLabel(activity.type)}
                              </h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getActivityTypeLabel(activity.type)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(activity.createdAt)}
                            </p>
                            {activity.user && (
                              <p className="text-sm text-gray-500 mt-1">
                                by <span className="font-medium text-gray-700">{activity.user.username || activity.user.email}</span>
                              </p>
                            )}
                            {activity.metadata && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-400">
                                  {JSON.stringify(activity.metadata).substring(0, 100)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> activities
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', (page - 1).toString());
                      router.push(`/admin/activities?${params.toString()}`);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('page', pageNum.toString());
                            router.push(`/admin/activities?${params.toString()}`);
                          }}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', (page + 1).toString());
                      router.push(`/admin/activities?${params.toString()}`);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}