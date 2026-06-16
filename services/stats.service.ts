import { api } from '@/utils/api'

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
}
