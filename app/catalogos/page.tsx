import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappButton } from '@/components/layout/whatsapp-button'
import { CatalogosSection } from '@/components/home/catalogos-section'

export const metadata = { title: 'Catálogos | Distribuidora de Arte' }

export default function CatalogosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Catálogos
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Nuestros catálogos
            </h1>
          </div>
        </div>
        <CatalogosSection showEmpty />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  )
}
