import { api } from '@/utils/api'
import { getAuthToken } from '@/store/authStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export type ReportType = 'summary' | 'by-client' | 'top-products'

export type DashboardStats = {
  catalogo: {
    totalProducts: number
    activeProducts: number
    totalMarcas: number
    totalCategorias: number
  }
  clientes: { totalCustomers: number }
  ventas: {
    revenue: number
    orders: number
    ordersByStatus: Record<string, number>
  }
  outOfStock: Array<{ id: string; name: string; sku?: string | null }>
  recentOrders: Array<{
    id: string
    number: number
    status: string
    total: number
    createdAt: string
    user: { name: string; email: string }
  }>
}

export const statsService = {
  dashboard: () => api.get<DashboardStats>('/admin/stats/dashboard'),
  topProducts: (limit = 10) =>
    api.get<Array<{ productId: string; name: string; unitsSold: number }>>(
      `/admin/stats/top-products?limit=${limit}`,
    ),

  /** Descarga un reporte PDF por rango de fechas (YYYY-MM-DD). */
  async downloadReport(type: ReportType, from: string, to: string) {
    const qs = new URLSearchParams({ type })
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const res = await fetch(`${API_BASE}/admin/stats/report?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${getAuthToken() ?? ''}` },
    })
    if (!res.ok) throw new Error('No se pudo generar el reporte')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${type}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
