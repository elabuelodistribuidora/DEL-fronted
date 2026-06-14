import { api } from '@/utils/api'
import type { AuthResponse, User } from '@/types/user'
import type { AddressValue } from '@/components/ui/address-autocomplete'

export type RegisterPayload = {
  name: string
  email: string
  password: string
  businessName: string
  cuit: string
  phone?: string
  taxCondition?: string
  businessType?: string
  address: AddressValue
}

export const authService = {
  /** Paso 1: pide el código de verificación al email. */
  requestCode: (email: string) =>
    api.post<{ sent: boolean; devCode?: string }>('/auth/verify/request', {
      email,
    }),

  /** Paso 2: confirma el código recibido. */
  confirmCode: (email: string, code: string) =>
    api.post<{ verified: boolean }>('/auth/verify/confirm', { email, code }),

  /** Paso 3: registra la cuenta (requiere email verificado). */
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),

  // ── Recuperar contraseña ──
  requestReset: (email: string) =>
    api.post<{ sent: boolean; devCode?: string }>('/auth/password/request', {
      email,
    }),

  verifyReset: (email: string, code: string) =>
    api.post<{ valid: boolean }>('/auth/password/verify', { email, code }),

  resetPassword: (email: string, code: string, password: string) =>
    api.post<{ reset: boolean }>('/auth/password/reset', {
      email,
      code,
      password,
    }),
}
