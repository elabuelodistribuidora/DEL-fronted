'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { cartService } from '@/services/cart.service'
import { ordersService } from '@/services/orders.service'
import { usersService } from '@/services/users.service'
import { formatPrice } from '@/utils/formatters'
import type { Order, ShippingAddress } from '@/types/order'

type Step = 'cart' | 'location' | 'done'

const emptyAddress: ShippingAddress = {
  fullName: '',
  street: '',
  number: '',
  floor: '',
  city: '',
  province: '',
  postalCode: '',
  phone: '',
}

export default function CheckoutPage() {
  const { items, isEmpty, total, clearCart } = useCart()

  const [step, setStep] = useState<Step>('cart')
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  // Prefill con la ubicación guardada del cliente
  useEffect(() => {
    usersService
      .me()
      .then((me) => {
        const a = me.addresses?.[0]
        if (a) {
          setAddress({
            fullName: a.fullName || me.name || '',
            street: a.street ?? '',
            number: a.number ?? '',
            floor: a.floor ?? '',
            city: a.city ?? '',
            province: a.province ?? '',
            postalCode: a.postalCode ?? '',
            phone: a.phone || '',
          })
        }
      })
      .catch(() => {})
  }, [])

  if (isEmpty && step !== 'done') {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="font-heading text-lg font-semibold">
              Tu carrito está vacío
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const setField = (key: keyof ShippingAddress, value: string) =>
    setAddress((a) => ({ ...a, [key]: value }))

  const locationValid =
    address.fullName &&
    address.street &&
    address.number &&
    address.city &&
    address.province &&
    address.postalCode &&
    address.phone

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'cart', label: 'Carrito', icon: <ShoppingCart className="size-4" /> },
    { id: 'location', label: 'Ubicación', icon: <MapPin className="size-4" /> },
    { id: 'done', label: 'Listo', icon: <CheckCircle2 className="size-4" /> },
  ]

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await cartService.replace(
        items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      )
      const { order: created } = await ordersService.checkout({
        shippingAddress: address,
      })
      clearCart()
      setOrder(created)
      setStep('done')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo crear la orden',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {step !== 'done' && (
            <Link
              href="/carrito"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Volver al carrito
            </Link>
          )}

          {/* Stepper */}
          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => {
              const stepOrder = ['cart', 'location', 'done']
              const active = step === s.id
              const done = stepOrder.indexOf(step) > i
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : done
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
                </div>
              )
            })}
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Paso 1: carrito */}
          {step === 'cart' && (
            <div className="form-section space-y-4">
              <h2 className="form-section__title">Tu carrito</h2>
              <div className="divide-y divide-border rounded-xl border border-border">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <span className="font-heading font-semibold">Total</span>
                <span className="font-heading text-lg font-bold">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                className="mt-2 rounded-full"
                onClick={() => setStep('location')}
              >
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* Paso 2: ubicación */}
          {step === 'location' && (
            <div className="form-section space-y-4">
              <h2 className="form-section__title">Ubicación de entrega</h2>
              <p className="text-sm text-muted-foreground">
                Confirmá a dónde enviamos el pedido.
              </p>
              <div className="form-section__grid">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre / Comercio</Label>
                  <Input
                    id="name"
                    value={address.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Calle</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setField('street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => setField('number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Piso / Depto (opcional)</Label>
                  <Input
                    id="floor"
                    value={address.floor}
                    onChange={(e) => setField('floor', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    value={address.province}
                    onChange={(e) => setField('province', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Código postal</Label>
                  <Input
                    id="postal"
                    value={address.postalCode}
                    onChange={(e) => setField('postalCode', e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="mt-2 rounded-full"
                disabled={!locationValid}
                loading={submitting}
                onClick={handleSubmit}
              >
                Confirmar pedido
              </Button>
            </div>
          )}

          {/* Paso 3: confirmación */}
          {step === 'done' && order && (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="size-16 text-green-500" />
              <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">
                ¡Tu orden #{order.number} fue creada!
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Será procesada dentro de las <strong>48 hs hábiles</strong> y
                recibirás un email con los detalles del pedido.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/cuenta/pedidos">Ver mis pedidos</Link>
                </Button>
                <Button variant="ghost" asChild className="rounded-full">
                  <Link href="/catalogo">Seguir comprando</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
