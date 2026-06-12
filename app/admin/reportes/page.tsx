'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, ShoppingBag, Package } from 'lucide-react'
import { statsService, type DashboardStats } from '@/services/stats.service'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/order'
import { formatPrice } from '@/utils/formatters'

type TopProduct = { productId: string; name: string; unitsSold: number }

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export default function AdminReportesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [top, setTop] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      statsService.dashboard().catch(() => null),
      statsService.topProducts(10).catch(() => []),
    ])
      .then(([d, t]) => {
        setStats(d)
        setTop(t)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const ordersByStatus = stats?.ventas.ordersByStatus ?? {}
  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0)
  const maxUnits = Math.max(1, ...top.map((t) => t.unitsSold))

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Reportes
      </h1>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          icon={TrendingUp}
          label="Ingresos (pagados)"
          value={formatPrice(stats?.ventas.revenue ?? 0)}
        />
        <Kpi
          icon={ShoppingBag}
          label="Órdenes pagadas"
          value={String(stats?.ventas.paidOrders ?? 0)}
        />
        <Kpi
          icon={Package}
          label="Órdenes totales"
          value={String(totalOrders)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Órdenes por estado */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Órdenes por estado
          </h2>
          <div className="mt-4 space-y-3">
            {STATUS_ORDER.map((s) => {
              const count = ordersByStatus[s] ?? 0
              const pct = totalOrders ? (count / totalOrders) * 100 : 0
              return (
                <div key={s}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {ORDER_STATUS_LABELS[s]}
                    </span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {totalOrders === 0 && (
              <p className="text-sm text-muted-foreground">
                Todavía no hay órdenes.
              </p>
            )}
          </div>
        </div>

        {/* Top productos */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Productos más vendidos
          </h2>
          <div className="mt-4 space-y-3">
            {top.length > 0 ? (
              top.map((t) => (
                <div key={t.productId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate pr-2 text-foreground">
                      {t.name}
                    </span>
                    <span className="shrink-0 font-medium text-muted-foreground">
                      {t.unitsSold} u.
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(t.unitsSold / maxUnits) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no hay ventas registradas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-heading text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  )
}
