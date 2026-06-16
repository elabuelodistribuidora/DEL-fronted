'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/formatters'

/**
 * Banner superior (amarillo) que recuerda que hay productos en el carrito.
 * Se renderiza solo donde se incluya (catálogo) y solo si hay items.
 */
export function CartBanner() {
  const { itemCount, total } = useCart()
  if (itemCount === 0) return null

  return (
    <Link
      href="/carrito"
      className="fixed inset-x-0 bottom-0 z-50 block bg-primary text-primary-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.1)] transition-colors hover:bg-primary/90"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium sm:gap-3">
        <ShoppingCart className="size-4 shrink-0" />
        <span>
          Tenés <strong>{itemCount}</strong>{' '}
          {itemCount === 1 ? 'producto' : 'productos'} en el carrito
          {total > 0 && (
            <span className="hidden sm:inline"> · {formatPrice(total)}</span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
          Ver carrito
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  )
}
