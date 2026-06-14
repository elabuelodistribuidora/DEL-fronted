import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ResetWizard } from '@/components/cuenta/reset-wizard'

export const metadata = { title: 'Recuperar contraseña | Distribuidora de Arte' }

export default function RecuperarPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Recuperar contraseña
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Te ayudamos a recuperar el acceso a tu cuenta
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ResetWizard />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
