// components/admin/InventoryItemManager.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function InventoryItemManager({ inventoryId }) {
  const [inventory, setInventory] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      changeType: '+',
      change: '',
      reason: '',
      notes: '',
      threshold: ''
    }
  });

  const changeType = watch('changeType');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, logsRes] = await Promise.all([
          fetch(`/api/admin/inventory/${inventoryId}`),
          fetch(`/api/admin/inventory/${inventoryId}/logs`)
        ]);

        if (!invRes.ok) {
          const invError = await invRes.json();
          throw new Error(invError.error || 'Failed to fetch inventory data');
        }
        
        if (!logsRes.ok) {
          const logsError = await logsRes.json();
          throw new Error(logsError.error || 'Failed to fetch logs data');
        }

        const [invData, logsData] = await Promise.all([
          invRes.json(),
          logsRes.json()
        ]);

        setInventory(invData);
        setLogs(logsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (inventoryId) {
      fetchData();
    }
  }, [inventoryId]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Calculate the actual change based on type
      const changeAmount = data.changeType === '+' 
        ? parseInt(data.change) 
        : -parseInt(data.change);

      const res = await fetch(`/api/admin/inventory/${inventoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          change: changeAmount,
          reason: data.reason,
          notes: data.notes,
          threshold: data.threshold ? parseInt(data.threshold) : undefined
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update inventory');

      setSuccess('Inventory updated successfully!');
      setInventory(result.inventory);
      setLogs([result.log, ...logs]);
      reset({
        changeType: '+',
        change: '',
        reason: '',
        notes: '',
        threshold: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/inventory/${inventoryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inStock: !inventory.inStock
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setInventory(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && !inventory) return <div className="text-center py-8">Loading...</div>;
  if (error && !inventory) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!inventory) return <div className="p-4">Inventory not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Inventory
        </button>
        <h1 className="text-2xl font-bold mb-2">Manage Inventory</h1>
        <h2 className="text-xl text-gray-700">{inventory.product.name}</h2>
        <p className="text-gray-500">{inventory.product.category?.name}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Current Stock</h3>
          <div className="text-4xl font-bold mb-2">{inventory.quantity}</div>
          <div className={`text-sm font-medium ${
            inventory.quantity <= 0 ? 'text-red-600' : 
            inventory.quantity <= inventory.lowStockThreshold ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {inventory.quantity <= 0 ? 'Out of Stock' : 
             inventory.quantity <= inventory.lowStockThreshold ? 'Low Stock' : 'In Stock'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Stock Threshold</h3>
          <div className="text-4xl font-bold mb-2">{inventory.lowStockThreshold}</div>
          <div className="text-sm text-gray-500">Low stock alert level</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Product Status</h3>
          <div className="text-2xl font-bold mb-2">
            {inventory.inStock ? 'Active' : 'Inactive'}
          </div>
          <button
            onClick={toggleStatus}
            className={`mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inventory.inStock 
                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {inventory.inStock ? 'Mark as Inactive' : 'Mark as Active'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Update Inventory</h3>
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Amount*
              </label>
              <div className="flex">
                <select
                  {...register('changeType')}
                  className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 border-r-0 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="+">Add (+)</option>
                  <option value="-">Remove (-)</option>
                </select>
                <input
                  type="number"
                  {...register('change', { 
                    required: 'Amount is required', 
                    min: { value: 1, message: 'Amount must be at least 1' }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  placeholder="Enter amount"
                />
              </div>
              {errors.change && (
                <p className="mt-1 text-sm text-red-600">{errors.change.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason*
              </label>
              <select
                {...register('reason', { required: 'Reason is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a reason</option>
                <option value="restock">Restock</option>
                <option value="sale">Sale</option>
                <option value="return">Customer Return</option>
                <option value="damage">Damaged Goods</option>
                <option value="adjustment">Manual Adjustment</option>
                <option value="other">Other</option>
              </select>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Low Stock Threshold (optional)
              </label>
              <input
                type="number"
                {...register('threshold', {
                  min: { value: 0, message: 'Threshold cannot be negative' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                placeholder={`Current: ${inventory.lowStockThreshold}`}
              />
              {errors.threshold && (
                <p className="mt-1 text-sm text-red-600">{errors.threshold.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                {...register('notes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Update Inventory'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Recent Inventory History</h3>
          <div className="overflow-y-auto max-h-96">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No inventory changes recorded yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <li key={log.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            log.change > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.change > 0 ? `+${log.change}` : log.change}
                          </span>
                          <span className="text-sm text-gray-900">
                            New total: {log.newQuantity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 capitalize">
                          {log.reason}
                        </p>
                        {log.metadata?.notes && (
                          <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                            {log.metadata.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}