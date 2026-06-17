'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Tag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/catalogo/product-card'
import { productsService } from '@/services/products.service'
import type { Product } from '@/types/product'

export function OffersGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsService
      .list({ onSale: true, limit: 60 })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-yellow-300 text-yellow-900">
          <Tag className="size-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Todavía no hay ofertas activas
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground">
          Estamos preparando promociones y liquidaciones. Mientras tanto,
          explorá todo nuestro catálogo mayorista.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/catalogo">
            Ver catálogo <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
