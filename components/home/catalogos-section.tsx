'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Lock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLoader } from '@/components/ui/image-loader'
import { catalogosService, type CatalogoPublic } from '@/services/catalogos.service'
import { useAuth } from '@/hooks/useAuth'

export function CatalogosSection({ showEmpty = false }: { showEmpty?: boolean }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [catalogos, setCatalogos] = useState<CatalogoPublic[]>([])
  const [openingId, setOpeningId] = useState<string | null>(null)

  useEffect(() => {
    catalogosService
      .list()
      .then(setCatalogos)
      .catch(() => setCatalogos([]))
  }, [])

  if (catalogos.length === 0) {
    if (!showEmpty) return null
    return (
      <section className="bg-background py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {!isAuthenticated && (
            <p className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="size-3.5" />
              Iniciá sesión como cliente para acceder a los catálogos.
            </p>
          )}
          <p className="text-muted-foreground">
            No hay catálogos disponibles por el momento.
          </p>
        </div>
      </section>
    )
  }

  const open = async (id: string) => {
    if (!isAuthenticated) {
      router.push('/cuenta?callbackUrl=/catalogo')
      return
    }
    setOpeningId(id)
    try {
      const { url } = await catalogosService.getLink(id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      router.push('/cuenta')
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <section className="bg-background py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Catálogos
          </p>
          <h2 className="mt-2 text-balance text-2xl font-bold text-foreground sm:text-3xl">
            Descargá nuestros catálogos
          </h2>
          {!isAuthenticated && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="size-3.5" />
              Iniciá sesión como cliente para acceder a los catálogos.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {catalogos.map((c) => (
            <article
              key={c.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
                {c.imageUrl ? (
                  <ImageLoader
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <BookOpen className="size-12 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="flex-1 font-heading text-sm font-semibold text-foreground">
                  {c.name}
                </h3>
                <Button
                  size="sm"
                  className="rounded-full text-xs"
                  loading={openingId === c.id}
                  onClick={() => open(c.id)}
                >
                  {isAuthenticated ? (
                    <>
                      <ExternalLink className="size-3.5" />
                      Ver catálogo
                    </>
                  ) : (
                    <>
                      <Lock className="size-3.5" />
                      Iniciá sesión
                    </>
                  )}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
