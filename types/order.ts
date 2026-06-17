export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type ShippingAddress = {
  fullName: string
  street: string
  number: string
  floor?: string
  city: string
  province: string
  postalCode: string
  phone: string
}

/** Item de una orden: snapshot del producto al momento de la compra. */
export type OrderItem = {
  id: string
  productId: string
  code?: string | null
  name: string
  image?: string | null
  unitPrice: number
  quantity: number
  lineTotal?: number
}

export type Order = {
  id: string
  number: number
  userId: string
  status: OrderStatus
  items: OrderItem[]
  shippingAddress: ShippingAddress
  subtotal?: number
  discount?: number
  total: number
  notes?: string | null
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string; email: string }
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En preparación',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}
