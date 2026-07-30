import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { RegisterForm } from '@/components/cuenta/register-form'

export const metadata = {
  title: 'Crear cuenta | Distribuidora de Arte',
}

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Crear cuenta
            </h1>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <RegisterForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
