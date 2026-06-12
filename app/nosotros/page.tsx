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
            Somos una distribuidora mayorista de insumos de arte con más de 10 años de experiencia
            abasteciendo comercios, escuelas y artistas independientes en todo el país.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            Trabajamos con las mejores marcas del mercado y ofrecemos asesoramiento personalizado
            para ayudarte a elegir los productos que mejor se adaptan a tu negocio.
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
