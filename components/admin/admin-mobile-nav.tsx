'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  BadgeCheck,
  BookOpen,
  BarChart2,
  Settings,
} from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { AdminLogout } from '@/components/admin/admin-logout'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/ordenes', label: 'Órdenes', icon: ShoppingBag },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/marcas', label: 'Marcas', icon: BadgeCheck },
  { href: '/admin/catalogos', label: 'Catálogos', icon: BookOpen },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart2 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

/** Barra superior con hamburguesa para navegar el admin en mobile/tablet (<lg). */
export function AdminMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      <Logo />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          aria-label="Menú de administración"
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetTitle className="sr-only">Menú de administración</SheetTitle>
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors',
                    active
                      ? 'bg-muted text-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-4 border-t border-border pt-4">
            <AdminLogout />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
