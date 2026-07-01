'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Lock,
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/ui/image-loader'
import { productsService } from '@/services/products.service'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/formatters'
import type { Product } from '@/types/product'
import { ProductCard } from './product-card'

export function ProductDetail({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [related, setRelated] = useState<Product[]>([])
  // Modelo elegido (0 = por defecto). Se resetea al cambiar de producto.
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    setLoading(true)
    setSelected(0)
    productsService
      .getOne(slug)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    productsService
      .getRelated(slug)
      .then(setRelated)
      .catch(() => setRelated([]))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="py-32 text-center">
        <p className="font-heading text-lg font-semibold">
          Producto no encontrado
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/catalogo">Volver al catálogo</Link>
        </Button>
      </div>
    )
  }

  const onSale = Boolean(product.onSale && product.salePrice != null)
  const effectivePrice = onSale ? (product.salePrice as number) : product.price
  const exclusive = Boolean(product.exclusive)

  // Lista de modelos: el modelo por defecto (imagen + nombre del producto) +
  // las variantes cargadas. Vacía si el producto no tiene modelos.
  const hasModels =
    Boolean(product.hasVariants) && (product.variants?.length ?? 0) > 0
  const models = hasModels
    ? [
        {
          name: '',
          label: 'Original',
          image: product.image ?? null,
          imageUrl: product.imageUrl ?? null,
        },
        ...(product.variants ?? []).map((v) => ({
          name: v.name,
          label: v.name,
          image: v.image ?? null,
          imageUrl: v.imageUrl ?? null,
        })),
      ]
    : []
  const activeModel = models[selected]
  const mainImageUrl = activeModel?.imageUrl ?? product.imageUrl

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.image,
        imageUrl: mainImageUrl,
        inStock: product.inStock,
        price: effectivePrice,
        variantName: activeModel?.name || undefined,
        variantImage: activeModel?.image ?? undefined,
      },
      qty,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Imagen + selector de modelos */}
        <div className="space-y-3">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
            {mainImageUrl ? (
              <ImageLoader
                key={mainImageUrl}
                src={mainImageUrl}
                alt={activeModel?.name || product.name}
                fill
                sizes="(min-width: 1024px) 360px, 90vw"
                className="object-cover"
              />
            ) : (
              <Package className="size-24 text-muted-foreground/30" />
            )}
          </div>

          {models.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {models.map((m, i) => (
                <button
                  key={`${m.name}-${i}`}
                  type="button"
                  onClick={() => setSelected(i)}
                  title={m.label}
                  className={`relative size-16 overflow-hidden rounded-lg border-2 transition ${
                    selected === i
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {m.imageUrl ? (
                    <ImageLoader
                      src={m.imageUrl}
                      alt={m.label}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center">
                      <Package className="size-6 text-muted-foreground/30" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {exclusive && (
                <Badge className="bg-primary font-bold text-primary-foreground hover:bg-primary">
                  EXCLUSIVO
                </Badge>
              )}
              {onSale && (
                <Badge className="bg-yellow-400 font-bold text-yellow-950 hover:bg-yellow-400">
                  OFERTA
                </Badge>
              )}
              {product.categoria && (
                <Badge variant="secondary">{product.categoria.name}</Badge>
              )}
              {product.marca && (
                <Badge variant="outline">{product.marca.name}</Badge>
              )}
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {product.name}
            </h1>
            {product.sku && (
              <p className="mt-1 text-sm text-muted-foreground">
                Código: {product.sku}
              </p>
            )}
            {models.length > 0 && activeModel && (
              <p className="mt-1 text-sm font-medium text-primary">
                Modelo: {activeModel.label}
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            {isAuthenticated ? (
              <>
                {onSale ? (
                  <div>
                    <p className="text-base text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </p>
                    <p className="font-heading text-3xl font-bold text-primary">
                      {formatPrice(effectivePrice)}
                    </p>
                  </div>
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.inStock ? 'Disponible' : 'Sin stock'}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                      onClick={() => setQty((q) => q + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    className="flex-1 rounded-full"
                    onClick={handleAdd}
                    disabled={!product.inStock}
                  >
                    {added ? (
                      <Check className="size-4" />
                    ) : (
                      <ShoppingCart className="size-4" />
                    )}
                    {added ? 'Agregado' : 'Agregar al carrito'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="size-4" />
                  <span>Precio mayorista visible para cuentas registradas</span>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full rounded-full">
                    <Link href="/cuenta">Ver precio — Iniciar sesión</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
