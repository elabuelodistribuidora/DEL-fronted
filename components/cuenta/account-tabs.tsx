'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RegisterWizard } from '@/components/cuenta/register-wizard'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function AccountTabs({
  defaultTab = 'login',
}: {
  defaultTab?: 'login' | 'register'
}) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = (role: string) => {
    const callback = searchParams.get('callbackUrl')
    if (callback) return router.push(callback)
    router.push(role === 'admin' ? '/admin' : '/cuenta/pedidos')
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const data = new FormData(e.currentTarget)
    try {
      const user = await login(
        String(data.get('email')),
        String(data.get('password')),
      )
      redirectTo(user.role)
      // No reseteamos loading: el spinner sigue hasta que se navega.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'mx-auto w-full transition-all',
        tab === 'register' ? 'max-w-xl' : 'max-w-md',
      )}
    >
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        <TabButton active={tab === 'login'} onClick={() => setTab('login')}>
          Acceder
        </TabButton>
        <TabButton
          active={tab === 'register'}
          onClick={() => setTab('register')}
        >
          Registrarse
        </TabButton>
      </div>

      {error && tab === 'login' && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {tab === 'login' && searchParams.get('reset') === 'ok' && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          ¡Listo! Tu contraseña se actualizó. Iniciá sesión con la nueva.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        {tab === 'login' ? (
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input id="login-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-pass">Contraseña</Label>
              <div className="relative">
                <Input
                  id="login-pass"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <div className="text-right">
                <Link
                  href="/recuperar"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              loading={loading}
            >
              Acceder
            </Button>
          </form>
        ) : (
          <RegisterWizard />
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
