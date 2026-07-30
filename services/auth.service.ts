import { api } from '@/utils/api'
import type { AuthResponse, User } from '@/types/user'
import type { ClientAddressInput } from './users.service'

export type RegisterPayload = {
  email: string
  name: string
  businessName?: string
  password: string
  address: ClientAddressInput
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  me: () => api.get<User>('/auth/me'),

  requestPasswordReset: (email: string) =>
    api.post<{ sent: boolean; devHint?: string }>('/auth/password/request', {
      email,
    }),

  verifyPasswordReset: (email: string, code: string) =>
    api.post<{ verified: boolean }>('/auth/password/verify', { email, code }),

  resetPassword: (email: string, code: string, password: string) =>
    api.post<{ reset: boolean }>('/auth/password/reset', {
      email,
      code,
      password,
    }),
}
