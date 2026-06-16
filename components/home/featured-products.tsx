'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Package, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/ui/image-loader'
import { productsService } from '@/services/products.service'
import type { Product } from '@/types/product'

function CarouselCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className="flex w-52 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative flex aspect-square items-center justify-center bg-muted">
        {product.imageUrl ? (
          <ImageLoader
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="208px"
            className="object-cover"
          />
        ) : (
          <Package className="size-10 text-muted-foreground/20" />
        )}
        {product.marca && (
          <Badge className="absolute left-2.5 top-2.5 bg-background/90 text-foreground shadow-sm hover:bg-background/90 text-[11px]">
            {product.marca.name}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex-1 space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.categoria?.name ?? ''}
          </p>
          <h3 className="text-pretty text-xs font-semibold leading-snug text-foreground line-clamp-2">
            {product.name}
          </h3>
        </div>
        <div className="flex items-center justify-between gap-1 border-t border-border pt-2">
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Lock className="size-3" />
            Mayorista
          </span>
          <span className="text-[11px] font-semibold text-primary">
            Ver precio
          </span>
        </div>
      </div>
    </Link>
  )
}

// Mínimo de tarjetas por fila para que el marquee siempre llene el ancho
// (si hay pocos destacados se repiten para que no queden pegadas a la izquierda).
const MIN_PER_ROW = 8

function CarouselRow({
  items,
  reverse = false,
}: {
  items: Product[]
  reverse?: boolean
}) {
  if (items.length === 0) return null
  // Repite los ítems hasta alcanzar el mínimo, luego duplica para el loop.
  const filled: Product[] = []
  while (filled.length < MIN_PER_ROW) filled.push(...items)
  const doubled = [...filled, ...filled]
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div
        className={`flex w-max gap-4 py-2 ${reverse ? 'animate-scroll-reverse' : 'animate-scroll'}`}
      >
        {doubled.map((product, i) => (
          <CarouselCard key={`${product.id}-${i}`} product={product} />
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-scroll-reverse { animation: scroll-reverse 30s linear infinite; }
        .animate-scroll:hover, .animate-scroll-reverse:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    productsService
      .list({ featured: true, limit: 12 })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
  }, [])

  if (products.length === 0) return null

  const row1 = products.filter((_, i) => i % 2 === 0)
  const row2 = products.filter((_, i) => i % 2 !== 0)

  return (
    <section className="overflow-hidden bg-background py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Destacados
            </p>
            <h2 className="mt-2 text-balance text-2xl font-bold text-foreground sm:text-3xl">
              Productos destacados
            </h2>
          </div>
          <Button variant="ghost" asChild className="text-primary">
            <Link href="/catalogo">
              Ver todo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-8 space-y-4 px-4">
        <CarouselRow items={row1} />
        {row2.length > 0 && <CarouselRow items={row2} reverse />}
      </div>
    </section>
  )
}
