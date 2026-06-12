'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productsService } from '@/services/products.service'
import type { Product } from '@/types/product'
import { formatPrice } from '@/utils/formatters'

const PAGE_SIZE = 20

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsService.list({
        search: search.trim() || undefined,
        includeInactive: true,
        page,
        limit: PAGE_SIZE,
      })
      setProducts(res.data)
      setMeta(res.meta)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  // Al cambiar la búsqueda, volver a la página 1 (con debounce)
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Desactivar "${name}"? Podés reactivarlo editándolo.`)) return
    setBusyId(id)
    try {
      await productsService.remove(id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Productos{' '}
          <span className="text-base font-normal text-muted-foreground">
            ({meta.total})
          </span>
        </h1>
        <Button asChild className="rounded-full">
          <Link href="/admin/productos/nuevo">
            <Plus className="size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.categoria?.name ?? '—'}</td>
                  <td>{p.cliente?.name ?? '—'}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td
                    className={
                      p.stock <= 5 ? 'font-medium text-amber-600' : ''
                    }
                  >
                    {p.stock}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${p.active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={busyId === p.id}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        {busyId === p.id && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
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
