'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ArrowRight, Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import { ordersService } from '@/services/orders.service'
import { ORDER_STATUS_LABELS, type Order } from '@/types/order'
import { formatPrice, formatDate } from '@/utils/formatters'

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersService
      .listMine()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Mis pedidos
            </h1>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Package className="size-16 text-muted-foreground/30" />
              <p className="font-heading text-lg font-semibold">
                Todavía no tenés pedidos
              </p>
              <Button asChild className="rounded-full">
                <Link href="/catalogo">Ver catálogo</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/cuenta/pedidos/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      Pedido #{order.number}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {order.items.length} producto
                      {order.items.length === 1 ? '' : 's'} ·{' '}
                      {formatDate(order.createdAt)} · {formatPrice(order.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`status-badge status-badge--${order.status}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
