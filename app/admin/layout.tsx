import Link from 'next/link'
import {
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
import { AdminGuard } from '@/components/admin/admin-guard'
import { AdminLogout } from '@/components/admin/admin-logout'

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

export const metadata = { title: 'Admin | Distribuidora de Arte' }

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar fixed inset-y-0 left-0 z-40">
          <div className="flex h-16 items-center border-b border-border px-4">
            <Logo />
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="admin-sidebar__link">
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <AdminLogout />
          </div>
        </aside>
        {/* Main content offset by sidebar width */}
        <div className="flex flex-1 flex-col lg:pl-64">
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  )
}
