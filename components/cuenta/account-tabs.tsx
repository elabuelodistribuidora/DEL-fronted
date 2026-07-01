'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

/**
 * Formulario de inicio de sesión. El registro es solo por el admin
 * (no hay alta pública), por eso no hay pestaña de registro.
 */
export function AccountTabs() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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
      const callback = searchParams.get('callbackUrl')
      if (user.role === 'admin') {
        router.push(callback || '/admin')
      } else {
        // El cliente siempre va al catálogo, salvo que venga de una página
        // protegida puntual (no home ni la propia /cuenta).
        const useful =
          callback && !['/', '/cuenta', '/login'].includes(callback)
            ? callback
            : '/catalogo'
        router.push(useful)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
      setLoading(false)
    }
  }

  const sessionExpired = searchParams.get('expired') === '1'

  return (
    <div className="mx-auto w-full max-w-md">
      {sessionExpired && !error && (
        <p className="mb-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-800">
          Tu sesión expiró. Iniciá sesión de nuevo para continuar.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
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
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        ¿No tenés cuenta? Las cuentas mayoristas las habilita la distribuidora.
        Escribinos para solicitar acceso.
      </p>
    </div>
  )
}
