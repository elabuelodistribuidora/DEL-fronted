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
}

type CartStore = {
  items: CartItem[]
  addItem: (product: AddItemPayload, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  image: product.image,
                  imageUrl: product.imageUrl,
                  inStock: product.inStock,
                },
                price: product.price,
                quantity,
              },
            ],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === id ? { ...i, quantity } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' },
  ),
)
