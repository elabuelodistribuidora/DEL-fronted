'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

type AddItemPayload = Pick<
  Product,
  'id' | 'name' | 'slug' | 'sku' | 'image' | 'imageUrl' | 'inStock'
> & {
  price: number
  /** Modelo/variante elegido (vacío = por defecto). */
  variantName?: string
  /** Key de la imagen del modelo elegido. */
  variantImage?: string | null
}

type CartStore = {
  items: CartItem[]
  addItem: (product: AddItemPayload, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

/** Id de línea del carrito: producto + modelo (cada modelo = línea aparte). */
const lineId = (productId: string, variantName?: string) =>
  variantName ? `${productId}::${variantName}` : productId

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const variantName = product.variantName ?? ''
        const id = lineId(product.id, variantName)
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  image: product.variantImage ?? product.image,
                  imageUrl: product.imageUrl,
                  inStock: product.inStock,
                },
                variantName: variantName || undefined,
                variantImage: product.variantImage ?? null,
                price: product.price,
                quantity,
              },
            ],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' },
  ),
)
