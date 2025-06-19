// app/admin/products/new/page.js
import ProductForm from '@/app/components/admin/ProductForm';
import AuthGuard from '@/app/components/AuthGuard';
import { getCategories } from '@/lib/data';

export default async function NewProductPage() {
  const categories = await getCategories();
  
  return (
    <AuthGuard requiredRole="ADMIN">
    <div className="container mx-auto px-4 py-8">
      <ProductForm categories={categories} />
    </div>
    </AuthGuard>
  );
}