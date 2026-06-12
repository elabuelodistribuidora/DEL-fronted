import Link from 'next/link'
import { Phone, Mail, Clock } from 'lucide-react'
import { Logo } from '@/components/layout/logo'

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b border-primary-foreground/15 py-12 sm:grid-cols-3">
          <FooterInfo
            icon={<Phone className="size-5" />}
            title="2477 500430"
            subtitle="Consultanos!"
            href="tel:+542477500430"
          />
          <FooterInfo
            icon={<Mail className="size-5" />}
            title="ventas@distribuidoraelabuelo.com.ar"
            subtitle="Escribinos!"
            href="mailto:ventas@distribuidoraelabuelo.com.ar"
          />
          <FooterInfo
            icon={<Clock className="size-5" />}
            title="Lun - Vie / 10:00 - 17:00"
            subtitle="Nuestros horarios"
          />
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-3">
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Distribuidora mayorista de insumos de arte. Acompañamos el
              crecimiento de los comercios locales.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Encuentra rápido
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { href: '/catalogo', label: 'Productos' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/contacto', label: 'Contacto' },
                { href: '/cuenta', label: 'Mi cuenta' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Seguinos
            </h3>
            <div className="mt-4 flex gap-3">
              <SocialLink href="https://facebook.com" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-primary-foreground/15 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Distribuidora de Arte. Todos los derechos reservados.</p>
          <p>Insumos de arte al por mayor.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterInfo({
  icon, title, subtitle, href,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-accent">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        <p className="text-sm text-primary-foreground/60">{subtitle}</p>
      </div>
    </div>
  )
  return href ? (
    <a href={href} className="transition-opacity hover:opacity-80">{content}</a>
  ) : content
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </a>
  )
}