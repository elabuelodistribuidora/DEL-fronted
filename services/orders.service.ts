import { api } from '@/utils/api'
import { getAuthToken } from '@/store/authStore'
import type { Order, OrderStatus, ShippingAddress } from '@/types/order'
import type { Paginated } from '@/types/product'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export type CheckoutPayload = {
  shippingAddress: ShippingAddress
  notes?: string
}

export type CheckoutResponse = {
  order: Order
}

export const ordersService = {
  checkout: (payload: CheckoutPayload) =>
    api.post<CheckoutResponse>('/orders/checkout', payload),

  listMine: (page = 1, limit = 20) =>
    api.get<Paginated<Order>>(`/orders?page=${page}&limit=${limit}`),

  getOne: (id: string) => api.get<Order>(`/orders/${id}`),

  cancel: (id: string) => api.patch<Order>(`/orders/${id}/cancel`, {}),

  /** Descarga el PDF de la orden y dispara la descarga en el navegador. */
  async downloadPdf(id: string, number?: number) {
    const res = await fetch(`${API_BASE}/orders/${id}/pdf`, {
      headers: { Authorization: `Bearer ${getAuthToken() ?? ''}` },
    })
    if (!res.ok) throw new Error('No se pudo descargar el PDF')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orden-${number ?? id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },

  // ── Admin ──
  listAll: (status?: OrderStatus, page = 1, limit = 20) =>
    api.get<Paginated<Order>>(
      `/orders/admin/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
    ),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
}
