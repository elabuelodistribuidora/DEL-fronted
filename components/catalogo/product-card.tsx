'use client'

import Link from 'next/link'
import { Package, Lock, ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/ui/image-loader'
import type { Product } from '@/types/product'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/formatters'

export function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.image,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        price: product.price,
      },
      1,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <Link
        href={`/catalogo/${product.slug}`}
        className="relative flex aspect-square items-center justify-center bg-muted"
      >
        {product.imageUrl ? (
          <ImageLoader
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <Package className="size-14 text-muted-foreground/30" />
        )}
        {product.marca && (
          <Badge className="absolute left-3 top-3 bg-background/90 text-foreground shadow-sm hover:bg-background/90">
            {product.marca.name}
          </Badge>
        )}
        {!product.inStock && (
          <Badge className="absolute right-3 top-3 bg-destructive/90 text-white hover:bg-destructive/90">
            Sin stock
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/catalogo/${product.slug}`} className="flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.categoria?.name ?? ''}
          </p>
          <h3 className="text-pretty font-heading text-sm font-semibold leading-snug text-foreground">
            {product.name}
          </h3>
          {product.sku && (
            <p className="text-xs text-muted-foreground">Cód. {product.sku}</p>
          )}
        </Link>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          {isAuthenticated ? (
            <>
              <span className="font-heading text-sm font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              <Button
                size="sm"
                className="rounded-full text-xs"
                onClick={handleAdd}
                disabled={!product.inStock}
              >
                {added ? (
                  <Check className="size-3.5" />
                ) : (
                  <ShoppingCart className="size-3.5" />
                )}
                {!product.inStock ? 'Sin stock' : added ? 'Agregado' : 'Agregar'}
              </Button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                Precio mayorista
              </span>
              <Button asChild size="sm" className="rounded-full text-xs">
                <Link href="/cuenta">Ver precio</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
