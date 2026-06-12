'use client'

import { useState, useCallback } from 'react'
import { api } from '@/utils/api'
import type { Order } from '@/types/order'

/**
 * Hook para obtener y gestionar órdenes del usuario actual.
 * Requiere el backend activo para funcionar.
 */
export function useOrders(token?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Order[]>('/orders', { token })
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchOrder = useCallback(
    async (id: string) => {
      if (!token) return null
      try {
        return await api.get<Order>(`/orders/${id}`, { token })
      } catch {
        return null
      }
    },
    [token],
  )

  return { orders, loading, error, fetchOrders, fetchOrder }
}
