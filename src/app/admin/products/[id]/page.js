import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Package, Star, User, Calendar, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

const ProductDetailPage = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.href = '/admin/products';
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getStockStatus = (inventory) => {
    if (!inventory || inventory.quantity === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: 'bg-red-500' };
    }
    if (inventory.quantity <= inventory.lowStockThreshold) {
      return { status: 'low-stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: 'bg-yellow-500' };
    }
    return { status: 'in-stock', label: 'In Stock', color: 'bg-green-100 text-green-800', icon: 'bg-green-500' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-4">{`The product you're looking for doesn't exist.`}</p>
          <button 
            onClick={() => window.location.href = '/admin/products'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.inventory);
  const images = product.images?.length > 0 ? product.images : [{ url: '/placeholder-product.jpg', altText: product.name }];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Products
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.href = `/admin/products/${product.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit size={20} />
              Edit Product
            </button>
            <button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={20} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <Image
                height={100}
                width={100}
                  src={images[selectedImageIndex]?.url || '/placeholder-product.jpg'}
                  alt={images[selectedImageIndex]?.altText || product.name}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        height={100}
                        widtt={100}
                        src={image.url}
                        alt={image.altText || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">{product.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900">{product.category?.name || 'Uncategorized'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                </div>
                
                {product.costPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cost Price</label>
                    <p className="text-gray-900">{formatPrice(product.costPrice)}</p>
                  </div>
                )}
                
                {product.discount > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Discount</label>
                    <p className="text-gray-900">{product.discount}%</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Tax</label>
                  <p className="text-gray-900">{product.tax || 0}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Slug</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                    {product.slug}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package size={20} className="text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Stock</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {product.inventory?.quantity || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Low Stock Threshold</span>
                  <span className="text-gray-900">
                    {product.inventory?.lowStockThreshold || 5}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stockStatus.icon}`}></div>
                    <span className="text-sm text-gray-900">{stockStatus.label}</span>
                  </div>
                </div>
                
                {stockStatus.status === 'low-stock' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-yellow-600" />
                      <span className="text-sm text-yellow-800 font-medium">Low Stock Warning</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Stock is running low. Consider restocking soon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Reviews</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {product._count?.reviews || 0}
                  </span>
                </div>
                
                {product.avgRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="text-gray-900 font-medium">{product.avgRating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{formatDate(product.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h2>
              
              <div className="space-y-4">
                {product.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.user.avatar ? (
                            <Image
                            height={100}
                            width={100}
                              src={review.user.avatar} 
                              alt={review.user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.user.username}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {review.isVerified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {review.isApproved ? (
                            <Eye size={14} className="text-green-600" />
                          ) : (
                            <EyeOff size={14} className="text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.content && (
                      <p className="text-gray-700 text-sm ml-11">{review.content}</p>
                    )}
                  </div>
                ))}
                
                {product.reviews.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                      Showing 5 of {product.reviews.length} reviews
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;