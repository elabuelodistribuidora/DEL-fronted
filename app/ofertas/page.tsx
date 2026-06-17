import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappButton } from '@/components/layout/whatsapp-button'
import { CartBanner } from '@/components/layout/cart-banner'
import { OffersGrid } from '@/components/ofertas/offers-grid'

export const metadata = {
  title: 'Ofertas y liquidación | Distribuidora El Abuelo',
  description:
    'Productos en oferta y liquidación a precios especiales por tiempo limitado.',
}

export default function OfertasPage() {
  return (
    <div className="flex min-h-screen flex-col pb-14">
      <CartBanner />
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-yellow-400 bg-yellow-300">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-yellow-900">
              ¡Aprovechá!
            </p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold text-yellow-950 sm:text-4xl">
              Ofertas y liquidación 🔥
            </h1>
            <p className="mt-1 text-sm font-medium text-yellow-900">
              Precios especiales por tiempo limitado.
            </p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OffersGrid />
        </div>
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  )
}
