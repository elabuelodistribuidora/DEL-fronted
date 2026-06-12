import { api } from '@/utils/api'
import type { User } from '@/types/user'

export type UpdateProfilePayload = {
  name?: string
  phone?: string
  cuit?: string
  businessName?: string
}

export const usersService = {
  me: () => api.get<User & { addresses?: unknown[] }>('/users/me'),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<User>('/users/me', payload),
}
