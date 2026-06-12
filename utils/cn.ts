import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 * Reemplaza el cn de lib/utils para tenerlo centralizado en utils/.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
