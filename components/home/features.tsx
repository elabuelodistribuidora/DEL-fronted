import { Truck, Headset, ShieldCheck, PackageSearch } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Servicio de entrega',
    desc: 'Llevamos tu pedido directo al comercio.',
  },
  {
    icon: Headset,
    title: 'Asesor en línea',
    desc: '¿Alguna duda? Escribinos por WhatsApp.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    desc: 'Todas tus compras están protegidas.',
  },
  {
    icon: PackageSearch,
    title: 'Gran catálogo',
    desc: 'Todo lo que necesitás para tu hogar y local.',
  },
]

export function Features() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </span>
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
