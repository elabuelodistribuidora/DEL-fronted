'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, MapPin, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService } from '@/services/orders.service'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types/order'
import { formatPrice, formatDateTime } from '@/utils/formatters'

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

export function AdminOrderDetail({ id }: { id: string }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusDraft, setStatusDraft] = useState<OrderStatus>('pending')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [discountDraft, setDiscountDraft] = useState('')
  const [savingDiscount, setSavingDiscount] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ordersService
      .getOne(id)
      .then((o) => {
        setOrder(o)
        if (o) {
          setStatusDraft(o.status)
          setDiscountDraft(o.discount ? String(o.discount) : '')
        }
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const saveStatus = async () => {
    if (!order) return
    setSaving(true)
    setError(null)
    try {
      const updated = await ordersService.updateStatus(order.id, statusDraft)
      setOrder(updated)
      setStatusDraft(updated.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setSaving(false)
    }
  }

  const saveDiscount = async () => {
    if (!order) return
    setSavingDiscount(true)
    setError(null)
    try {
      const updated = await ordersService.setDiscount(
        order.id,
        Number(discountDraft) || 0,
      )
      setOrder(updated)
      setDiscountDraft(updated.discount ? String(updated.discount) : '')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo aplicar el descuento',
      )
    } finally {
      setSavingDiscount(false)
    }
  }

  const deleteOrder = async () => {
    if (!order) return
    if (
      !window.confirm(
        '¿Eliminar esta orden? Esta acción no se puede deshacer.',
      )
    )
      return
    setDeleting(true)
    setError(null)
    try {
      await ordersService.remove(order.id)
      router.push('/admin/ordenes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
      setDeleting(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Órdenes
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => ordersService.downloadPdf(order.id, order.number)}
          >
            <Download className="size-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            loading={deleting}
            onClick={deleteOrder}
          >
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="break-all font-heading text-xl font-bold text-foreground">
            Orden #{order.id}
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
        <p className="mt-1 text-sm text-muted-foreground">
          Podés establecer cualquier estado y guardar.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
            aria-label="Estado de la orden"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <Button
            className="rounded-full"
            loading={saving}
            disabled={statusDraft === order.status}
            onClick={saveStatus}
          >
            Guardar estado
          </Button>
        </div>
      </div>

      {/* Descuento */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Descuento
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aplicá un % de descuento opcional. Se refleja en el total.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={discountDraft}
              onChange={(e) => setDiscountDraft(e.target.value)}
              placeholder="0"
              aria-label="Porcentaje de descuento"
              className="h-10 w-28 rounded-lg border border-input bg-background px-3 pr-7 text-sm"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            loading={savingDiscount}
            onClick={saveDiscount}
          >
            Aplicar descuento
          </Button>
        </div>
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
        <div className="mt-4 space-y-1 border-t border-border pt-4">
          {order.discount && order.discount > 0 ? (
            <>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal ?? order.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Descuento ({order.discount}%)</span>
                <span>− {formatPrice((order.subtotal ?? 0) - order.total)}</span>
              </div>
            </>
          ) : null}
          <div className="flex justify-between font-heading font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
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
