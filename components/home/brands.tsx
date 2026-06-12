const brands = [
  'EQ Artistica',
  'Faber-Castell',
  'Rembrandt',
  'Canson',
  'Pelikan',
  'Mont Marte',
  'Crayola',
]

export function Brands() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Nuestras marcas líderes
          </p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Trabajamos con los mejores
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-6 text-center font-heading text-base font-bold tracking-tight text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
