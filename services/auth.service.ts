import { api } from '@/utils/api'
import type { AuthResponse, User } from '@/types/user'

export type RegisterPayload = {
  name: string
  email: string
  password: string
  phone?: string
  cuit?: string
  businessName?: string
}

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),
}
