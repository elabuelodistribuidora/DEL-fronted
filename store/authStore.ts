'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'
import { setTokenCookie, clearTokenCookie } from '@/lib/authToken'

type AuthStore = {
  token: string | null
  user: User | null
  /** true cuando zustand ya rehidrató desde localStorage (evita parpadeos). */
  hydrated: boolean
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,

      setSession: (token, user) => {
        setTokenCookie(token)
        set({ token, user })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearTokenCookie()
        set({ token: null, user: null })
      },

      isAuthenticated: () => Boolean(get().token),
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        // Re-sincroniza la cookie con el token persistido al cargar la app.
        if (state?.token) setTokenCookie(state.token)
        if (state) state.hydrated = true
      },
    },
  ),
)

/** Acceso al token fuera de React (lo usa utils/api). */
export function getAuthToken(): string | undefined {
  return useAuthStore.getState().token ?? undefined
}
