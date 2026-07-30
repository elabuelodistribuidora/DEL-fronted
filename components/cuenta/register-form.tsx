'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AddressAutocomplete,
  emptyAddress,
  type AddressValue,
} from '@/components/ui/address-autocomplete'
import { PasswordFields } from '@/components/cuenta/password-fields'
import { useAuth } from '@/hooks/useAuth'
import { isPasswordValid } from '@/utils/password'

/**
 * Alta pública de cuenta mayorista. Al crearse queda pendiente de
 * aprobación: puede loguear pero no ve precios/catálogos/PDF hasta que
 * el admin la habilite (cartel formal de "en revisión" al terminar).
 */
export function RegisterForm() {
  const { register } = useAuth()
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [address, setAddress] = useState<AddressValue>(emptyAddress)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addressValid =
    address.street.trim() &&
    address.city.trim() &&
    address.province.trim() &&
    address.postalCode.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!addressValid) {
      setError('Completá la ubicación (calle, ciudad, provincia y CP)')
      return
    }
    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple los requisitos')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setSaving(true)
    try {
      await register({
        email,
        name,
        businessName: businessName || undefined,
        password,
        address,
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-8 text-primary" />
          </div>
          <h1 className="mt-5 font-heading text-xl font-bold text-foreground">
            Tu cuenta fue creada con éxito
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Está <strong className="text-foreground">en revisión</strong>.
            Nuestro equipo va a verificar tus datos y habilitar el acceso a
            precios, catálogos y lista de precios apenas la aprobemos.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            Podés iniciar sesión ya mismo para seguir el estado de tu cuenta.
          </div>
          <Button asChild className="mt-6 w-full rounded-full">
            <Link href="/catalogo">Ir al catálogo</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Crear cuenta mayorista
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completá tus datos. Un admin revisa y habilita el acceso.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Nombre comercial</Label>
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-business">Razón social (opcional)</Label>
            <Input
              id="reg-business"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Pérez SRL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Correo electrónico</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <PasswordFields
          password={password}
          setPassword={setPassword}
          confirm={confirm}
          setConfirm={setConfirm}
        />

        <div className="space-y-3 rounded-xl border border-border p-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Ubicación del local
          </h3>
          <AddressAutocomplete value={address} onChange={setAddress} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full"
          loading={saving}
        >
          Crear cuenta
        </Button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Mail className="size-3.5" />
        ¿Ya tenés cuenta?{' '}
        <Link href="/cuenta" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
