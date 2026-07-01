import { api } from '@/utils/api'

export type ServerCartItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  lineTotal: number
  variantName?: string | null
  variantImage?: string | null
  variantImageUrl?: string | null
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

/** Item a enviar al servidor al reemplazar el carrito (incluye modelo elegido). */
export type CartLineInput = {
  productId: string
  quantity: number
  variantName?: string
  variantImage?: string | null
}

export type ServerCart = {
  items: ServerCartItem[]
  subtotal: number
  itemCount: number
}

export const cartService = {
  get: () => api.get<ServerCart>('/cart'),

  addItem: (item: CartLineInput) =>
    api.post<ServerCart>('/cart/items', {
      productId: item.productId,
      quantity: item.quantity,
      variantName: item.variantName,
      variantImage: item.variantImage,
    }),

  updateItem: (itemId: string, quantity: number) =>
    api.patch<ServerCart>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    api.delete<ServerCart>(`/cart/items/${itemId}`),

  clear: () => api.delete<ServerCart>('/cart'),

  /** Reemplaza el carrito del servidor (vacía + agrega) antes del checkout. */
  replace: async (items: CartLineInput[]) => {
    await cartService.clear()
    let last: ServerCart | null = null
    for (const it of items) {
      last = await cartService.addItem(it)
    }
    return last ?? { items: [], subtotal: 0, itemCount: 0 }
  },
}
