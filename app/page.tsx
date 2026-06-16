import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappButton } from '@/components/layout/whatsapp-button'
import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { Brands } from '@/components/home/brands'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CatalogosSection } from '@/components/home/catalogos-section'
import { PaymentCta } from '@/components/home/payment-cta'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Brands />
        <FeaturedProducts />
        <CatalogosSection />
        <PaymentCta />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  )
}
