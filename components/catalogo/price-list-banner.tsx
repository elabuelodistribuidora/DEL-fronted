'use client'

import { useEffect, useState } from 'react'
import { FileSpreadsheet, Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { productsService } from '@/services/products.service'

/**
 * Banner que ofrece descargar la lista de precios (Excel) — solo visible para
 * clientes logueados y si hay una lista disponible en el servidor.
 */
export function PriceListBanner() {
  const { user, isAuthenticated, hydrated } = useAuth()
  const isCustomer = isAuthenticated && user?.role === 'customer'
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isCustomer) return
    productsService
      .priceList()
      .then((res) => setUrl(res.available ? res.url : null))
      .catch(() => setUrl(null))
  }, [isCustomer])

  if (!hydrated || !isCustomer || !url) return null

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Lista de precios completa
          </p>
          <p className="text-xs text-muted-foreground">
            Descargá el Excel con todos los productos y precios.
          </p>
        </div>
      </div>
      <a
        href={url}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Download className="size-4" />
        Descargar
      </a>
    </div>
  )
}
