/** Reglas de contraseña: mínimo 8 caracteres, una mayúscula y un número. */
export type PasswordChecks = {
  length: boolean
  upper: boolean
  number: boolean
}

export function passwordChecks(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
  }
}

export function isPasswordValid(pw: string): boolean {
  const c = passwordChecks(pw)
  return c.length && c.upper && c.number
}

export const PASSWORD_RULES: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: 'Al menos 8 caracteres' },
  { key: 'upper', label: 'Una letra mayúscula' },
  { key: 'number', label: 'Un número' },
]
