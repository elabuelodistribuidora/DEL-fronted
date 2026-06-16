'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, ShoppingBag, Package, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  statsService,
  type DashboardStats,
  type ReportType,
} from '@/services/stats.service'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/order'
import { formatPrice } from '@/utils/formatters'

type TopProduct = { productId: string; name: string; unitsSold: number }

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function monthAgoISO() {
  return new Date(Date.now() - 30 * 86400 * 1000).toISOString().slice(0, 10)
}

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export default function AdminReportesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [top, setTop] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(monthAgoISO())
  const [to, setTo] = useState(todayISO())
  const [downloading, setDownloading] = useState<ReportType | null>(null)

  const download = async (type: ReportType) => {
    setDownloading(type)
    try {
      await statsService.downloadReport(type, from, to)
    } finally {
      setDownloading(null)
    }
  }

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

      {/* Descargar reportes PDF por rango */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Descargar reportes (PDF)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elegí el período y descargá el reporte.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 w-40"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 w-40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              loading={downloading === 'summary'}
              onClick={() => download('summary')}
            >
              <Download className="size-4" />
              Resumen de ventas
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              loading={downloading === 'by-client'}
              onClick={() => download('by-client')}
            >
              <Download className="size-4" />
              Ventas por cliente
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              loading={downloading === 'top-products'}
              onClick={() => download('top-products')}
            >
              <Download className="size-4" />
              Más vendidos
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          icon={TrendingUp}
          label="Total en pedidos"
          value={formatPrice(stats?.ventas.revenue ?? 0)}
        />
        <Kpi
          icon={ShoppingBag}
          label="Pedidos"
          value={String(stats?.ventas.orders ?? 0)}
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
                      className="h-full rounded-full bg-primary"
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
