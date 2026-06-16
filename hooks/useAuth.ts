'use client'

import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'

/**
 * Hook de autenticación. Envuelve el login y persiste la sesión
 * (token + user) en el authStore.
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

  return {
    token,
    user,
    hydrated,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'admin',
    login,
    logout,
  }
}
