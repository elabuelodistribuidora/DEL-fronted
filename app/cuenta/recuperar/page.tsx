import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ForgotPasswordFlow } from '@/components/cuenta/forgot-password-flow'

export const metadata = {
  title: 'Recuperar contraseña | Distribuidora de Arte',
}

export default function RecuperarPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ForgotPasswordFlow />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
