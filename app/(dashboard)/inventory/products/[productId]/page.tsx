import { ProductDetailPage } from "@/components/products/product-detail-page"

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params

  return <ProductDetailPage productId={productId} />
}
