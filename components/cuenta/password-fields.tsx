'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { passwordChecks, PASSWORD_RULES } from '@/utils/password'

/**
 * Campos de contraseña + confirmación con reglas en vivo y validación de
 * coincidencia. Reutilizable en el registro y en recuperar contraseña.
 */
export function PasswordFields({
  password,
  setPassword,
  confirm,
  setConfirm,
  label = 'Contraseña',
}: {
  password: string
  setPassword: (v: string) => void
  confirm: string
  setConfirm: (v: string) => void
  label?: string
}) {
  const [show, setShow] = useState(false)
  const checks = passwordChecks(password)
  const mismatch = confirm.length > 0 && confirm !== password

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pw">{label}</Label>
        <div className="relative">
          <Input
            id="pw"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={show ? 'Ocultar' : 'Mostrar'}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {/* Checklist de reglas (aparece al empezar a escribir) */}
        {password.length > 0 && (
          <ul className="space-y-1 pt-1">
            {PASSWORD_RULES.map((rule) => {
              const ok = checks[rule.key]
              return (
                <li
                  key={rule.key}
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    ok ? 'text-green-600' : 'text-muted-foreground',
                  )}
                >
                  {ok ? (
                    <Check className="size-3.5" />
                  ) : (
                    <X className="size-3.5" />
                  )}
                  {rule.label}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pw2">Confirmar contraseña</Label>
        <Input
          id="pw2"
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={cn(mismatch && 'border-destructive')}
          required
          autoComplete="new-password"
        />
        {mismatch && (
          <p className="text-xs text-destructive">
            Las contraseñas no coinciden
          </p>
        )}
      </div>
    </div>
  )
}
