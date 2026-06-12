import type { Product } from './product'

export type CartItem = {
  id: string
  product: Pick<
    Product,
    'id' | 'name' | 'brand' | 'unit' | 'image' | 'imageUrl'
  >
  /** Precio unitario mayorista al momento de agregar (0 si aún sin sesión). */
  price: number
  quantity: number
  variantId?: string
  variantName?: string
}

export type Cart = {
  items: CartItem[]
  total: number
  itemCount: number
}
