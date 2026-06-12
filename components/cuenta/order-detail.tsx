'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService, type TrackingResponse } from '@/services/orders.service'
import { ORDER_STATUS_LABELS, type Order } from '@/types/order'
import { formatPrice, formatDateTime } from '@/utils/formatters'

export function OrderDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [tracking, setTracking] = useState<TrackingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    ordersService
      .getOne(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
    ordersService
      .getTracking(id)
      .then(setTracking)
      .catch(() => setTracking(null))
  }, [id])

  const handleCancel = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const updated = await ordersService.cancel(order.id)
      setOrder(updated)
    } catch {
      /* noop */
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-32 text-center">
        <p className="font-heading text-lg font-semibold">
          Pedido no encontrado
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/cuenta/pedidos">Mis pedidos</Link>
        </Button>
      </div>
    )
  }

  const addr = order.shippingAddress

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cuenta/pedidos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Mis pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Pedido #{order.number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Realizado el {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className={`status-badge status-badge--${order.status}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Items */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Productos
        </h2>
        <div className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                <Package className="size-5 text-muted-foreground/40" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.brand} · {item.unit}
                  {item.variantName ? ` · ${item.variantName}` : ''} ·{' '}
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>
              {order.shippingCost === 0
                ? 'Gratis'
                : formatPrice(order.shippingCost)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-heading font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Tracking */}
      {tracking && tracking.events.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Seguimiento del envío
          </h2>
          {tracking.trackingCode && (
            <p className="mt-1 text-sm text-muted-foreground">
              Código: <span className="font-mono">{tracking.trackingCode}</span>
            </p>
          )}
          <div className="mt-5 space-y-6">
            {tracking.events.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full ${
                      i === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Package className="size-4" />
                  </div>
                  {i < tracking.events.length - 1 && (
                    <div className="mt-1 h-full w-px bg-border" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-medium text-foreground">{event.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDateTime(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dirección */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Dirección de entrega
        </h2>
        <div className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            {addr.fullName} — {addr.street} {addr.number}
            {addr.floor ? `, ${addr.floor}` : ''}, {addr.city}, {addr.province} (
            {addr.postalCode}) · Tel: {addr.phone}
          </p>
        </div>
      </div>

      {order.status === 'pending' && (
        <Button
          variant="outline"
          className="mt-4 rounded-full text-destructive hover:text-destructive"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}
          Cancelar pedido
        </Button>
      )}
    </div>
  )
}
