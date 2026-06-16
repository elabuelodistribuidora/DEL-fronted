'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, ShoppingCart, User, Menu, LogOut } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Productos' },
  { href: '/catalogos', label: 'Catálogos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { itemCount } = useCart()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const isCustomer = user?.role === 'customer'

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    router.push(q ? `/catalogo?search=${encodeURIComponent(q)}` : '/catalogo')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>

        <form
          onSubmit={submitSearch}
          className="ml-auto hidden max-w-xs flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Qué necesitás?"
              className="h-10 rounded-full bg-muted pl-9"
              aria-label="Buscar productos"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          {isCustomer && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/carrito" aria-label="Carrito">
                <ShoppingCart className="size-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link
              href={isAuthenticated ? '/cuenta/pedidos' : '/cuenta'}
              aria-label="Mi cuenta"
              title={user ? user.name : 'Mi cuenta'}
            >
              <User className="size-5" />
            </Link>
          </Button>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={() => {
                logout()
                router.push('/')
              }}
            >
              <LogOut className="size-5" />
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'lg:hidden',
              )}
              aria-label="Menú"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Panel admin
                  </Link>
                )}
                <Link
                  href={isAuthenticated ? '/cuenta/pedidos' : '/cuenta'}
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
                >
                  Mi cuenta
                </Link>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                      router.push('/')
                    }}
                    className="rounded-md px-3 py-2.5 text-left text-base font-medium text-destructive hover:bg-muted"
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
