import { AdminOrderDetail } from '@/components/admin/admin-order-detail'

type Props = { params: Promise<{ id: string }> }

export default async function AdminOrdenDetailPage({ params }: Props) {
  const { id } = await params
  return <AdminOrderDetail id={id} />
}
