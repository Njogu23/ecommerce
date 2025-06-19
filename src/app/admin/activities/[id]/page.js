// app/admin/activities/[id]/page.js
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

const prisma = new PrismaClient();

// Helper function to format date
function formatDate(dateStr) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(new Date(dateStr));
  } catch (error) {
    return dateStr;
  }
}

// Enhanced helper function to convert Decimal to number
function decimalToNumber(decimal) {
  if (decimal === null || decimal === undefined) return 0;
  if (typeof decimal === 'number') return decimal;
  if (typeof decimal === 'string') {
    const parsed = parseFloat(decimal);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Handle Prisma Decimal objects more thoroughly
  if (decimal && typeof decimal === 'object') {
    // Try toNumber method first
    if (typeof decimal.toNumber === 'function') {
      try {
        return decimal.toNumber();
      } catch (e) {
        console.warn('Error calling toNumber:', e);
      }
    }
    
    // Try toString then parse
    if (typeof decimal.toString === 'function') {
      try {
        const str = decimal.toString();
        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0 : parsed;
      } catch (e) {
        console.warn('Error converting toString:', e);
      }
    }
    
    // Handle Decimal.js internal structure
    if (decimal.d !== undefined || decimal.s !== undefined) {
      try {
        const str = String(decimal);
        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0 : parsed;
      } catch (e) {
        console.warn('Error converting Decimal object:', e);
      }
    }
  }
  
  // Last resort - try direct Number conversion
  try {
    const parsed = Number(decimal);
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    console.warn('Error in Number conversion:', e);
    return 0;
  }
}

// Enhanced serialization function with better Decimal handling
function serializeData(data) {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  
  if (typeof data === 'object') {
    // Handle Prisma Decimal objects - multiple checks for reliability
    const isDecimal = (
      data.constructor && (
        data.constructor.name === 'Decimal' || 
        data.constructor.name === 'PrismaDecimal' ||
        data.constructor.toString().includes('Decimal')
      )
    ) || (
      typeof data.toNumber === 'function' && 
      typeof data.toString === 'function' &&
      (data.d !== undefined || data.s !== undefined)
    );
    
    if (isDecimal) {
      return decimalToNumber(data);
    }
    
    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Handle BigInt objects
    if (typeof data === 'bigint') {
      return data.toString();
    }
    
    // Handle regular objects recursively
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }
  
  return data;
}

// Helper function to format currency
function formatCurrency(value) {
  const num = decimalToNumber(value);
  return num.toFixed(2);
}

// Helper function to get activity type info
function getActivityTypeInfo(type) {
  const typeInfo = {
    'order': { 
      label: 'Order', 
      icon: '🛒', 
      color: 'bg-green-100 text-green-800' 
    },
    'order_created': { 
      label: 'Order Created', 
      icon: '🛒', 
      color: 'bg-green-100 text-green-800' 
    },
    'order_updated': { 
      label: 'Order Updated', 
      icon: '🛒', 
      color: 'bg-blue-100 text-blue-800' 
    },
    'user': { 
      label: 'User', 
      icon: '👤', 
      color: 'bg-blue-100 text-blue-800' 
    },
    'user_registered': { 
      label: 'User Registration', 
      icon: '👤', 
      color: 'bg-blue-100 text-blue-800' 
    },
    'review': { 
      label: 'Review', 
      icon: '⭐', 
      color: 'bg-yellow-100 text-yellow-800' 
    },
    'review_submitted': { 
      label: 'Review Submitted', 
      icon: '⭐', 
      color: 'bg-yellow-100 text-yellow-800' 
    },
    'inventory': { 
      label: 'Inventory', 
      icon: '📦', 
      color: 'bg-red-100 text-red-800' 
    },
    'inventory_updated': { 
      label: 'Inventory Updated', 
      icon: '📦', 
      color: 'bg-orange-100 text-orange-800' 
    }
  };
  return typeInfo[type] || { 
    label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
    icon: '📋', 
    color: 'bg-gray-100 text-gray-800' 
  };
}

// Component to render different activity types
function ActivityContent({ type, activity }) {
  // Normalize activity types to base types for rendering
  const baseType = type.replace(/_created|_updated|_submitted/g, '');
  
  switch (baseType) {
    case 'order':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Order ID:</span> {activity.id}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <div><span className="font-medium">Total:</span> ${formatCurrency(activity.total)}</div>
                <div><span className="font-medium">Created:</span> {formatDate(activity.createdAt)}</div>
                {activity.updatedAt && (
                  <div><span className="font-medium">Updated:</span> {formatDate(activity.updatedAt)}</div>
                )}
              </div>
            </div>
            
            {activity.user && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {activity.user.username || activity.user.email}</div>
                  <div><span className="font-medium">Email:</span> {activity.user.email}</div>
                  {activity.user.phone && (
                    <div><span className="font-medium">Phone:</span> {activity.user.phone}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {activity.items && activity.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {activity.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                      <div className="text-sm text-gray-600">Unit Price: ${formatCurrency(item.price)}</div>
                    </div>
                    <div className="font-medium">${formatCurrency(Number(item.price) * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'user':
    case 'user_registered':
      return (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">User ID:</span> {activity.id}</div>
                <div><span className="font-medium">Username:</span> {activity.username || 'N/A'}</div>
                <div><span className="font-medium">Email:</span> {activity.email}</div>
                <div><span className="font-medium">Role:</span> 
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {activity.role || 'CUSTOMER'}
                  </span>
                </div>
                {activity.isActive !== undefined && (
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Created:</span> {formatDate(activity.createdAt)}</div>
                {activity.updatedAt && (
                  <div><span className="font-medium">Updated:</span> {formatDate(activity.updatedAt)}</div>
                )}
                {activity.phone && (
                  <div><span className="font-medium">Phone:</span> {activity.phone}</div>
                )}
                {activity.avatar && (
                  <div><span className="font-medium">Avatar:</span> 
                    <Image src={activity.avatar} alt="User avatar" className="ml-2 w-8 h-8 rounded-full inline-block" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 'review':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Review Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Review ID:</span> {activity.id}</div>
                <div><span className="font-medium">Rating:</span> 
                  <span className="ml-2">{'⭐'.repeat(activity.rating || 0)}</span>
                  <span className="ml-1 text-gray-600">({activity.rating}/5)</span>
                </div>
                <div><span className="font-medium">Created:</span> {formatDate(activity.createdAt)}</div>
              </div>
            </div>

            {activity.user && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Reviewer Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {activity.user.username || activity.user.email}</div>
                  <div><span className="font-medium">Email:</span> {activity.user.email}</div>
                </div>
              </div>
            )}
          </div>

          {activity.product && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Product:</span> {activity.product.name}</div>
                <div><span className="font-medium">Price:</span> ${formatCurrency(activity.product.price)}</div>
              </div>
            </div>
          )}

          {activity.content && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Review Content</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.content}</p>
            </div>
          )}
        </div>
      );

    case 'inventory':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Inventory Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Inventory ID:</span> {activity.id}</div>
                <div><span className="font-medium">Current Stock:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activity.quantity <= 10 ? 'bg-red-100 text-red-800' :
                    activity.quantity <= 20 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.quantity || 0} units
                  </span>
                </div>
                <div><span className="font-medium">Updated:</span> {formatDate(activity.updatedAt || activity.createdAt)}</div>
              </div>
            </div>

            {activity.product && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Product:</span> {activity.product.name}</div>
                  <div><span className="font-medium">Slug:</span> {activity.product.slug || 'N/A'}</div>
                  <div><span className="font-medium">Price:</span> ${formatCurrency(activity.product.price)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Activity Data</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Type:</span> {type}</div>
            <div><span className="font-medium">ID:</span> {activity.id}</div>
            <div><span className="font-medium">Created:</span> {formatDate(activity.createdAt)}</div>
            {activity.updatedAt && (
              <div><span className="font-medium">Updated:</span> {formatDate(activity.updatedAt)}</div>
            )}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View Raw Data
            </summary>
            <pre className="mt-2 text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-64 bg-white p-3 rounded border">
              {JSON.stringify(activity, null, 2)}
            </pre>
          </details>
        </div>
      );
  }
}

export default async function ActivityDetailPage({ params }) {
  const resolvedParams = await params;
  const [type, dbId] = decodeURIComponent(resolvedParams.id).split('-');

  if (!type || !dbId) {
    return notFound();
  }

  let activity = null;
  
  try {
    // Normalize type for database queries (remove suffixes like _created, _updated)
    const baseType = type.replace(/_created|_updated|_submitted/g, '');
    
    switch (baseType) {
      case 'order':
        activity = await prisma.order.findUnique({
          where: { id: dbId },
          include: { 
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phone: true
              }
            }, 
            items: { 
              include: { 
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    slug: true
                  }
                }
              } 
            } 
          }
        });
        break;
        
      case 'user':
      case 'user_registered':
        activity = await prisma.user.findUnique({
          where: { id: dbId },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            phone: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        });
        break;
        
      case 'review':
        activity = await prisma.review.findUnique({
          where: { id: dbId },
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                slug: true
              }
            }, 
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        });
        break;
        
      case 'inventory':
        activity = await prisma.inventory.findUnique({
          where: { id: dbId },
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                slug: true
              }
            }
          }
        });
        break;
        
      default:
        console.log('Unknown activity base type:', baseType, 'from original type:', type);
        return notFound();
    }
  } catch (error) {
    console.error('Error fetching activity:', error);
    return notFound();
  }

  if (!activity) {
    console.log('Activity not found for type:', type, 'id:', dbId);
    return notFound();
  }

  // Debug logging
  console.log('Raw activity data before serialization:', {
    type,
    id: activity.id,
    hasTotal: 'total' in activity,
    totalType: typeof activity.total,
    totalConstructor: activity.total?.constructor?.name,
    hasItems: Array.isArray(activity.items),
    itemsCount: activity.items?.length || 0
  });

  // Serialize the activity data to handle Decimal objects
  const serializedActivity = serializeData(activity);
  
  console.log('Activity data after serialization:', {
    type,
    id: serializedActivity.id,
    total: serializedActivity.total,
    totalType: typeof serializedActivity.total,
    itemsCount: serializedActivity.items?.length || 0
  });

  const typeInfo = getActivityTypeInfo(type);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/activities"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Activities
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{typeInfo.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {typeInfo.label} Activity Detail
                </h1>
                <p className="text-gray-600">
                  Detailed information about this {typeInfo.label.toLowerCase()} activity
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ActivityContent type={type} activity={serializedActivity} />
        </div>

        {/* Raw Data Section (Collapsible) */}
        <details className="bg-white rounded-lg shadow-sm border border-gray-200">
          <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Raw JSON Data</h2>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96 bg-white p-4 rounded border">
                {JSON.stringify(serializedActivity, null, 2)}
              </pre>
            </div>
          </div>
        </details>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {(type.includes('order') || type === 'order') && (
              <>
                <Link
                  href={`/admin/orders/${serializedActivity.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  View Full Order
                </Link>
                {serializedActivity.user && (
                  <Link
                    href={`/admin/users/${serializedActivity.user.id}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    View Customer
                  </Link>
                )}
              </>
            )}
            
            {(type.includes('user') || type === 'user') && (
              <Link
                href={`/admin/users/${serializedActivity.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                View Full Profile
              </Link>
            )}
            
            {(type.includes('review') || type === 'review') && (
              <>
                {serializedActivity.product && (
                  <Link
                    href={`/admin/products/${serializedActivity.product.id}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    View Product
                  </Link>
                )}
                {serializedActivity.user && (
                  <Link
                    href={`/admin/users/${serializedActivity.user.id}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    View Reviewer
                  </Link>
                )}
              </>
            )}
            
            {(type.includes('inventory') || type === 'inventory') && serializedActivity.product && (
              <Link
                href={`/admin/products/${serializedActivity.product.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
              >
                View Product
              </Link>
            )}
            
            <Link
              href="/admin/activities"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add metadata for the page
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const [type] = decodeURIComponent(resolvedParams.id).split('-');
  const typeInfo = getActivityTypeInfo(type);
  
  return {
    title: `${typeInfo.label} Activity Detail | Admin Dashboard`,
    description: `Detailed view of ${typeInfo.label.toLowerCase()} activity`,
  };
}