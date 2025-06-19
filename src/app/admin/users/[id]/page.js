"use client"
import AuthGuard from '@/app/components/AuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [orderFilter, setOrderFilter] = useState('all');

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/users/${userId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            
            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !user.isActive
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            setUser(prevUser => ({
                ...prevUser,
                isActive: !prevUser.isActive
            }));
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Failed to update user status. Please try again.');
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('Are you sure you want to deactivate this user? This action will set their status to inactive.')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            alert('User deactivated successfully');
            router.push('/admin/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const getTotalSpent = (orders) => {
        if (!orders || !Array.isArray(orders)) return 0;
        return orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PROCESSING: 'bg-purple-100 text-purple-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            REFUNDED: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredOrders = user?.orders?.filter(order => {
        if (orderFilter === 'all') return true;
        return order.status === orderFilter;
    }) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 text-lg mb-4">Error: {error}</div>
                <button 
                    onClick={fetchUserDetails}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-gray-500 text-lg">User not found</div>
                <Link href="/admin/users" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <AuthGuard requiredRole="ADMIN">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/users">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </Link>
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            {user.avatar ? (
                                <Image width={64} height={64} src={user.avatar} alt={user.username} className="h-16 w-16 rounded-full object-cover" />
                            ) : (
                                user.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/users/${user.id}/edit`}>
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit</span>
                            </button>
                        </Link>
                        <button 
                            onClick={handleToggleStatus}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                user.isActive 
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{user.orders?.length || 0}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalSpent(user.orders))}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-green-600 text-lg font-semibold">{`KES `}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Reviews</p>
                                <p className="text-2xl font-bold text-purple-600">{user.reviews?.length || 0}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="text-lg font-bold text-orange-600">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'orders'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Orders ({user.orders?.length || 0})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* User Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Username</label>
                                                <p className="text-gray-900">{user.username}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email</label>
                                                <p className="text-gray-900">{user.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                                <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">User ID</label>
                                                <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Role</label>
                                                <p className="text-gray-900">{user.role}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Status</label>
                                                <p className="text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Created</label>
                                                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                                <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                {/* Order Filter */}
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                                    <select
                                        value={orderFilter}
                                        onChange={(e) => setOrderFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Orders</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                        <option value="REFUNDED">Refunded</option>
                                    </select>
                                </div>

                                {/* Orders List */}
                                {filteredOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredOrders.map((order) => (
                                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                                                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(order.total)}</p>
                                                    </div>
                                                </div>
                                                
                                                {order.items && order.items.length > 0 && (
                                                    <div className="border-t pt-3">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length}):</p>
                                                        <div className="space-y-1">
                                                            {order.items.map((item) => (
                                                                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                                                    <span>{item.product?.name || 'Product'} (x{item.quantity})</span>
                                                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {orderFilter === 'all' ? 'This user has not placed any orders yet.' : `No ${orderFilter.toLowerCase()} orders found.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}