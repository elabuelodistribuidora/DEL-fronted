import { api } from '@/utils/api'

export type DashboardStats = {
  catalogo: {
    totalProducts: number
    activeProducts: number
    totalClientes: number
    totalCategorias: number
  }
  clientes: { totalCustomers: number }
  ventas: {
    revenue: number
    paidOrders: number
    ordersByStatus: Record<string, number>
  }
  lowStock: Array<{ id: string; name: string; stock: number; sku?: string | null }>
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
