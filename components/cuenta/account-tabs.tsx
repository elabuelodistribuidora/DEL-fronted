'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const { login, register } = useAuth()
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const data = new FormData(e.currentTarget)
    try {
      const user = await register({
        name: String(data.get('name')),
        email: String(data.get('email')),
        password: String(data.get('password')),
        businessName: (data.get('businessName') as string) || undefined,
        cuit: (data.get('cuit') as string) || undefined,
      })
      redirectTo(user.role)
      // No reseteamos loading: el spinner sigue hasta que se navega.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
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

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
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
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="reg-name">Nombre</Label>
              <Input id="reg-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-business">Nombre del comercio</Label>
              <Input id="reg-business" name="businessName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-cuit">CUIT / CUIL</Label>
              <Input id="reg-cuit" name="cuit" placeholder="20123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Correo electrónico</Label>
              <Input id="reg-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-pass">Contraseña</Label>
              <Input
                id="reg-pass"
                name="password"
                type="password"
                required
                placeholder="Mínimo 8 caracteres, una letra y un número"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              loading={loading}
            >
              Crear cuenta mayorista
            </Button>
          </form>
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
