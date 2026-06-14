'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ShieldCheck, KeyRound, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordFields } from '@/components/cuenta/password-fields'
import { authService } from '@/services/auth.service'
import { isPasswordValid } from '@/utils/password'

const STEPS = [
  { n: 1, label: 'Email', icon: Mail },
  { n: 2, label: 'Código', icon: ShieldCheck },
  { n: 3, label: 'Nueva clave', icon: KeyRound },
]

export function ResetWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const requestCode = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await authService.requestReset(email.trim())
      setDevCode(res.devCode ?? null)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    setError(null)
    setLoading(true)
    try {
      await authService.verifyReset(email.trim(), code.trim())
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    setError(null)
    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple los requisitos mínimos')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(email.trim(), code.trim(), password)
      router.push('/login?reset=ok')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-between">
        {STEPS.map((s, i) => {
          const active = step === s.n
          const done = step > s.n
          return (
            <li key={s.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-9 items-center justify-center rounded-full border transition-colors ${
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : active
                        ? 'border-primary text-primary'
                        : 'border-border text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="size-4" /> : <s.icon className="size-4" />}
                </div>
                <span
                  className={`text-[11px] font-medium ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-px flex-1 ${step > s.n ? 'bg-primary' : 'bg-border'}`} />
              )}
            </li>
          )
        })}
      </ol>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {devCode && step === 2 && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Modo dev (sin email configurado): tu código es{' '}
          <span className="font-mono font-bold">{devCode}</span>
        </p>
      )}

      <div key={step} className="wizard-step space-y-5">
        {step === 1 && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              requestCode()
            }}
          >
            <p className="text-sm text-muted-foreground">
              Ingresá el correo de tu cuenta y te enviaremos un código para
              restablecer la contraseña.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo electrónico</Label>
              <Input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compras@tucomercio.com"
              />
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full" loading={loading}>
              Enviar código
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              verifyCode()
            }}
          >
            <p className="text-sm text-muted-foreground">
              Ingresá el código de 6 dígitos que enviamos a{' '}
              <strong className="text-foreground">{email}</strong>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-code">Código</Label>
              <Input
                id="reset-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-center text-lg tracking-[0.5em]"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              loading={loading}
              disabled={code.length !== 6}
            >
              Verificar
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setCode('')
                }}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Cambiar email
              </button>
              <button type="button" onClick={requestCode} className="text-primary hover:underline">
                Reenviar código
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <p className="flex items-center gap-2 text-sm text-green-600">
              <Check className="size-4" /> Código verificado. Definí tu nueva contraseña.
            </p>
            <PasswordFields
              password={password}
              setPassword={setPassword}
              confirm={confirm}
              setConfirm={setConfirm}
              label="Nueva contraseña"
            />
            <Button type="submit" size="lg" className="w-full rounded-full" loading={loading}>
              Cambiar contraseña
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>

      <style>{`
        @keyframes wizardStepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .wizard-step { animation: wizardStepIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
