export type ShippingMethod = 'andreani' | 'oca' | 'pickup'

export type ShippingQuote = {
  method: ShippingMethod
  label: string
  estimatedDays: number
  cost: number
}

export type TrackingEvent = {
  date: string
  status: string
  location?: string
  description: string
}

export type Tracking = {
  orderId: string
  carrier: ShippingMethod
  trackingCode: string
  currentStatus: string
  estimatedDelivery?: string
  events: TrackingEvent[]
}
