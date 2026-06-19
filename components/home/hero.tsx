import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Palette, Sparkles, Star, Brush, Frame, PaintBucket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLoader } from '@/components/ui/image-loader'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.5_0.17_30)] via-[oklch(0.43_0.18_24)] to-[oklch(0.32_0.13_18)] text-primary-foreground">

      {/* Vectores de fondo */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-[500px] rounded-full border border-primary-foreground/5" />
      <div className="pointer-events-none absolute -right-20 -top-20 size-[340px] rounded-full border border-primary-foreground/8" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-52 rounded-full border border-primary-foreground/5" />
      <svg className="pointer-events-none absolute left-0 top-0 opacity-5" width="320" height="320" viewBox="0 0 320 320" aria-hidden="true">
        <line x1="0" y1="320" x2="320" y2="0" stroke="white" strokeWidth="1" />
        <line x1="0" y1="240" x2="240" y2="0" stroke="white" strokeWidth="1" />
        <line x1="0" y1="160" x2="160" y2="0" stroke="white" strokeWidth="1" />
      </svg>
      <div className="pointer-events-none absolute bottom-12 left-1/3 size-2 rounded-full bg-accent opacity-60" />
      <div className="pointer-events-none absolute left-1/4 top-12 size-1.5 rounded-full bg-accent opacity-40" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">

        {/* Texto */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/90 ring-1 ring-primary-foreground/15">
            <Palette className="size-3.5 text-accent" />
            Distribuidora mayorista de arte
          </span>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Todo el arte{' '}
            <span className="relative inline-block text-accent">
              en una sola marca
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 5 Q50 0 100 4 Q150 8 200 3" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
              </svg>
            </span>
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
            Pinturas, pinceles, bastidores y más. Precios competitivos, asesoramiento personalizado y entrega a tu local.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/catalogo">Ver catálogo <ArrowRight className="size-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/cuenta">Crear cuenta mayorista</Link>
            </Button>
          </div>
          <dl className="flex gap-8 pt-2">
            {[
              { value: '+6000', label: 'Productos' },
              { value: '+15', label: 'Marcas líderes' },
              { value: '27 años', label: 'Trayectoria' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-accent">{stat.value}</dt>
                <dd className="text-sm text-primary-foreground/60">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Collage tipo bento */}
        <div className="relative">
          {/* Decoración */}
          <svg className="pointer-events-none absolute -right-6 -top-6 z-0 opacity-20" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="55" stroke="white" strokeWidth="1" fill="none" strokeDasharray="4 6" />
          </svg>
          <Star className="pointer-events-none absolute -bottom-3 -left-3 z-30 size-6 fill-accent text-accent opacity-80" />
          <div className="absolute -left-3 top-6 z-30 flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
            <Sparkles className="size-4" />
          </div>

          <div className="relative grid h-[440px] grid-cols-5 grid-rows-6 gap-3 sm:h-[500px]">

            {/* Foto principal (real) */}
            <figure className="relative col-span-3 row-span-4 overflow-hidden rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-primary-foreground/10">
              <Image
                src="/hero-local.jpg"
                alt="Interior del local de Distribuidora El Abuelo"
                fill
                priority
                sizes="(min-width: 1024px) 30vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3">
                <p className="text-sm font-semibold text-white">Materiales para artistas plásticos</p>
              </div>
            </figure>

            <CollageTile
              className="col-span-2 row-span-3"
              icon={<PaintBucket className="size-7" />}
              title="Pinturas decorativas"
              subtitle="Desde $1.200"
              image="/hero-pinceles.jpg"
              />

            <CollageTile
              className="col-span-2 row-span-3"
              icon={<Brush className="size-7" />}
              title="Pinceles"
              subtitle="+200 modelos"
              image="/hero-pinturas.jpg"
            />

            <CollageTile
              className="col-span-3 row-span-2"
              icon={<Frame className="size-7" />}
              title="Lienzos y bastidores - Cartones entelados"
              subtitle="Todas las medidas"
              image="/hero-bastidores.jpg"
            />
          </div>

          {/* Badge entrega (flotante) */}
          <div className="absolute -bottom-4 -right-4 z-30 rounded-xl bg-accent px-3 py-2 text-center shadow-lg">
            <p className="text-xs font-bold text-accent-foreground">Entrega a tu local</p>
            <p className="text-[10px] font-medium text-accent-foreground/80">Todo el país</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CollageTile({
  className,
  icon,
  title,
  subtitle,
  image,
  row = false,
}: {
  className?: string
  icon: React.ReactNode
  title: string
  subtitle: string
  image: string
  row?: boolean
}) {
  return (
    <div
      className={`group relative flex overflow-hidden rounded-2xl bg-primary-foreground/5 ring-1 ring-primary-foreground/10 ${
        row ? 'items-center gap-4 p-4' : 'flex-col justify-end p-4'
      } ${className ?? ''}`}
    >
      {/* Foto de fondo */}
      <ImageLoader
        src={image}
        alt={title}
        fill
        sizes="(min-width: 1024px) 20vw, 40vw"
        placeholderClassName="bg-primary/40"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlay para legibilidad del texto */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
      <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 text-accent ring-1 ring-primary-foreground/20 backdrop-blur-sm">
        {icon}
      </div>
      <div className="relative">
        <p className="text-sm font-semibold text-white drop-shadow">{title}</p>
        <p className="text-xs text-white/80 drop-shadow">{subtitle}</p>
      </div>
    </div>
  )
}
