'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Upload, X, Save, Eye, Package, DollarSign, Tag, FileText, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import AuthGuard from '../AuthGuard';


const ProductForm = ({ productId, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    costPrice: '',
    tax: 0,
    discount: 0,
    categoryId: '',
    images: [],
    inventory: {
      quantity: 0,
      lowStockThreshold: 5
    }
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const [isDirty, setIsDirty] = useState(false);


  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };


  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        const product = data.product;
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          costPrice: product.costPrice?.toString() || '',
          tax: product.tax || 0,
          discount: product.discount || 0,
          categoryId: product.categoryId || '',
          images: product.images || [],
          inventory: {
            quantity: product.inventory?.quantity || 0,
            lowStockThreshold: product.inventory?.lowStockThreshold || 5
          }
        });
        setImagePreview(product.images || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setErrors({ fetch: 'Failed to load product details' });
    }
  }, [productId]);

  useEffect(() => {
    fetchCategories();
    if (isEdit && productId) {
      fetchProduct();
    }
  }, [isEdit, productId, fetchProduct]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setIsDirty(true);
    
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else if (name.startsWith('inventory.')) {
      const inventoryField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [inventoryField]: type === 'number' ? parseInt(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setIsDirty(true);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            url: e.target.result,
            altText: file.name.split('.')[0],
            file: file
          };
          
          setImagePreview(prev => [...prev, newImage]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setIsDirty(true);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) newErrors.costPrice = 'Cost price cannot be negative';
    if (formData.tax < 0 || formData.tax > 100) newErrors.tax = 'Tax must be between 0 and 100';
    if (formData.discount < 0 || formData.discount > 100) newErrors.discount = 'Discount must be between 0 and 100';
    if (formData.inventory.quantity < 0) newErrors['inventory.quantity'] = 'Quantity cannot be negative';
    if (formData.inventory.lowStockThreshold < 0) newErrors['inventory.lowStockThreshold'] = 'Threshold cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        images: formData.images.map(img => ({
          url: img.url,
          altText: img.altText || ''
        }))
      };
      
      const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsDirty(false);
        // Show success message or redirect
        if (typeof window !== 'undefined') {
          window.location.href = `/admin/products/${data.product.id}`;
        }
      } else {
        setErrors({ submit: data.error || 'Failed to save product' });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'An error occurred while saving the product' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Calculate final price after discount
    const basePrice = parseFloat(formData.price) || 0;
    const discountAmount = (basePrice * formData.discount) / 100;
    const finalPrice = basePrice - discountAmount;
    const taxAmount = (finalPrice * formData.tax) / 100;
    const totalPrice = finalPrice + taxAmount;

    const previewData = {
      ...formData,
      calculatedPrices: {
        basePrice,
        discountAmount,
        finalPrice,
        taxAmount,
        totalPrice
      }
    };
    
    console.log('Preview product:', previewData);
    alert('Preview opened in console. In production, this would open a preview modal or new tab.');
  };

  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/products';
    }
  };

  return (
    <AuthGuard requiredRole="ADMIN">
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Products
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h1>
            {isDirty && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handlePreview}
              disabled={!formData.name || !formData.price}
              className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Eye size={20} />
              Preview
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {(errors.submit || errors.fetch) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-700">{errors.submit || errors.fetch}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="product-slug"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated from product name. Used in URLs.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign size={20} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.costPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.costPrice && <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tax ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.tax && <p className="text-red-500 text-sm mt-1">{errors.tax}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.discount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
              </div>
            </div>

            {/* Price Calculator */}
            {formData.price && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Calculation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Base Price:</span>
                    <p className="font-medium">${parseFloat(formData.price || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">After Discount:</span>
                    <p className="font-medium">
                      ${(parseFloat(formData.price || 0) * (1 - formData.discount / 100)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tax Amount:</span>
                    <p className="font-medium">
                      ${((parseFloat(formData.price || 0) * (1 - formData.discount / 100)) * formData.tax / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Final Price:</span>
                    <p className="font-bold text-green-600">
                      ${((parseFloat(formData.price || 0) * (1 - formData.discount / 100)) * (1 + formData.tax / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package size={20} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="inventory.quantity"
                  value={formData.inventory.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['inventory.quantity'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors['inventory.quantity'] && <p className="text-red-500 text-sm mt-1">{errors['inventory.quantity']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="inventory.lowStockThreshold"
                  value={formData.inventory.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['inventory.lowStockThreshold'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5"
                />
                {errors['inventory.lowStockThreshold'] && <p className="text-red-500 text-sm mt-1">{errors['inventory.lowStockThreshold']}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Get notified when stock falls below this number
                </p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Stock Status:</span>
                {formData.inventory.quantity === 0 ? (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Out of Stock</span>
                ) : formData.inventory.quantity <= formData.inventory.lowStockThreshold ? (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Low Stock</span>
                ) : (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">In Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload size={20} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select multiple images. First image will be the primary image.
                </p>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        height={100}
                        width={100}
                        src={image.url}
                        alt={image.altText || `Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.description || !formData.price}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEdit ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
};

export default ProductForm;