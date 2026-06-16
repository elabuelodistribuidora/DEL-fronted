'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ordersService } from '@/services/orders.service'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types/order'
import { formatPrice, formatDate } from '@/utils/formatters'

const STATUS_OPTIONS: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersService.listAll(
        filter === 'all' ? undefined : filter,
        page,
        20,
      )
      setOrders(res.data)
      setMeta(res.meta)
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  // Al cambiar el filtro, volver a la página 1
  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Órdenes
        </h1>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as OrderStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'Todas' : ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Items</th>
                <th>Total</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-sm font-medium">#{o.number}</td>
                  <td>{o.user?.name ?? '—'}</td>
                  <td>
                    <span className={`status-badge status-badge--${o.status}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td>{o.items.length}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td className="text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                  <td>
                    <Link
                      href={`/admin/ordenes/${o.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay órdenes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
