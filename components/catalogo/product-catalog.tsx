'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductCard } from '@/components/catalogo/product-card'
import { useProducts } from '@/hooks/useProducts'
import { categoriasService } from '@/services/categorias.service'
import { clientesService } from '@/services/clientes.service'
import type { Categoria, Cliente, ProductFilters } from '@/types/product'
import { cn } from '@/lib/utils'

export function ProductCatalog() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  const { products, meta, loading, filters, updateFilter, setPage } =
    useProducts({ page: 1, limit: 12, search: initialSearch || undefined })

  const [query, setQuery] = useState(initialSearch)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Catálogos de filtros
  useEffect(() => {
    categoriasService.list().then(setCategorias).catch(() => {})
    clientesService.list().then(setClientes).catch(() => {})
  }, [])

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      updateFilter('search', query.trim() || undefined)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const selectOne = (key: 'categoria' | 'cliente', slug: string) => {
    updateFilter(key, filters[key] === slug ? undefined : slug)
  }

  const activeCount =
    (filters.categoria ? 1 : 0) + (filters.cliente ? 1 : 0)

  const clearAll = () => {
    setQuery('')
    updateFilter('categoria', undefined)
    updateFilter('cliente', undefined)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className={cn('lg:block', showFilters ? 'block' : 'hidden')}>
          <div className="space-y-6 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold">Filtros</h2>
              {activeCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <FilterGroup
              title="Categorías"
              options={categorias.map((c) => ({ label: c.name, value: c.slug }))}
              selected={filters.categoria}
              onSelect={(v) => selectOne('categoria', v)}
            />
            <FilterGroup
              title="Proveedores"
              options={clientes.map((c) => ({ label: c.name, value: c.slug }))}
              selected={filters.cliente}
              onSelect={(v) => selectOne('cliente', v)}
            />
          </div>
        </aside>

        {/* Products */}
        <div>
          <div className="mb-6 flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="h-11 pl-9"
                aria-label="Buscar productos"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  'Cargando…'
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {meta.total}
                    </span>{' '}
                    resultado{meta.total === 1 ? '' : 's'}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters((s) => !s)}
                >
                  <SlidersHorizontal className="size-4" />
                  Filtros
                  {activeCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                      {activeCount}
                    </span>
                  )}
                </Button>
                <Select
                  value={filters.sort ?? 'recent'}
                  onValueChange={(v) =>
                    updateFilter('sort', v as ProductFilters['sort'])
                  }
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="name">Nombre: A-Z</SelectItem>
                    <SelectItem value="price_asc">Precio: menor</SelectItem>
                    <SelectItem value="price_desc">Precio: mayor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => setPage(meta.page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground">
                    Página {meta.page} de {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage(meta.page + 1)}
                  >
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <p className="font-heading text-lg font-semibold">Sin resultados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Probá con otros filtros o términos de búsqueda.
              </p>
              <Button onClick={clearAll} variant="outline" className="mt-4">
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string
  options: { label: string; value: string }[]
  selected?: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              'block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
              selected === option.value
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
