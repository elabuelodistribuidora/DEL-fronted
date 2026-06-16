import { api } from '@/utils/api'
import type { AuthResponse, User } from '@/types/user'

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),
}
