'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Mail, ShieldCheck, Store, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AddressAutocomplete,
  emptyAddress,
  type AddressValue,
} from '@/components/ui/address-autocomplete'
import { PasswordFields } from '@/components/cuenta/password-fields'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { isPasswordValid } from '@/utils/password'

const TAX_CONDITIONS = [
  'Responsable Inscripto',
  'Monotributo',
  'Exento',
  'Consumidor Final',
]
const BUSINESS_TYPES = [
  'Librería',
  'Kiosco',
  'Papelera',
  'Juguetería',
  'Regalería',
  'Bazar',
  'Mayorista',
  'Otro',
]

const STEPS = [
  { n: 1, label: 'Email', icon: Mail },
  { n: 2, label: 'Verificación', icon: ShieldCheck },
  { n: 3, label: 'Datos del negocio', icon: Store },
]

export function RegisterWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1-2
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)

  // Paso 3
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<string | undefined>()
  const [businessName, setBusinessName] = useState('')
  const [cuit, setCuit] = useState('')
  const [taxCondition, setTaxCondition] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address, setAddress] = useState<AddressValue>(emptyAddress)

  const redirectAfter = (role: string) => {
    const cb = searchParams.get('callbackUrl')
    if (cb) return router.push(cb)
    router.push(role === 'admin' ? '/admin' : '/cuenta/pedidos')
  }

  // ── Paso 1: pedir código ──
  const requestCode = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await authService.requestCode(email.trim())
      setDevCode(res.devCode ?? null)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código')
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: confirmar código ──
  const confirmCode = async () => {
    setError(null)
    setLoading(true)
    try {
      await authService.confirmCode(email.trim(), code.trim())
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 3: registrar ──
  const submit = async () => {
    setError(null)
    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple los requisitos mínimos')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (
      !address.street.trim() ||
      !address.city.trim() ||
      !address.province.trim() ||
      !address.postalCode.trim()
    ) {
      setError('Completá la dirección del negocio (calle, ciudad, provincia y CP)')
      return
    }
    setLoading(true)
    try {
      const user = await register({
        name,
        email: email.trim(),
        password,
        businessName,
        cuit,
        phone,
        taxCondition: taxCondition || undefined,
        businessType: businessType || undefined,
        address,
      })
      redirectAfter(user.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
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
                <div
                  className={`mx-2 h-px flex-1 ${step > s.n ? 'bg-primary' : 'bg-border'}`}
                />
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

      {/* Contenido del paso (con transición) */}
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
              Cuenta exclusiva para comercios y mayoristas. Empecemos por tu
              correo: te enviaremos un código para verificarlo.
            </p>
            <div className="space-y-2">
              <Label htmlFor="wiz-email">Correo electrónico</Label>
              <Input
                id="wiz-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compras@tucomercio.com"
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
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              confirmCode()
            }}
          >
            <p className="text-sm text-muted-foreground">
              Ingresá el código de 6 dígitos que enviamos a{' '}
              <strong className="text-foreground">{email}</strong>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="wiz-code">Código de verificación</Label>
              <Input
                id="wiz-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
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
              <button
                type="button"
                onClick={requestCode}
                className="text-primary hover:underline"
              >
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
              <Check className="size-4" /> {email} verificado
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wiz-name">Nombre y apellido</Label>
                <Input
                  id="wiz-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <PhoneInput
                  international
                  defaultCountry="AR"
                  value={phone}
                  onChange={setPhone}
                  className="phone-input"
                  placeholder="341 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wiz-business">Razón social / Nombre del comercio</Label>
              <Input
                id="wiz-business"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wiz-cuit">CUIT</Label>
                <Input
                  id="wiz-cuit"
                  required
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  placeholder="20-12345678-9"
                />
              </div>
              <div className="space-y-2">
                <Label>Condición frente al IVA</Label>
                <Select value={taxCondition} onValueChange={setTaxCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_CONDITIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rubro del comercio</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PasswordFields
              password={password}
              setPassword={setPassword}
              confirm={confirmPassword}
              setConfirm={setConfirmPassword}
            />

            <div className="space-y-3 rounded-xl border border-border p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Dirección del negocio (a dónde enviamos los pedidos)
              </h3>
              <AddressAutocomplete value={address} onChange={setAddress} />
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

      <style>{`
        @keyframes wizardStepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .wizard-step { animation: wizardStepIn 0.3s ease-out; }
        /* Teléfono con banderas — ajustes para integrarlo al diseño */
        .phone-input { display: flex; gap: 0.5rem; }
        .phone-input .PhoneInputInput {
          height: 2.25rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border, #e5e7eb);
          background: transparent;
          padding: 0 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .phone-input .PhoneInputInput:focus {
          border-color: var(--ring, #2563eb);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring, #2563eb) 30%, transparent);
        }
        .phone-input .PhoneInputCountrySelect { border-radius: 0.5rem; }
      `}</style>
    </div>
  )
}
