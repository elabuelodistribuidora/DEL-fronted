import { ProductForm } from '@/components/admin/product-form'

type Props = { params: Promise<{ id: string }> }

export default async function AdminProductoDetailPage({ params }: Props) {
  const { id } = await params
  return <ProductForm id={id} />
}
