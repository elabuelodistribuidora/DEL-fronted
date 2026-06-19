'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SelectOption = { value: string; label: string }

/**
 * Select con buscador y scroll, pensado para listas largas (cientos de opciones).
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccioná',
  clearLabel,
  className,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  /** Si se pasa, agrega una opción para limpiar la selección (value ''). */
  clearLabel?: string
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setQuery('')
  }, [open])

  const selected = options.find((o) => o.value === value)
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [query, options])

  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="h-8 w-full rounded-md bg-muted pl-7 pr-2 text-sm outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {clearLabel && (
              <li>
                <button
                  type="button"
                  onClick={() => pick('')}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
                >
                  {clearLabel}
                  {!value && <Check className="size-3.5" />}
                </button>
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted',
                    value === o.value && 'bg-primary/10 font-medium text-primary',
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {value === o.value && <Check className="size-3.5 shrink-0" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2.5 py-2 text-sm text-muted-foreground">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
