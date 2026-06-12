'use client'

import { useSearchParams } from 'next/navigation'

/**
 * Muestra el número de orden recién creada (leído del query param).
 */
export function ConfirmationDetails() {
  const params = useSearchParams()
  const orderNumber = params.get('order')

  if (!orderNumber) return null

  return (
    <p className="mt-3 text-sm">
      <span className="text-muted-foreground">Número de pedido: </span>
      <span className="font-heading font-bold text-foreground">
        #{orderNumber}
      </span>
    </p>
  )
}
