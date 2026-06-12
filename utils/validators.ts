/**
 * Valida formato de email.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Valida CUIT/CUIL argentino (11 dígitos).
 */
export function isValidCuit(cuit: string): boolean {
  const clean = cuit.replace(/\D/g, '')
  if (clean.length !== 11) return false
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = multipliers.reduce(
    (acc, m, i) => acc + m * parseInt(clean[i]),
    0,
  )
  const remainder = sum % 11
  const checkDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder
  return checkDigit === parseInt(clean[10])
}

/**
 * Valida código postal argentino (4 dígitos).
 */
export function isValidPostalCode(cp: string): boolean {
  return /^\d{4}$/.test(cp.trim())
}

/**
 * Valida teléfono argentino (8-15 dígitos con prefijo opcional).
 */
export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{8,15}$/.test(phone)
}

/**
 * Valida contraseña: mínimo 8 caracteres, al menos una letra y un número.
 */
export function isValidPassword(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)
}

/**
 * Verifica que un campo no esté vacío.
 */
export function isRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0
}
