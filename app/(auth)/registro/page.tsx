import { Suspense } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { AccountTabs } from '@/components/cuenta/account-tabs'

export const metadata = { title: 'Crear cuenta | Distribuidora de Arte' }

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Crear cuenta mayorista
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Completá tus datos para acceder a precios mayoristas
            </p>
          </div>
          <Suspense>
            <AccountTabs defaultTab="register" />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
