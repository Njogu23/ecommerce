import ProductForm from "@/app/components/admin/ProductForm";

export default async function EditProductPage({ params }) {
    const  id = await params.id
  return <ProductForm productId={id} isEdit={true} />;
}