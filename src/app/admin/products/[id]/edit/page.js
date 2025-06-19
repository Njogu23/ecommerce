import ProductForm from "@/app/components/admin/ProductForm";

export default function EditProductPage({ params }) {
  return <ProductForm productId={params.id} isEdit={true} />;
}