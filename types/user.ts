export type UserRole = 'customer' | 'admin'

/**
 * pending: se registró solo, esperando aprobación (puede loguear, no ve
 * precios/catálogos/PDF). approved: alta por el admin, o ya aprobado.
 * rejected: el admin lo rechazó (además queda inactivo).
 */
export type ClientStatus = 'pending' | 'approved' | 'rejected'

export type User = {
  id: string
  name: string
  businessName?: string | null
  clientNumber?: string | null
  email: string
  role: UserRole
  status?: ClientStatus
  active?: boolean
  createdAt?: string
  addresses?: UserAddress[]
}

export type UserAddress = {
  id: string
  userId: string
  label: string
  fullName?: string | null
  street: string
  number: string
  floor?: string | null
  city: string
  province: string
  postalCode: string
  phone?: string | null
  isDefault: boolean
  lat?: number | null
  lng?: number | null
  placeId?: string | null
  formattedAddress?: string | null
}

/** Respuesta de /auth/login. */
export type AuthResponse = {
  token: string
  user: User
}
