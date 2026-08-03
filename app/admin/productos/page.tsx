'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLoader } from '@/components/ui/image-loader'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  productsService,
  type ImportResult,
} from '@/services/products.service'
import { categoriasService } from '@/services/categorias.service'
import { marcasService } from '@/services/marcas.service'
import type { Categoria, Marca, Product } from '@/types/product'
import { formatPrice } from '@/utils/formatters'

const PAGE_SIZE = 20

// Recuerda la última búsqueda en esta pestaña: cubre no solo "atrás" del
// navegador (ya resuelto con la URL) sino también volver por un link común
// sin query string, como "Cancelar"/guardar desde editar un producto.
const FILTERS_STORAGE_KEY = 'admin-productos:filtros'

type StoredProductFilters = {
  search?: string
  categoria?: string
  marca?: string
  page?: number
}

function readStoredFilters(): StoredProductFilters | null {
  try {
    const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function AdminProductosPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  // Se leen los filtros de la URL al montar, para que al volver con el botón
  // "atrás" del navegador (ej. desde editar un producto) no se reinicien.
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [filterCategoria, setFilterCategoria] = useState(
    searchParams.get('categoria') ?? '',
  )
  const [filterMarca, setFilterMarca] = useState(
    searchParams.get('marca') ?? '',
  )
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [busyId, setBusyId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsService.list({
        search: search.trim() || undefined,
        categoria: filterCategoria || undefined,
        marca: filterMarca || undefined,
        includeInactive: true,
        includeHidden: true,
        page,
        limit: PAGE_SIZE,
      })
      setProducts(res.data)
      setMeta(res.meta)
    } finally {
      setLoading(false)
    }
  }, [search, filterCategoria, filterMarca, page])

  // Catálogos para los filtros
  useEffect(() => {
    categoriasService.list(true).then(setCategorias).catch(() => {})
    marcasService.list(true).then(setMarcas).catch(() => {})
  }, [])

  // Volver a página 1 al cambiar búsqueda o filtros (no en el montaje inicial,
  // para no pisar la página que traía la URL al volver de "Editar", ni la
  // que se restaura desde sessionStorage un poco más abajo).
  const didMount = useRef(false)
  const skipNextPageReset = useRef(false)
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    if (skipNextPageReset.current) {
      skipNextPageReset.current = false
      return
    }
    const t = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(t)
  }, [search, filterCategoria, filterMarca])

  useEffect(() => {
    load()
  }, [load])

  // Si se entra a /admin/productos sin filtros en la URL (ej. al guardar o
  // cancelar en "Editar", que vuelven a /admin/productos a secas), se
  // restaura la última búsqueda guardada en esta pestaña. Corre una sola vez
  // al montar; si la URL ya trae filtros (ej. "atrás" del navegador), esos
  // mandan.
  useEffect(() => {
    if (searchParams.toString()) return
    const stored = readStoredFilters()
    if (!stored) return
    skipNextPageReset.current = true
    if (stored.search) setSearch(stored.search)
    if (stored.categoria) setFilterCategoria(stored.categoria)
    if (stored.marca) setFilterMarca(stored.marca)
    if (stored.page && stored.page > 1) setPage(stored.page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refleja los filtros activos en la URL para que "volver atrás" desde
  // editar un producto restaure la misma búsqueda en vez de reiniciarla, y
  // los guarda en sessionStorage para cubrir también los links comunes (sin
  // query string) que vuelven a /admin/productos.
  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (filterCategoria) params.set('categoria', filterCategoria)
    if (filterMarca) params.set('marca', filterMarca)
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    try {
      sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({
          search: search.trim() || undefined,
          categoria: filterCategoria || undefined,
          marca: filterMarca || undefined,
          page,
        } satisfies StoredProductFilters),
      )
    } catch {
      // sessionStorage puede no estar disponible (modo privado, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterCategoria, filterMarca, page])

  const handleToggleHidden = async (p: Product) => {
    setBusyId(p.id)
    try {
      await productsService.update(p.id, { hidden: !p.hidden })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `¿Eliminar "${name}" de forma permanente? Esta acción no se puede deshacer.`,
      )
    )
      return
    setBusyId(id)
    try {
      await productsService.hardDelete(id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const handleImport = async (file?: File) => {
    if (!file) return
    setImporting(true)
    setImportError(null)
    setImportResult(null)
    try {
      const res = await productsService.importExcel(file)
      setImportResult(res)
      await load()
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Error al importar')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Productos{' '}
          <span className="text-base font-normal text-muted-foreground">
            ({meta.total})
          </span>
        </h1>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            className="rounded-full"
            loading={importing}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" />
            Importar Excel
          </Button>
        </div>
      </div>

      {importError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {importError}
        </p>
      )}
      {importResult &&
        (importResult.applied ? (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            ✅ Importación aplicada: <strong>{importResult.created}</strong>{' '}
            creados, <strong>{importResult.deleted}</strong> eliminados
            {importResult.skipped > 0 &&
              `, ${importResult.skipped} filas vacías omitidas`}
            {importResult.marcasCreadas.length > 0 &&
              `, ${importResult.marcasCreadas.length} marcas nuevas`}
            {importResult.categoriasCreadas.length > 0 &&
              `, ${importResult.categoriasCreadas.length} categorías nuevas`}
            .
          </div>
        ) : (
          <div className="space-y-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">
              ⚠️ No se importó nada. Hay {importResult.errorCount} fila(s) con
              errores. Corregí el Excel y volvé a subirlo.
            </p>
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md bg-background/60 p-3 text-xs">
              {importResult.errors.map((e, i) => (
                <li key={i}>
                  Fila {e.row}
                  {e.code ? ` (cód. ${e.code})` : ''}: {e.message}
                </li>
              ))}
              {importResult.errorCount > importResult.errors.length && (
                <li className="opacity-70">
                  …y {importResult.errorCount - importResult.errors.length} más.
                </li>
              )}
            </ul>
          </div>
        ))}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-9"
          />
        </div>
        <SearchableSelect
          value={filterCategoria}
          onChange={setFilterCategoria}
          options={categorias.map((c) => ({ value: c.slug, label: c.name }))}
          placeholder="Todas las categorías"
          clearLabel="Todas las categorías"
        />
        <SearchableSelect
          value={filterMarca}
          onChange={setFilterMarca}
          options={marcas.map((m) => ({ value: m.slug, label: m.name }))}
          placeholder="Todas las marcas"
          clearLabel="Todas las marcas"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Visibilidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {p.imageUrl ? (
                        <ImageLoader
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="size-5 text-muted-foreground/30" />
                      )}
                    </div>
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {p.sku ?? '—'}
                  </td>
                  <td className="font-medium">
                    {p.name}
                    {p.hidden && (
                      <EyeOff className="ml-1 inline size-3 text-muted-foreground" />
                    )}
                  </td>
                  <td>{p.categoria?.name ?? '—'}</td>
                  <td>{p.marca?.name ?? '—'}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <span
                      className={`status-badge ${p.inStock ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {p.inStock ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${!p.hidden ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {p.hidden ? 'Oculto' : 'Visible'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleHidden(p)}
                        disabled={busyId === p.id}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline disabled:opacity-50"
                      >
                        {p.hidden ? (
                          <Eye className="size-3" />
                        ) : (
                          <EyeOff className="size-3" />
                        )}
                        {p.hidden ? 'Mostrar' : 'Ocultar'}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={busyId === p.id}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        {busyId === p.id && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No hay productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
