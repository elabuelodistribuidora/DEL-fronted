import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappButton } from '@/components/layout/whatsapp-button'

export const metadata = { title: 'Nosotros | Distribuidora de Arte' }

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-primary">Nosotros</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Quiénes somos
            </h1>
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            En plena crisis del 2000, una familia de Ituzaingó decidió no quedarse de brazos cruzados. Así nació El Abuelo: el proyecto de crear una de las primeras distribuidoras de productos artísticos, de manualidades y artesanales del país.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Desde el comienzo apostamos por hacer las cosas distinto. Formamos un equipo de vendedores especializados, organizamos entregas en 48 horas e incluso envíos al interior, siempre trabajando codo a codo con cada comercio minorista para ayudarlos a vender más.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Hoy representamos a las marcas más reconocidas del rubro y seguimos buscando lo mismo de siempre: estar al día con las nuevas técnicas, las tendencias del mercado y las herramientas que hacen crecer tu negocio.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { value: '+1200', label: 'Productos en catálogo' },
              { value: '+15', label: 'Marcas representadas' },
              { value: '10 años', label: 'De trayectoria' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="font-heading text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  )
}
