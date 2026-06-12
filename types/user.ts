export type UserRole = 'customer' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string | null
  cuit?: string | null
  businessName?: string | null
  active?: boolean
  createdAt?: string
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
}

/** Respuesta de /auth/login y /auth/register. */
export type AuthResponse = {
  token: string
  user: User
}
