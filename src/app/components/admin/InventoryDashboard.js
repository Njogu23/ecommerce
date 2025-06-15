// components/admin/InventoryDashboard.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'out'

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const res = await fetch(`/api/admin/inventory?filter=${filter}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error('Fetch inventory error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [filter]);

  const getStatusBadge = (item) => {
    if (item.quantity <= 0) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (item.quantity <= item.lowStockThreshold) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          In Stock
        </span>
      );
    }
  };

  const getRowClassName = (item) => {
    if (item.quantity <= 0) return 'bg-red-50';
    if (item.quantity <= item.lowStockThreshold) return 'bg-yellow-50';
    return '';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading inventory</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product inventory and stock levels
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            All Items
            {filter === 'all' && inventory.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                {inventory.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'low' 
                ? 'bg-yellow-600 text-white shadow' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            Low Stock
            {filter === 'low' && inventory.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                {inventory.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'out' 
                ? 'bg-red-600 text-white shadow' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            Out of Stock
            {filter === 'out' && inventory.length > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                {inventory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'all' && 'No inventory items found'}
              {filter === 'low' && 'No low stock items'}
              {filter === 'out' && 'No out of stock items'}
            </h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all' 
                ? 'Start by adding products to your inventory.' 
                : `Great! You don't have any ${filter === 'low' ? 'low stock' : 'out of stock'} items.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add New Product
                </Link>
              </div>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className={`${getRowClassName(item)} hover:bg-gray-50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image 
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200" 
                            src={item.product.images[0].url} 
                            alt={item.product.images[0].altText || item.product.name}
                            width={48}
                            height={48}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`${item.product.images && item.product.images.length > 0 ? 'hidden' : 'flex'} h-12 w-12 rounded-lg bg-gray-100 items-center justify-center border border-gray-200`}
                        >
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.product.category?.name || 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {item.product.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {item.quantity}
                    </div>
                    {item.lowStockThreshold > 0 && (
                      <div className="text-xs text-gray-500">
                        Alert at: {item.lowStockThreshold}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link 
                      href={`/admin/inventory/${item.id}`} 
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Manage
                    </Link>
                    <Link 
                      href={`/admin/products/${item.productId}/edit`} 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Edit Product
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      {inventory.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{inventory.length}</div>
            <div className="text-sm text-gray-500">
              {filter === 'all' && 'Total Items'}
              {filter === 'low' && 'Low Stock Items'}
              {filter === 'out' && 'Out of Stock Items'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Units</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {inventory.filter(item => item.quantity <= item.lowStockThreshold).length}
            </div>
            <div className="text-sm text-gray-500">Need Attention</div>
          </div>
        </div>
      )}
    </div>
  );
}