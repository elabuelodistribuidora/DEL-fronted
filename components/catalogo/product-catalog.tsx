'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

// Recuerda la última búsqueda en esta pestaña: cubre no solo "atrás" del
// navegador (ya resuelto con la URL) sino también volver por un link común
// sin query string, como "Seguir comprando" desde el carrito.
const FILTERS_STORAGE_KEY = 'catalogo:filtros'

type StoredCatalogFilters = {
  search?: string
  categoria?: string
  marca?: string
  sort?: ProductFilters['sort']
  categoriaIds?: string[]
  page?: number
}

function readStoredFilters(): StoredCatalogFilters | null {
  try {
    const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function ProductCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''
  const initialCategoriaIds =
    searchParams.get('categoriaIds')?.split(',').filter(Boolean) ?? []

  // Se leen los filtros de la URL al montar, para que al volver con el botón
  // "atrás" del navegador se restaure la misma búsqueda (no se resetea).
  const { products, meta, loading, filters, setFilters, updateFilter, setPage } =
    useProducts({
      page: Number(searchParams.get('page')) || 1,
      limit: 12,
      search: initialSearch || undefined,
      categoria: searchParams.get('categoria') ?? undefined,
      marca: searchParams.get('marca') ?? undefined,
      sort: (searchParams.get('sort') as ProductFilters['sort']) ?? undefined,
      categoriaIds: initialCategoriaIds.length
        ? initialCategoriaIds
        : undefined,
    })

  const [query, setQuery] = useState(initialSearch)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])

  // Categorías de la marca seleccionada (botones debajo de "resultados").
  const [marcaCategorias, setMarcaCategorias] = useState<Categoria[]>([])
  const [selectedMarcaCategorias, setSelectedMarcaCategorias] = useState<
    string[]
  >(initialCategoriaIds)

  // Si se entra a /catalogo sin filtros en la URL (ej. el botón "Seguir
  // comprando" del carrito, que linkea a /catalogo a secas), se restaura la
  // última búsqueda guardada en esta pestaña. Corre una sola vez al montar;
  // si la URL ya trae filtros (ej. "atrás" del navegador), esos mandan.
  useEffect(() => {
    if (searchParams.toString()) return
    const stored = readStoredFilters()
    if (!stored) return
    if (stored.search) setQuery(stored.search)
    if (stored.categoriaIds?.length)
      setSelectedMarcaCategorias(stored.categoriaIds)
    setFilters((prev) => ({
      ...prev,
      search: stored.search || undefined,
      categoria: stored.categoria,
      marca: stored.marca,
      sort: stored.sort,
      categoriaIds: stored.categoriaIds?.length ? stored.categoriaIds : undefined,
      page: stored.page && stored.page > 1 ? stored.page : 1,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refleja los filtros activos en la URL para que "volver atrás" desde el
  // detalle de un producto restaure la misma búsqueda en vez de reiniciarla,
  // y los guarda en sessionStorage para cubrir también los links comunes
  // (sin query string) que vuelven a /catalogo.
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (filters.categoria) params.set('categoria', filters.categoria)
    if (filters.marca) params.set('marca', filters.marca)
    if (filters.sort) params.set('sort', filters.sort)
    if (selectedMarcaCategorias.length)
      params.set('categoriaIds', selectedMarcaCategorias.join(','))
    if (filters.page && filters.page > 1)
      params.set('page', String(filters.page))
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    try {
      sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({
          search: query.trim() || undefined,
          categoria: filters.categoria,
          marca: filters.marca,
          sort: filters.sort,
          categoriaIds: selectedMarcaCategorias.length
            ? selectedMarcaCategorias
            : undefined,
          page: filters.page,
        } satisfies StoredCatalogFilters),
      )
    } catch {
      // sessionStorage puede no estar disponible (modo privado, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query,
    filters.categoria,
    filters.marca,
    filters.sort,
    filters.page,
    selectedMarcaCategorias,
  ])

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
    try {
      sessionStorage.removeItem(FILTERS_STORAGE_KEY)
    } catch {
      // sessionStorage puede no estar disponible (modo privado, etc.)
    }
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
