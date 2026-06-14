import { api } from '@/utils/api'
import type { Order, OrderStatus, ShippingAddress } from '@/types/order'
import type { Paginated } from '@/types/product'

export type CheckoutPayload = {
  // Envío por transporte propio: el método queda en 'delivery' por defecto en el
  // backend, no se elige carrier en el checkout.
  shippingMethod?: 'delivery' | 'pickup'
  paymentMethod: 'mercadopago' | 'transfer' | 'cash'
  shippingAddress: ShippingAddress
  notes?: string
}

export type CheckoutResponse = {
  order: Order
  payment: {
    configured: boolean
    preferenceId?: string | null
    initPoint?: string | null
  }
}

export const ordersService = {
  checkout: (payload: CheckoutPayload) =>
    api.post<CheckoutResponse>('/orders/checkout', payload),

  listMine: (page = 1, limit = 20) =>
    api.get<Paginated<Order>>(`/orders?page=${page}&limit=${limit}`),

  getOne: (id: string) => api.get<Order>(`/orders/${id}`),

  cancel: (id: string) => api.patch<Order>(`/orders/${id}/cancel`, {}),

  // ── Admin ──
  listAll: (status?: OrderStatus, page = 1, limit = 20) =>
    api.get<Paginated<Order>>(
      `/orders/admin/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
    ),

  updateStatus: (id: string, status: OrderStatus, trackingCode?: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status, trackingCode }),
}
