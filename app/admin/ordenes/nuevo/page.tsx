'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { usersService } from '@/services/users.service'
import { productsService } from '@/services/products.service'
import { ordersService } from '@/services/orders.service'
import type { User } from '@/types/user'
import type { Product } from '@/types/product'
import { formatPrice } from '@/utils/formatters'

type OrderItemDraft = {
  productId: string
  name: string
  code?: string | null
  unitPrice: number
  quantity: number
}

const EMPTY_ADDRESS = {
  fullName: '',
  street: '',
  number: '',
  floor: '',
  city: '',
  province: '',
  postalCode: '',
  phone: '',
}

export default function NuevoPedidoAdminPage() {
  const router = useRouter()

  // Cliente
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<User[]>([])
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [customer, setCustomer] = useState<User | null>(null)

  // Productos
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [searchingProduct, setSearchingProduct] = useState(false)
  const [items, setItems] = useState<OrderItemDraft[]>([])

  // Entrega y notas
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Búsqueda de cliente (debounced)
  useEffect(() => {
    if (customer) return
    const q = customerQuery.trim()
    if (!q) {
      setCustomerResults([])
      return
    }
    setSearchingCustomer(true)
    const t = setTimeout(() => {
      usersService
        .list(1, 8, q, 'approved')
        .then((res) => setCustomerResults(res.data))
        .catch(() => setCustomerResults([]))
        .finally(() => setSearchingCustomer(false))
    }, 300)
    return () => clearTimeout(t)
  }, [customerQuery, customer])

  // Búsqueda de productos (debounced)
  useEffect(() => {
    const q = productQuery.trim()
    if (!q) {
      setProductResults([])
      return
    }
    setSearchingProduct(true)
    const t = setTimeout(() => {
      productsService
        .list({ search: q, limit: 8 })
        .then((res) => setProductResults(res.data))
        .catch(() => setProductResults([]))
        .finally(() => setSearchingProduct(false))
    }, 300)
    return () => clearTimeout(t)
  }, [productQuery])

  const pickCustomer = async (u: User) => {
    setCustomer(u)
    setCustomerQuery('')
    setCustomerResults([])
    try {
      const full = await usersService.getOne(u.id)
      const def =
        full.addresses?.find((a) => a.isDefault) ?? full.addresses?.[0]
      if (def) {
        setAddress({
          fullName: def.fullName ?? full.name,
          street: def.street,
          number: def.number,
          floor: def.floor ?? '',
          city: def.city,
          province: def.province,
          postalCode: def.postalCode,
          phone: def.phone ?? '',
        })
      }
    } catch {
      // si falla, se completa la dirección a mano
    }
  }

  const addProduct = (p: Product) => {
    setProductQuery('')
    setProductResults([])
    const unitPrice = p.onSale && p.salePrice != null ? p.salePrice : p.price
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, code: p.sku, unitPrice, quantity: 1 },
      ]
    })
  }

  const updateQty = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i,
      ),
    )
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const total = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)

  const canSubmit =
    !!customer &&
    items.length > 0 &&
    address.fullName &&
    address.street &&
    address.number &&
    address.city &&
    address.province &&
    address.postalCode &&
    address.phone

  const submit = async () => {
    if (!customer || !canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const { order } = await ordersService.createManual({
        userId: customer.id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: address,
        notes: notes.trim() || undefined,
      })
      router.push(`/admin/ordenes/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el pedido')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/ordenes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Órdenes
      </Link>

      <h1 className="font-heading text-2xl font-bold text-foreground">
        Cargar pedido manual
      </h1>
      <p className="text-sm text-muted-foreground">
        Para pedidos que el cliente pasó por teléfono o email.
      </p>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Cliente */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Cliente
        </h2>
        {customer ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {customer.name}
                {customer.businessName ? ` (${customer.businessName})` : ''}
              </p>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomer(null)
                setAddress(EMPTY_ADDRESS)
              }}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              placeholder="Buscar cliente por nombre, email o razón social..."
              className="pl-9"
            />
            {(searchingCustomer || customerResults.length > 0) && customerQuery && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                {searchingCustomer ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  customerResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => pickCustomer(u)}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="font-medium text-foreground">{u.name}</span>
                      {u.businessName ? ` — ${u.businessName}` : ''}
                      <span className="block text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </button>
                  ))
                )}
                {!searchingCustomer && customerResults.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    Sin resultados.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Productos */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Productos
        </h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Buscar producto por nombre o código..."
            className="pl-9"
          />
          {(searchingProduct || productResults.length > 0) && productQuery && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {searchingProduct ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                productResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>
                      <span className="font-medium text-foreground">{p.name}</span>
                      {p.sku ? ` (${p.sku})` : ''}
                    </span>
                    <span className="text-muted-foreground">
                      {formatPrice(p.onSale && p.salePrice != null ? p.salePrice : p.price)}
                    </span>
                  </button>
                ))
              )}
              {!searchingProduct && productResults.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Sin resultados.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 divide-y divide-border">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center gap-3 py-3">
              <div className="flex-1 text-sm">
                <p className="font-medium text-foreground">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {i.code ? `Cód. ${i.code} · ` : ''}
                  {formatPrice(i.unitPrice)} c/u
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={i.quantity}
                onChange={(e) => updateQty(i.productId, Number(e.target.value))}
                className="h-9 w-16 rounded-lg border border-input bg-background px-2 text-center text-sm"
              />
              <span className="w-24 text-right text-sm font-medium">
                {formatPrice(i.unitPrice * i.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i.productId)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">
              Todavía no agregaste productos.
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-heading font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        )}
      </div>

      {/* Entrega */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Ubicación de entrega
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se completa sola con la dirección guardada del cliente; podés editarla.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Nombre y apellido / local</Label>
            <Input
              id="fullName"
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Calle</Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={address.number}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Piso / depto (opcional)</Label>
            <Input
              id="floor"
              value={address.floor}
              onChange={(e) => setAddress({ ...address, floor: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              value={address.province}
              onChange={(e) => setAddress({ ...address, province: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Código postal</Label>
            <Input
              id="postalCode"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="rounded-xl border border-border bg-card p-6">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          className="mt-2"
          rows={3}
          placeholder='Ej. "Pedido tomado por teléfono el 06/08"'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          className="rounded-full"
          size="lg"
          loading={submitting}
          disabled={!canSubmit}
          onClick={submit}
        >
          Crear pedido
        </Button>
      </div>
    </div>
  )
}
