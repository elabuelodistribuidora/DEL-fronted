'use client'

import { useCallback, useEffect, useState } from 'react'
import { productsService } from '@/services/products.service'
import type { Product, ProductFilters } from '@/types/product'

type Meta = { total: number; page: number; limit: number; totalPages: number }

/**
 * Hook para listar productos desde el backend con filtros y paginación.
 * Re-fetch automático cuando cambian los filtros.
 */
export function useProducts(initialFilters?: ProductFilters) {
  const [filters, setFilters] = useState<ProductFilters>(
    initialFilters ?? { page: 1, limit: 12 },
  )
  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await productsService.list(filters)
      setProducts(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))

  return {
    products,
    meta,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    setPage: (page: number) => setFilters((prev) => ({ ...prev, page })),
    clearFilters: () => setFilters({ page: 1, limit: filters.limit ?? 12 }),
    refetch: fetchProducts,
  }
}
