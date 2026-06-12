'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

type AddItemPayload = Pick<
  Product,
  'id' | 'name' | 'brand' | 'unit' | 'image' | 'imageUrl'
> & {
  price: number
  variantId?: string
  variantName?: string
}

type CartStore = {
  items: CartItem[]
  addItem: (product: AddItemPayload, quantity?: number) => void
  removeItem: (id: string, variantId?: string) => void
  updateQuantity: (id: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

function cartItemKey(id: string, variantId?: string) {
  return variantId ? `${id}-${variantId}` : id
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const key = cartItemKey(product.id, product.variantId)
          const existing = state.items.find(
            (i) => cartItemKey(i.product.id, i.variantId) === key,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartItemKey(i.product.id, i.variantId) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: key,
                product: {
                  id: product.id,
                  name: product.name,
                  brand: product.brand,
                  unit: product.unit,
                  image: product.image,
                  imageUrl: product.imageUrl,
                },
                price: product.price,
                quantity,
                variantId: product.variantId,
                variantName: product.variantName,
              },
            ],
          }
        })
      },

      removeItem: (id, variantId) => {
        const key = cartItemKey(id, variantId)
        set((state) => ({
          items: state.items.filter(
            (i) => cartItemKey(i.product.id, i.variantId) !== key,
          ),
        }))
      },

      updateQuantity: (id, quantity, variantId) => {
        const key = cartItemKey(id, variantId)
        if (quantity <= 0) {
          get().removeItem(id, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            cartItemKey(i.product.id, i.variantId) === key
              ? { ...i, quantity }
              : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    },
  ),
)
