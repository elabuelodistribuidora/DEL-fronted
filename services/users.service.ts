import { api } from '@/utils/api'
import type { User } from '@/types/user'
import type { Paginated } from '@/types/product'

export type ClientAddressInput = {
  street: string
  number?: string
  floor?: string
  city: string
  province: string
  postalCode: string
  phone?: string
  lat?: number
  lng?: number
  placeId?: string
  formattedAddress?: string
}

export type CreateClientPayload = {
  email: string
  name: string
  businessName?: string
  password: string
  address: ClientAddressInput
}

export const usersService = {
  me: () => api.get<User>('/users/me'),

  updateProfile: (payload: { name?: string }) =>
    api.patch<User>('/users/me', payload),

  // ── Admin: gestión de clientes ──
  list: (page = 1, limit = 20, search?: string) =>
    api.get<Paginated<User>>(
      `/users?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    ),

  getOne: (id: string) => api.get<User>(`/users/${id}`),

  createClient: (payload: CreateClientPayload) =>
    api.post<User>('/users', payload),

  updateClient: (
    id: string,
    payload: {
      name?: string
      businessName?: string
      active?: boolean
      address?: ClientAddressInput
    },
  ) => api.patch<User>(`/users/${id}`, payload),

  resetPassword: (id: string, password: string) =>
    api.patch<{ reset: boolean }>(`/users/${id}/password`, { password }),

  setActive: (id: string, active: boolean) =>
    api.patch<User>(`/users/${id}/active`, { active }),
}
