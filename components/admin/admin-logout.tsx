'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function AdminLogout() {
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <button
      onClick={() => {
        logout()
        router.push('/login')
      }}
      className="admin-sidebar__link w-full text-destructive hover:text-destructive"
    >
      <LogOut className="size-4" />
      Salir
    </button>
  )
}
