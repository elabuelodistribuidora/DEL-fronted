'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MapPin, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService } from '@/services/orders.service'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types/order'
import { formatPrice, formatDateTime } from '@/utils/formatters'

// Transiciones válidas (igual que el backend)
const NEXT_STATES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function AdminOrderDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ordersService
      .getOne(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return
    setUpdatingStatus(status)
    setError(null)
    try {
      const updated = await ordersService.updateStatus(order.id, status)
      setOrder(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Órdenes
        </Link>
        <p className="text-muted-foreground">Orden no encontrada.</p>
      </div>
    )
  }

  const addr = order.shippingAddress
  const nextStates = NEXT_STATES[order.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Órdenes
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => ordersService.downloadPdf(order.id, order.number)}
        >
          <Download className="size-4" />
          PDF
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Orden #{order.number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.user?.name} · {order.user?.email} ·{' '}
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className={`status-badge status-badge--${order.status}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Gestión de estado */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Cambiar estado
        </h2>
        {nextStates.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Esta orden está en un estado final.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {nextStates.map((s) => (
              <Button
                key={s}
                variant={s === 'cancelled' ? 'outline' : 'default'}
                className="rounded-full"
                loading={updatingStatus === s}
                disabled={updatingStatus !== null && updatingStatus !== s}
                onClick={() => changeStatus(s)}
              >
                Marcar como {ORDER_STATUS_LABELS[s].toLowerCase()}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Productos
        </h2>
        <div className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.code ? `Cód. ${item.code} · ` : ''}
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <span className="font-medium">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-heading font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Dirección */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Ubicación de entrega
        </h2>
        <div className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            {addr.fullName} — {addr.street} {addr.number}
            {addr.floor ? `, ${addr.floor}` : ''}, {addr.city}, {addr.province} (
            {addr.postalCode}) · Tel: {addr.phone}
          </p>
        </div>
        {order.notes && (
          <p className="mt-2 text-sm text-muted-foreground">
            Notas: {order.notes}
          </p>
        )}
      </div>
    </div>
  )
}
