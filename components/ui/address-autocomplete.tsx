'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type AddressValue = {
  street: string
  number: string
  floor?: string
  city: string
  province: string
  postalCode: string
  lat?: number
  lng?: number
  placeId?: string
  formattedAddress?: string
}

export const emptyAddress: AddressValue = {
  street: '',
  number: '',
  floor: '',
  city: '',
  province: '',
  postalCode: '',
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Carga el script de Google Maps Places una sola vez (memoizado a nivel módulo).
let mapsPromise: Promise<void> | null = null
function loadGoogleMaps(): Promise<void> {
  if (!MAPS_KEY) return Promise.reject(new Error('Sin API key de Google Maps'))
  if (typeof window === 'undefined') return Promise.reject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google?.maps?.places) return Promise.resolve()
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&language=es-419&region=AR`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Error cargando Google Maps'))
    document.head.appendChild(script)
  })
  return mapsPromise
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePlace(place: any): Partial<AddressValue> {
  const get = (type: string) => {
    const c = place.address_components?.find((x: { types: string[] }) =>
      x.types.includes(type),
    )
    return c ? c.long_name : ''
  }
  return {
    street: get('route'),
    number: get('street_number'),
    city: get('locality') || get('administrative_area_level_2'),
    province: get('administrative_area_level_1'),
    postalCode: get('postal_code'),
    lat: place.geometry?.location?.lat?.(),
    lng: place.geometry?.location?.lng?.(),
    placeId: place.place_id,
    formattedAddress: place.formatted_address,
  }
}

/**
 * Captura una dirección con autocompletado de Google Maps cuando hay API key,
 * o con campos manuales si no la hay (fallback). Siempre muestra los campos
 * estructurados editables para poder ajustar lo que devuelve Google.
 */
export function AddressAutocomplete({
  value,
  onChange,
}: {
  value: AddressValue
  onChange: (v: AddressValue) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [picked, setPicked] = useState(false)

  useEffect(() => {
    if (!MAPS_KEY) return
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch(() => setMapsReady(false))
  }, [])

  useEffect(() => {
    if (!mapsReady || !inputRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google
    const ac = new g.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ar' },
      fields: ['address_components', 'geometry', 'place_id', 'formatted_address'],
      types: ['address'],
    })
    const listener = ac.addListener('place_changed', () => {
      const parsed = parsePlace(ac.getPlace())
      onChange({ ...value, ...parsed })
      setPicked(true)
    })
    return () => listener.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady])

  const setField = (key: keyof AddressValue, v: string) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="space-y-4">
      {MAPS_KEY ? (
        <div className="space-y-2">
          <Label htmlFor="maps-search">Buscar dirección del negocio</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="maps-search"
              ref={inputRef}
              placeholder="Empezá a escribir la dirección…"
              className="pl-9"
              autoComplete="off"
            />
          </div>
          {picked && value.formattedAddress && (
            <p className="flex items-center gap-1.5 text-xs text-green-600">
              <Check className="size-3.5" />
              Ubicación confirmada: {value.formattedAddress}
            </p>
          )}
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          Cargá la dirección manualmente. El autocompletado de Google Maps se
          activa al configurar la API key.
        </p>
      )}

      {/* Campos estructurados (editables en ambos modos) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Calle</Label>
          <Input
            value={value.street}
            onChange={(e) => setField('street', e.target.value)}
            placeholder="Av. Pellegrini"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Número</Label>
          <Input
            value={value.number}
            onChange={(e) => setField('number', e.target.value)}
            placeholder="1234"
          />
        </div>
        <div className="space-y-2">
          <Label>Piso / Depto (opcional)</Label>
          <Input
            value={value.floor ?? ''}
            onChange={(e) => setField('floor', e.target.value)}
            placeholder="2º B"
          />
        </div>
        <div className="space-y-2">
          <Label>Ciudad</Label>
          <Input
            value={value.city}
            onChange={(e) => setField('city', e.target.value)}
            placeholder="Rosario"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Provincia</Label>
          <Input
            value={value.province}
            onChange={(e) => setField('province', e.target.value)}
            placeholder="Santa Fe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Código postal</Label>
          <Input
            value={value.postalCode}
            onChange={(e) => setField('postalCode', e.target.value)}
            placeholder="2000"
            required
          />
        </div>
      </div>
    </div>
  )
}
