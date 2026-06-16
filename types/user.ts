export type UserRole = 'customer' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
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
