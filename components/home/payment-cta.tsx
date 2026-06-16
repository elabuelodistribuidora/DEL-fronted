import Link from 'next/link'
import { ClipboardList, Truck, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaymentCta() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-balance text-2xl font-bold sm:text-3xl">
              Hacé tu pedido mayorista online
            </h2>
            <p className="max-w-md text-pretty text-primary-foreground/75">
              Armá tu pedido desde la web y nosotros coordinamos la facturación
              y la entrega. Cuenta exclusiva para comercios.
            </p>
            <Button
              asChild
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/contacto">
                Solicitar cuenta mayorista
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <CtaItem icon={<ClipboardList className="size-6" />} label="Pedí online" />
            <CtaItem icon={<FileText className="size-6" />} label="Orden en PDF" />
            <CtaItem icon={<Truck className="size-6" />} label="Coordinamos envío" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-primary-foreground/10 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}
