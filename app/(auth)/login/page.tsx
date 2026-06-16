import { Suspense } from 'react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { AccountTabs } from '@/components/cuenta/account-tabs'

export const metadata = { title: 'Iniciar sesión | Distribuidora El Abuelo' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Accedé a tu cuenta mayorista
            </p>
          </div>
          <Suspense>
            <AccountTabs />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
