'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Protege el panel admin del lado del cliente: además del middleware (que solo
 * verifica que haya sesión), acá validamos que el rol sea admin.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { hydrated, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.replace('/login?callbackUrl=/admin')
    } else if (!isAdmin) {
      router.replace('/')
    }
  }, [hydrated, isAuthenticated, isAdmin, router])

  if (!hydrated || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
