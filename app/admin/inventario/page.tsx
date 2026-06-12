'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Search, Check, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { productsService } from '@/services/products.service'
import type { Product } from '@/types/product'

const LOW_STOCK = 5

export default function AdminInventarioPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  // Stock editado por producto (id -> valor del input)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsService.list({
        search: search.trim() || undefined,
        includeInactive: true,
        limit: 200,
      })
      setProducts(res.data)
      setDraft(
        Object.fromEntries(res.data.map((p) => [p.id, String(p.stock)])),
      )
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const saveStock = async (p: Product) => {
    const value = Number(draft[p.id])
    if (Number.isNaN(value) || value === p.stock) return
    setSavingId(p.id)
    try {
      const updated = await productsService.update(p.id, { stock: value })
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, stock: updated.stock } : x)),
      )
      setSavedId(p.id)
      setTimeout(() => setSavedId(null), 1500)
    } finally {
      setSavingId(null)
    }
  }

  const visible = lowOnly
    ? products.filter((p) => p.stock <= LOW_STOCK)
    : products

  const lowCount = products.filter((p) => p.stock <= LOW_STOCK).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Inventario
        </h1>
        {lowCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            <AlertTriangle className="size-4" />
            {lowCount} con stock bajo
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="pl-9"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={lowOnly}
            onCheckedChange={(v) => setLowOnly(Boolean(v))}
          />
          <Label className="cursor-pointer font-normal">
            Solo stock bajo (≤ {LOW_STOCK})
          </Label>
        </label>
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
                <th>Producto</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Stock actual</th>
                <th>Ajustar</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {p.sku ?? '—'}
                  </td>
                  <td>{p.categoria?.name ?? '—'}</td>
                  <td>
                    <span
                      className={
                        p.stock === 0
                          ? 'font-medium text-destructive'
                          : p.stock <= LOW_STOCK
                            ? 'font-medium text-amber-600'
                            : ''
                      }
                    >
                      {p.stock} u.
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={draft[p.id] ?? ''}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [p.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveStock(p)
                        }}
                        className="h-8 w-24"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={
                          savingId === p.id ||
                          Number(draft[p.id]) === p.stock ||
                          draft[p.id] === undefined ||
                          draft[p.id] === ''
                        }
                        onClick={() => saveStock(p)}
                      >
                        {savingId === p.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : savedId === p.id ? (
                          <Check className="size-3.5 text-green-600" />
                        ) : (
                          'Guardar'
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Sin productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
