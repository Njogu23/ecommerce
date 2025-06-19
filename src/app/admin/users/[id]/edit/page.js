"use client"
import AuthGuard from '@/app/components/AuthGuard';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditUserPage({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER',
        isActive: true,
        avatar: ''
    });

    const userId = params?.id;

    // Fetch user data
    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/${userId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            
            const userData = await response.json();
            setUser(userData);
            setFormData({
                username: userData.username || '',
                email: userData.email || '',
                phone: userData.phone || '',
                password: '',
                confirmPassword: '',
                role: userData.role || 'CUSTOMER',
                isActive: userData.isActive !== undefined ? userData.isActive : true,
                avatar: userData.avatar || ''
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Phone is required');
            return false;
        }
        if (formData.password && formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        
        try {
            const { confirmPassword, ...submitData } = formData;
            
            // Only include password if it's being updated
            if (!submitData.password) {
                delete submitData.password;
            }
            
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            router.push('/admin/users');
        } catch (error) {
            console.error('Error updating user:', error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AuthGuard requiredRole="ADMIN">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AuthGuard>
        );
    }

    if (error && !user) {
        return (
            <AuthGuard requiredRole="ADMIN">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-red-500 text-lg mb-4">Error: {error}</div>
                    <Link href="/admin/users">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Back to Users
                        </button>
                    </Link>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard requiredRole="ADMIN">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                        <p className="text-gray-600">Update user information and settings</p>
                    </div>
                    <Link href="/admin/users">
                        <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                            Cancel
                        </button>
                    </Link>
                </div>

                {/* User Info Card */}
                {user && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="h-12 w-12 rounded-full" />
                                ) : (
                                    user.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                                <p className="text-sm text-gray-500">
                                    ID: {user.id.slice(0, 8)}... • 
                                    Joined: {new Date(user.createdAt).toLocaleDateString()} • 
                                    Orders: {user.orders?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role *
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Avatar URL */}
                        <div>
                            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                                Avatar URL (Optional)
                            </label>
                            <input
                                type="url"
                                id="avatar"
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password (Optional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* New Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                Active User
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Link href="/admin/users">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthGuard>
    );
}