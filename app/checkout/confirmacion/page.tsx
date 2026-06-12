import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import { ConfirmationDetails } from '@/components/checkout/confirmation-details'

export default function ConfirmacionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <CheckCircle className="mx-auto size-16 text-green-500" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            ¡Pedido confirmado!
          </h1>
          <Suspense>
            <ConfirmationDetails />
          </Suspense>
          <p className="mt-2 text-muted-foreground">
            Te enviamos un email con los detalles. Te avisaremos cuando se
            acredite el pago y cuando despachemos el envío.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="/cuenta/pedidos">
                Ver mis pedidos
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/catalogo">Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
