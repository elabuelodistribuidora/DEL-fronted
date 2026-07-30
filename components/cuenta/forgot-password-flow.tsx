'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, KeyRound, Mail, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordFields } from '@/components/cuenta/password-fields'
import { authService } from '@/services/auth.service'
import { isPasswordValid } from '@/utils/password'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Email' },
  { step: 2, label: 'Código' },
  { step: 3, label: 'Nueva clave' },
  { step: 4, label: 'Listo' },
]

/**
 * Recuperar contraseña en una sola página: 4 pasos con transición y barra
 * de progreso (email → código por mail vía SES → nueva contraseña → listo).
 */
export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devHint, setDevHint] = useState<string | null>(null)

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authService.requestPasswordReset(email)
      setDevHint(res.devHint ?? null)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código')
    } finally {
      setLoading(false)
    }
  }

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authService.verifyPasswordReset(email, code)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido o vencido')
    } finally {
      setLoading(false)
    }
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple los requisitos')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(email, code, password)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex gap-2">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-500',
                s.step <= step ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {STEPS.map((s) => (
            <span
              key={s.step}
              className={cn(
                'text-xs font-medium transition-colors duration-500',
                s.step <= step ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div
        key={step}
        className="animate-in fade-in slide-in-from-right-4 rounded-2xl border border-border bg-card p-6 duration-300 sm:p-8"
      >
        {step === 1 && (
          <form onSubmit={submitEmail} className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="size-6 text-primary" />
              </div>
              <h1 className="mt-3 font-heading text-lg font-bold text-foreground">
                Recuperar contraseña
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Te mandamos un código de 6 dígitos a tu email.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-email">Correo electrónico</Label>
              <Input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              loading={loading}
            >
              Enviar código
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitCode} className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="size-6 text-primary" />
              </div>
              <h1 className="mt-3 font-heading text-lg font-bold text-foreground">
                Ingresá el código
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Lo enviamos a <strong className="text-foreground">{email}</strong>.
                Vence en 10 minutos.
              </p>
              {devHint && (
                <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-800">
                  {devHint}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-code">Código de 6 dígitos</Label>
              <Input
                id="fp-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-[0.5em]"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              loading={loading}
              disabled={code.length !== 6}
            >
              Verificar código
            </Button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-muted-foreground hover:underline"
            >
              Usar otro email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={submitPassword} className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="size-6 text-primary" />
              </div>
              <h1 className="mt-3 font-heading text-lg font-bold text-foreground">
                Elegí tu nueva contraseña
              </h1>
            </div>
            <PasswordFields
              password={password}
              setPassword={setPassword}
              confirm={confirm}
              setConfirm={setConfirm}
              label="Nueva contraseña"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              loading={loading}
            >
              Confirmar
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-foreground">
                ¡Listo!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu contraseña se actualizó correctamente.
              </p>
            </div>
            <Button asChild size="lg" className="w-full rounded-full">
              <Link href="/cuenta">Iniciar sesión</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
