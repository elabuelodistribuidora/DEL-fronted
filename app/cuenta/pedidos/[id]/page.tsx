import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { OrderDetail } from '@/components/cuenta/order-detail'

type Props = { params: Promise<{ id: string }> }

export default async function PedidoDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <OrderDetail id={id} />
      </main>
      <SiteFooter />
    </div>
  )
}
