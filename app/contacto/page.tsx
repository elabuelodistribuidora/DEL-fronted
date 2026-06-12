import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappButton } from '@/components/layout/whatsapp-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, Clock } from 'lucide-react'

export const metadata = { title: 'Contacto | Distribuidora de Arte' }

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contacto</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">Hablemos</h1>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-foreground">Escribinos</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input id="subject" placeholder="¿En qué te podemos ayudar?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Tu consulta..." rows={5} />
                </div>
                <Button className="rounded-full">Enviar mensaje</Button>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-foreground">Datos de contacto</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Teléfono', value: '+54 341 372-2629', href: 'tel:+543413722629' },
                  { icon: Mail, label: 'Email', value: 'ventas@distribuidora.com.ar', href: 'mailto:ventas@distribuidora.com.ar' },
                  { icon: Clock, label: 'Horarios', value: 'Lun - Vie / 9:00 - 18:00', href: undefined },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      {href ? (
                        <a href={href} className="font-medium text-foreground hover:text-primary">{value}</a>
                      ) : (
                        <p className="font-medium text-foreground">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  )
}
