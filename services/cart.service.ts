import { api } from '@/utils/api'

export type ServerCartItem = {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
  variantName?: string | null
  product: {
    id: string
    name: string
    slug: string
    brand: string
    unit: string
    image?: string | null
    imageUrl?: string | null
    stock: number
  }
}

export type ServerCart = {
  items: ServerCartItem[]
  subtotal: number
  itemCount: number
}

export const cartService = {
  get: () => api.get<ServerCart>('/cart'),

  addItem: (productId: string, quantity: number, variantId?: string) =>
    api.post<ServerCart>('/cart/items', { productId, quantity, variantId }),

  updateItem: (itemId: string, quantity: number) =>
    api.patch<ServerCart>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    api.delete<ServerCart>(`/cart/items/${itemId}`),

  clear: () => api.delete<ServerCart>('/cart'),

  /**
   * Reemplaza el carrito del servidor por una lista de items (vacía + agrega).
   * Se usa para sincronizar el carrito local (Zustand) antes del checkout.
   */
  replace: async (
    items: Array<{ productId: string; quantity: number; variantId?: string }>,
  ) => {
    await cartService.clear()
    let last: ServerCart | null = null
    for (const it of items) {
      last = await cartService.addItem(it.productId, it.quantity, it.variantId)
    }
    return last ?? { items: [], subtotal: 0, itemCount: 0 }
  },
}
