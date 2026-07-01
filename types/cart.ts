import type { Product } from './product'

export type CartItem = {
  id: string
  product: Pick<
    Product,
    'id' | 'name' | 'slug' | 'sku' | 'image' | 'imageUrl' | 'inStock'
  >
  /** Modelo/variante elegido (vacío = por defecto). */
  variantName?: string
  /** Key de la imagen del modelo elegido (snapshot para el pedido). */
  variantImage?: string | null
  /** Precio unitario mayorista al momento de agregar. */
  price: number
  quantity: number
}

export type Cart = {
  items: CartItem[]
  total: number
  itemCount: number
}
