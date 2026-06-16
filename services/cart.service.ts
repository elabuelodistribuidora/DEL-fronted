import { api } from '@/utils/api'

export type ServerCartItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  lineTotal: number
  product: {
    id: string
    name: string
    slug: string
    sku?: string | null
    image?: string | null
    imageUrl?: string | null
    inStock: boolean
  }
}

export type ServerCart = {
  items: ServerCartItem[]
  subtotal: number
  itemCount: number
}

export const cartService = {
  get: () => api.get<ServerCart>('/cart'),

  addItem: (productId: string, quantity: number) =>
    api.post<ServerCart>('/cart/items', { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    api.patch<ServerCart>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    api.delete<ServerCart>(`/cart/items/${itemId}`),

  clear: () => api.delete<ServerCart>('/cart'),

  /** Reemplaza el carrito del servidor (vacía + agrega) antes del checkout. */
  replace: async (items: Array<{ productId: string; quantity: number }>) => {
    await cartService.clear()
    let last: ServerCart | null = null
    for (const it of items) {
      last = await cartService.addItem(it.productId, it.quantity)
    }
    return last ?? { items: [], subtotal: 0, itemCount: 0 }
  },
}
