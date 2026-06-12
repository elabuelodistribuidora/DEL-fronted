import Link from 'next/link'
import { Banknote, Landmark, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaymentCta() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-balance text-2xl font-bold sm:text-3xl">
              Comprá fácil, pagá como prefieras
            </h2>
            <p className="max-w-md text-pretty text-primary-foreground/75">
              Aceptamos transferencia bancaria y efectivo. Registrate como
              cliente mayorista para ver precios y armar tu pedido.
            </p>
            <Button
              asChild
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/cuenta">
                Crear cuenta
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentItem icon={<Landmark className="size-6" />} label="Transferencia" />
            <PaymentItem icon={<Banknote className="size-6" />} label="Efectivo" />
          </div>
        </div>
      </div>
    </section>
  )
}

function PaymentItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-primary-foreground/10 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
    </div>
  )
}