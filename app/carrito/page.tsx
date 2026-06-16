'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  ArrowRight,
  Package,
  Minus,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { ImageLoader } from '@/components/ui/image-loader'
import { formatPrice } from '@/utils/formatters'

export default function CarritoPage() {
  const { items, isEmpty, removeItem, updateQuantity, total } = useCart()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Tu carrito
          </h1>

          {isEmpty ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <ShoppingCart className="size-16 text-muted-foreground/30" />
              <p className="font-heading text-lg font-semibold text-foreground">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-muted-foreground">
                Explorá el catálogo y agregá productos.
              </p>
              <Button asChild className="mt-2 rounded-full">
                <Link href="/catalogo">
                  Ver catálogo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Items */}
              <div className="space-y-4 lg:col-span-2">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item__image relative flex items-center justify-center overflow-hidden">
                      {item.product.imageUrl ? (
                        <ImageLoader
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="size-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-heading text-sm font-semibold text-foreground">
                            {item.product.name}
                          </p>
                          {item.product.sku && (
                            <p className="text-xs text-muted-foreground">
                              Cód. {item.product.sku}
                            </p>
                          )}
                          {!item.product.inStock && (
                            <p className="text-xs text-destructive">Sin stock</p>
                          )}
                        </div>
                        <p className="font-heading text-sm font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7 rounded-full"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10)
                            if (Number.isInteger(n) && n >= 1) {
                              updateQuantity(item.product.id, n)
                            }
                          }}
                          className="h-7 w-14 rounded-md border border-border bg-background text-center text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label="Cantidad"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7 rounded-full"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} c/u
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto size-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen */}
              <div className="h-fit rounded-xl border border-border bg-card p-6">
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Resumen del pedido
                </h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-muted-foreground">
                      Se calcula en el checkout
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-heading font-semibold text-foreground">
                    Total
                  </span>
                  <span className="font-heading text-lg font-bold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>

                {isAuthenticated ? (
                  <Button asChild className="mt-6 w-full rounded-full">
                    <Link href="/checkout">
                      Continuar con el pedido
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="mt-6 w-full rounded-full">
                      <Link href="/cuenta?callbackUrl=/checkout">
                        <Lock className="size-4" />
                        Iniciá sesión para continuar
                      </Link>
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Necesitás una cuenta mayorista para finalizar la compra.
                    </p>
                  </>
                )}
                <Button
                  variant="ghost"
                  asChild
                  className="mt-2 w-full text-muted-foreground"
                >
                  <Link href="/catalogo">Seguir comprando</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
