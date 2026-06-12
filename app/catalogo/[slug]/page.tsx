import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappButton } from '@/components/layout/whatsapp-button'
import { ProductDetail } from '@/components/catalogo/product-detail'

type Props = { params: Promise<{ slug: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ProductDetail slug={slug} />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  )
}
