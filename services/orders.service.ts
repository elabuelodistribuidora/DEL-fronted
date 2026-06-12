import { api } from '@/utils/api'
import type { Order, OrderStatus, ShippingAddress } from '@/types/order'
import type { Paginated } from '@/types/product'

export type CheckoutPayload = {
  shippingMethod: 'andreani' | 'oca' | 'pickup'
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

export type TrackingResponse = {
  method: string
  trackingCode?: string | null
  events: Array<{
    date: string
    status: string
    location?: string
    description: string
  }>
}

export const ordersService = {
  checkout: (payload: CheckoutPayload) =>
    api.post<CheckoutResponse>('/orders/checkout', payload),

  listMine: (page = 1, limit = 20) =>
    api.get<Paginated<Order>>(`/orders?page=${page}&limit=${limit}`),

  getOne: (id: string) => api.get<Order>(`/orders/${id}`),

  getTracking: (id: string) =>
    api.get<TrackingResponse>(`/orders/${id}/tracking`),

  cancel: (id: string) => api.patch<Order>(`/orders/${id}/cancel`, {}),

  // ── Admin ──
  listAll: (status?: OrderStatus, page = 1, limit = 20) =>
    api.get<Paginated<Order>>(
      `/orders/admin/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
    ),

  updateStatus: (id: string, status: OrderStatus, trackingCode?: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status, trackingCode }),
}
