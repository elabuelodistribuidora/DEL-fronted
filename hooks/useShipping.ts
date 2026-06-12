'use client'

import { useState } from 'react'
import { api } from '@/utils/api'
import type { ShippingQuote } from '@/types/shipping'

/**
 * Hook para cotizar envíos en el checkout.
 * Llama al backend que a su vez consulta la API de Andreani/OCA.
 */
export function useShipping() {
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ShippingQuote | null>(null)

  const getQuotes = async (postalCode: string, weightKg: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post<ShippingQuote[]>('/shipping/quote', {
        postalCode,
        weightKg,
      })
      setQuotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cotizar envío')
      // Fallback: costo fijo si la API no responde
      setQuotes([
        {
          method: 'andreani',
          label: 'Andreani',
          estimatedDays: 3,
          cost: 3500,
        },
        {
          method: 'pickup',
          label: 'Retiro en local',
          estimatedDays: 0,
          cost: 0,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return { quotes, loading, error, selected, setSelected, getQuotes }
}
