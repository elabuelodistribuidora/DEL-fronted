'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ImageLoaderProps = ImageProps & {
  /** Color de fondo del placeholder mientras carga (default: bg-muted). */
  placeholderClassName?: string
}

/**
 * Wrapper de next/image que muestra un spinner mientras la imagen carga
 * (útil en la primera carga, cuando el optimizer va a buscar la foto remota).
 * Una vez cargada hace fade-in. El contenedor padre debe ser `relative`.
 */
export function ImageLoader({
  className,
  placeholderClassName,
  alt,
  ...props
}: ImageLoaderProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && (
        <span
          className={cn(
            'absolute inset-0 z-10 flex animate-pulse items-center justify-center',
            placeholderClassName ?? 'bg-muted',
          )}
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </span>
      )}
      <Image
        {...props}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </>
  )
}
