'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No hay productos en oferta por el momento. ¡Volvé pronto!
      </p>
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
