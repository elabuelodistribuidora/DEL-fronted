'use client'

import { useAuthStore } from '@/store/authStore'
import { authService, type RegisterPayload } from '@/services/auth.service'

/**
 * Hook de autenticación. Envuelve los servicios y persiste la sesión
 * en el authStore (token + user) tras login/registro.
 */
export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const setSession = useAuthStore((s) => s.setSession)
  const logout = useAuthStore((s) => s.logout)

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password)
    setSession(res.token, res.user)
    return res.user
  }

  const register = async (payload: RegisterPayload) => {
    const res = await authService.register(payload)
    setSession(res.token, res.user)
    return res.user
  }

  return {
    token,
    user,
    hydrated,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  }
}
