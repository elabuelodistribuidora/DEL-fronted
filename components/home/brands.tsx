// Marcas líderes de la home. `logo` es opcional: si está, se muestra la imagen
// (poné el archivo en /public, ej. '/marcas/omc.png'); si no, se muestra el nombre.
const brands: { name: string; logo?: string }[] = [
  { name: 'OMC' },
  { name: 'Xin Bowen' },
  { name: 'Camaleon' },
  { name: 'EQ Artistica' },
  { name: 'Acuarel' },
  { name: 'Gines' },
  { name: 'Eterna' },
  { name: 'Casan' },
  { name: 'Eureka' },
  { name: 'Alba' },
  { name: 'Degas Plus' },
]

export function Brands() {
  // Se duplica la lista para que el loop del marquee sea continuo.
  const doubled = [...brands, ...brands]

  return (
    <section className="overflow-hidden bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Nuestras marcas líderes
          </p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Trabajamos con los mejores
          </h2>
        </div>
      </div>

      <div className="relative mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-muted/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-muted/40 to-transparent" />
        <div className="flex w-max animate-brands-scroll gap-4 px-4 py-2">
          {doubled.map((b, i) => (
            <div
              key={`${b.name}-${i}`}
              className="flex h-24 w-44 shrink-0 items-center justify-center rounded-xl border border-border bg-card px-4 text-center transition-colors hover:border-primary/30"
            >
              {b.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logo}
                  alt={b.name}
                  className="max-h-14 max-w-[85%] object-contain"
                />
              ) : (
                <span className="font-heading text-base font-bold tracking-tight text-foreground/80">
                  {b.name}
                </span>
              )}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes brands-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-brands-scroll { animation: brands-scroll 35s linear infinite; }
          .animate-brands-scroll:hover { animation-play-state: paused; }
        `}</style>
      </div>
    </section>
  )
}
