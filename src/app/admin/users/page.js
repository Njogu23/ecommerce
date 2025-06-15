"use client"
import { useState, useEffect } from 'react';

export default function ActivityMonitoringPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('today');
    const [activityFilter, setActivityFilter] = useState('all');
    const [stats, setStats] = useState({});

    // Mock data - replace with actual API calls
    useEffect(() => {
        const mockActivities = [
            {
                id: '1',
                type: 'order_created',
                description: 'New order placed',
                user: { username: 'john_doe', email: 'john@example.com' },
                metadata: { orderId: 'ORD-001', total: 129.99 },
                createdAt: '2024-06-15T10:30:00Z',
                severity: 'info'
            },
            {
                id: '2',
                type: 'user_registered',
                description: 'New customer registration',
                user: { username: 'jane_smith', email: 'jane@example.com' },
                metadata: { source: 'website' },
                createdAt: '2024-06-15T09:15:00Z',
                severity: 'success'
            },
            {
                id: '3',
                type: 'inventory_low',
                description: 'Low stock alert',
                user: null,
                metadata: { productId: 'PROD-123', productName: 'Wireless Headphones', quantity: 2 },
                createdAt: '2024-06-15T08:45:00Z',
                severity: 'warning'
            },
            {
                id: '4',
                type: 'order_cancelled',
                description: 'Order cancelled by customer',
                user: { username: 'mike_wilson', email: 'mike@example.com' },
                metadata: { orderId: 'ORD-002', reason: 'Changed mind' },
                createdAt: '2024-06-15T07:20:00Z',
                severity: 'error'
            },
            {
                id: '5',
                type: 'review_submitted',
                description: 'New product review',
                user: { username: 'sarah_jones', email: 'sarah@example.com' },
                metadata: { productId: 'PROD-456', rating: 5, productName: 'Smart Watch' },
                createdAt: '2024-06-15T06:30:00Z',
                severity: 'info'
            },
            {
                id: '6',
                type: 'payment_failed',
                description: 'Payment processing failed',
                user: { username: 'alex_brown', email: 'alex@example.com' },
                metadata: { orderId: 'ORD-003', amount: 89.99, reason: 'Insufficient funds' },
                createdAt: '2024-06-14T23:45:00Z',
                severity: 'error'
            },
            {
                id: '7',
                type: 'inventory_restocked',
                description: 'Inventory restocked',
                user: null,
                metadata: { productId: 'PROD-789', productName: 'Gaming Mouse', quantity: 50 },
                createdAt: '2024-06-14T22:15:00Z',
                severity: 'success'
            },
            {
                id: '8',
                type: 'user_login',
                description: 'User logged in',
                user: { username: 'admin_user', email: 'admin@example.com' },
                metadata: { ipAddress: '192.168.1.100', userAgent: 'Chrome/91.0' },
                createdAt: '2024-06-14T20:30:00Z',
                severity: 'info'
            }
        ];

        const mockStats = {
            totalActivities: 156,
            todayActivities: 23,
            orders: { total: 45, today: 8 },
            users: { total: 234, today: 3 },
            revenue: { total: 12450.99, today: 567.89 },
            alerts: { total: 12, critical: 2, warning: 7, info: 3 }
        };

        setTimeout(() => {
            setActivities(mockActivities);
            setStats(mockStats);
            setLoading(false);
        }, 1000);
    }, []);

    const getActivityIcon = (type) => {
        const icons = {
            order_created: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            user_registered: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            inventory_low: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            order_cancelled: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            review_submitted: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            payment_failed: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            inventory_restocked: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            user_login: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            )
        };
        return icons[type] || (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    };

    const getSeverityColor = (severity) => {
        const colors = {
            success: 'bg-green-100 text-green-800 border-green-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            error: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[severity] || colors.info;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const minutes = Math.floor((now - date) / (1000 * 60));
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const filteredActivities = activities.filter(activity => {
        if (activityFilter === 'all') return true;
        return activity.type === activityFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <AuthGuard requiredRole="Admin">
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Monitoring</h1>
                    <p className="text-gray-600">Monitor system activities and user behavior in real-time</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Export</span>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Activities</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                            <p className="text-sm text-green-600">+{stats.todayActivities} today</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Orders Today</p>
                            <p className="text-2xl font-bold text-green-600">{stats.orders?.today}</p>
                            <p className="text-sm text-gray-500">of {stats.orders?.total} total</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Revenue Today</p>
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.revenue?.today)}</p>
                            <p className="text-sm text-gray-500">of {formatCurrency(stats.revenue?.total)}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Alerts</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.alerts?.total}</p>
                            <div className="flex space-x-2 text-xs">
                                <span className="text-red-600">{stats.alerts?.critical} Critical</span>
                                <span className="text-yellow-600">{stats.alerts?.warning} Warning</span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                        <select
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Activities</option>
                            <option value="order_created">Orders</option>
                            <option value="user_registered">User Registration</option>
                            <option value="inventory_low">Inventory Alerts</option>
                            <option value="payment_failed">Payment Issues</option>
                            <option value="review_submitted">Reviews</option>
                        </select>
                    </div>
                    
                    <div className="flex items-end">
                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                    <p className="text-sm text-gray-600">Live feed of system and user activities</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                        <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-start space-x-4">
                                <div className={`p-2 rounded-lg border ${getSeverityColor(activity.severity)}`}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {activity.description}
                                            </h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(activity.severity)}`}>
                                                {activity.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                    
                                    {activity.user && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            by <span className="font-medium">{activity.user.username}</span> ({activity.user.email})
                                        </p>
                                    )}
                                    
                                    {activity.metadata && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            {activity.type === 'order_created' && (
                                                <span>Order #{activity.metadata.orderId} • {formatCurrency(activity.metadata.total)}</span>
                                            )}
                                            {activity.type === 'inventory_low' && (
                                                <span>{activity.metadata.productName} • Only {activity.metadata.quantity} left</span>
                                            )}
                                            {activity.type === 'order_cancelled' && (
                                                <span>Order #{activity.metadata.orderId} • Reason: {activity.metadata.reason}</span>
                                            )}
                                            {activity.type === 'review_submitted' && (
                                                <span>{activity.metadata.productName} • {activity.metadata.rating}★ rating</span>
                                            )}
                                            {activity.type === 'payment_failed' && (
                                                <span>Order #{activity.metadata.orderId} • {formatCurrency(activity.metadata.amount)} • {activity.metadata.reason}</span>
                                            )}
                                            {activity.type === 'inventory_restocked' && (
                                                <span>{activity.metadata.productName} • +{activity.metadata.quantity} units</span>
                                            )}
                                            {activity.type === 'user_login' && (
                                                <span>IP: {activity.metadata.ipAddress} • {activity.metadata.userAgent}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-shrink-0">
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredActivities.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to see more activities.</p>
                    </div>
                )}
            </div>
        </div>
        </AuthGuard>
    );
}