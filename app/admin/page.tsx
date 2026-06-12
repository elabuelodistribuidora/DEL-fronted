'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { statsService, type DashboardStats } from '@/services/stats.service'
import { ORDER_STATUS_LABELS } from '@/types/order'
import { formatPrice, formatDate } from '@/utils/formatters'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsService
      .dashboard()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const cards = [
    {
      label: 'Productos activos',
      value: stats ? String(stats.catalogo.activeProducts) : '—',
      icon: Package,
      delta: stats ? `${stats.catalogo.totalProducts} en total` : '',
    },
    {
      label: 'Órdenes pendientes',
      value: stats
        ? String(stats.ventas.ordersByStatus['pending'] ?? 0)
        : '—',
      icon: ShoppingBag,
      delta: `${stats?.ventas.paidOrders ?? 0} pagadas`,
    },
    {
      label: 'Clientes registrados',
      value: stats ? String(stats.clientes.totalCustomers) : '—',
      icon: Users,
      delta: stats ? `${stats.catalogo.totalClientes} proveedores` : '',
    },
    {
      label: 'Ventas (pagadas)',
      value: stats ? formatPrice(stats.ventas.revenue) : '—',
      icon: TrendingUp,
      delta: 'Acumulado',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 font-heading text-2xl font-bold text-foreground">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Órdenes recientes */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Órdenes recientes
          </h2>
          <div className="mt-4 space-y-3">
            {stats && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/ordenes/${o.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm hover:border-primary/30"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      #{o.number} — {o.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">
                      {formatPrice(o.total)}
                    </span>
                    <span className={`status-badge status-badge--${o.status}`}>
                      {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no hay órdenes.
              </p>
            )}
          </div>
        </div>

        {/* Stock bajo */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Stock bajo
          </h2>
          <div className="mt-4 space-y-2">
            {stats && stats.lowStock.length > 0 ? (
              stats.lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{p.name}</span>
                  <span
                    className={`font-medium ${p.stock === 0 ? 'text-destructive' : 'text-amber-600'}`}
                  >
                    {p.stock} u.
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin alertas de stock.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
