import { api } from '@/utils/api'
import type { ShippingMethod } from '@/types/shipping'

export type ShippingQuoteResult = {
  method: ShippingMethod
  label: string
  estimatedDays: number
  cost: number
  estimated?: boolean
}

export const shippingService = {
  quote: (postalCode: string, weight = 1) =>
    api.post<ShippingQuoteResult[]>('/shipping/quote', { postalCode, weight }),
}
