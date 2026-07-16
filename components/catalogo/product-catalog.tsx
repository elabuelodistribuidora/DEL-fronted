'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { SearchableSelect } from '@/components/ui/searchable-select'
import { cn } from '@/lib/utils'
import { useProducts } from '@/hooks/useProducts'
import { categoriasService } from '@/services/categorias.service'
import { marcasService } from '@/services/marcas.service'
import type { Categoria, Marca, ProductFilters } from '@/types/product'

export function ProductCatalog() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  const { products, meta, loading, filters, updateFilter, setPage } =
    useProducts({ page: 1, limit: 12, search: initialSearch || undefined })

  const [query, setQuery] = useState(initialSearch)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])

  // Categorías de la marca seleccionada (botones debajo de "resultados").
  const [marcaCategorias, setMarcaCategorias] = useState<Categoria[]>([])
  const [selectedMarcaCategorias, setSelectedMarcaCategorias] = useState<
    string[]
  >([])

  // Catálogos de filtros
  useEffect(() => {
    categoriasService
      .list()
      .then(setCategorias)
      .catch(() => {})
    marcasService
      .list()
      .then(setMarcas)
      .catch(() => {})
  }, [])

  // Aplica la selección de categorías-por-marca: guarda el estado local y
  // actualiza el filtro de productos en el mismo lugar (sin un efecto aparte
  // reaccionando a este estado, para no encadenar updates entre sí).
  const applyMarcaCategorias = (ids: string[]) => {
    setSelectedMarcaCategorias(ids)
    updateFilter('categoriaIds', ids.length ? ids : undefined)
  }

  // Al cambiar la marca: traer sus categorías (opciones de los botones). El
  // reseteo de la selección previa se hace en el propio onChange de marca,
  // en la misma tanda que el resto de los filtros, para no generar un
  // segundo refresh de productos aparte.
  useEffect(() => {
    const marcaSeleccionada = marcas.find((m) => m.slug === filters.marca)
    if (!marcaSeleccionada) {
      setMarcaCategorias((prev) => (prev.length ? [] : prev))
      return
    }
    categoriasService
      .byMarca(marcaSeleccionada.id)
      .then(setMarcaCategorias)
      .catch(() => setMarcaCategorias([]))
  }, [filters.marca, marcas])

  const toggleMarcaCategoria = (categoriaId: string) => {
    const next = selectedMarcaCategorias.includes(categoriaId)
      ? selectedMarcaCategorias.filter((id) => id !== categoriaId)
      : [...selectedMarcaCategorias, categoriaId]
    applyMarcaCategorias(next)
  }

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      updateFilter('search', query.trim() || undefined)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const activeCount =
    (filters.categoria ? 1 : 0) +
    (filters.marca ? 1 : 0) +
    (query ? 1 : 0) +
    (selectedMarcaCategorias.length > 0 ? 1 : 0)

  const clearAll = () => {
    setQuery('')
    updateFilter('categoria', undefined)
    updateFilter('marca', undefined)
    applyMarcaCategorias([])
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Filtros arriba de todo */}
      <div className="mb-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="h-9 pl-9"
              aria-label="Buscar productos"
            />
          </div>
          <SearchableSelect
            value={filters.categoria ?? ''}
            onChange={(v) => updateFilter('categoria', v || undefined)}
            options={categorias.map((c) => ({ label: c.name, value: c.slug }))}
            placeholder="Todas las categorías"
            clearLabel="Todas las categorías"
          />
          <SearchableSelect
            value={filters.marca ?? ''}
            onChange={(v) => {
              updateFilter('marca', v || undefined)
              // Al elegir una marca, el filtro general de categoría puede no
              // tener nada que ver: se limpia y pasa a manejarse con los
              // botones de categoría-por-marca de abajo. Los botones de la
              // marca anterior tampoco aplican más: se resetean acá mismo,
              // en la misma tanda, para no disparar un segundo refresh.
              if (v) updateFilter('categoria', undefined)
              applyMarcaCategorias([])
            }}
            options={marcas.map((m) => ({ label: m.name, value: m.slug }))}
            placeholder="Todas las marcas"
            clearLabel="Todas las marcas"
          />
          <Select
            value={filters.sort ?? 'name'}
            onValueChange={(v) =>
              updateFilter('sort', v as ProductFilters['sort'])
            }
          >
            <SelectTrigger className="h-9">
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
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {marcaCategorias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {marcaCategorias.map((c) => {
              const active = selectedMarcaCategorias.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleMarcaCategoria(c.id)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
  )
}
