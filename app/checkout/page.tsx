'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Loader2,
} from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { shippingService, type ShippingQuoteResult } from '@/services/shipping.service'
import { cartService } from '@/services/cart.service'
import { ordersService } from '@/services/orders.service'
import { formatPrice } from '@/utils/formatters'
import type { ShippingAddress } from '@/types/order'

type Step = 'shipping' | 'delivery' | 'payment'
type PaymentMethod = 'mercadopago' | 'transfer' | 'cash'

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
  const router = useRouter()

  const [step, setStep] = useState<Step>('shipping')
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress)
  const [quotes, setQuotes] = useState<ShippingQuoteResult[]>([])
  const [quoting, setQuoting] = useState(false)
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingQuoteResult | null>(null)
  const [payment, setPayment] = useState<PaymentMethod>('mercadopago')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isEmpty) {
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

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'shipping', label: 'Envío', icon: <MapPin className="size-4" /> },
    { id: 'delivery', label: 'Entrega', icon: <Truck className="size-4" /> },
    { id: 'payment', label: 'Pago', icon: <CreditCard className="size-4" /> },
  ]

  const setField = (key: keyof ShippingAddress, value: string) =>
    setAddress((a) => ({ ...a, [key]: value }))

  const shippingValid =
    address.fullName &&
    address.street &&
    address.number &&
    address.city &&
    address.province &&
    address.postalCode &&
    address.phone

  const goToDelivery = async () => {
    setError(null)
    setStep('delivery')
    setQuoting(true)
    try {
      const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
      const weight = Math.max(1, itemCount * 0.5)
      const result = await shippingService.quote(address.postalCode, weight)
      setQuotes(result)
      setSelectedShipping(result[0] ?? null)
    } catch {
      setError('No se pudo cotizar el envío. Reintentá.')
    } finally {
      setQuoting(false)
    }
  }

  const shippingCost = selectedShipping?.cost ?? 0
  const grandTotal = total + shippingCost

  const handleSubmit = async () => {
    if (!selectedShipping) return
    setSubmitting(true)
    setError(null)
    try {
      // 1. Sincroniza el carrito local con el backend
      await cartService.replace(
        items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          variantId: i.variantId,
        })),
      )
      // 2. Crea la orden
      const { order, payment: pay } = await ordersService.checkout({
        shippingMethod: selectedShipping.method,
        paymentMethod: payment,
        shippingAddress: address,
      })
      // 3. Limpia el carrito local
      clearCart()
      // 4. Redirige a MercadoPago o a la confirmación
      if (payment === 'mercadopago' && pay.initPoint) {
        window.location.href = pay.initPoint
      } else {
        router.push(
          `/checkout/confirmacion?order=${order.number}&id=${order.id}`,
        )
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo procesar el pedido',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/carrito"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al carrito
          </Link>

          {/* Steps */}
          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (steps.findIndex((x) => x.id === step) > i) setStep(s.id)
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    step === s.id
                      ? 'bg-primary text-primary-foreground'
                      : steps.findIndex((x) => x.id === step) > i
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
              </div>
            ))}
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Step: Envío */}
          {step === 'shipping' && (
            <div className="form-section space-y-4">
              <h2 className="form-section__title">Datos de envío</h2>
              <div className="form-section__grid">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={address.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    placeholder="Juan García"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="+54 341 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Calle</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setField('street', e.target.value)}
                    placeholder="Av. Corrientes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => setField('number', e.target.value)}
                    placeholder="1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Piso / Depto (opcional)</Label>
                  <Input
                    id="floor"
                    value={address.floor}
                    onChange={(e) => setField('floor', e.target.value)}
                    placeholder="3º B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="Rosario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    value={address.province}
                    onChange={(e) => setField('province', e.target.value)}
                    placeholder="Santa Fe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Código postal</Label>
                  <Input
                    id="postal"
                    value={address.postalCode}
                    onChange={(e) => setField('postalCode', e.target.value)}
                    placeholder="2000"
                  />
                </div>
              </div>
              <Button
                className="mt-2 rounded-full"
                disabled={!shippingValid}
                onClick={goToDelivery}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step: Entrega */}
          {step === 'delivery' && (
            <div className="form-section space-y-4">
              <h2 className="form-section__title">Método de entrega</h2>
              {quoting ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cotizando envío…
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((q) => (
                    <label
                      key={q.method}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                        selectedShipping?.method === q.method
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={q.method}
                        checked={selectedShipping?.method === q.method}
                        onChange={() => setSelectedShipping(q)}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{q.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {q.estimatedDays === 0
                            ? 'Inmediato'
                            : `${q.estimatedDays} días hábiles`}
                          {q.estimated ? ' · tarifa estimada' : ''}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {q.cost === 0 ? 'Gratis' : formatPrice(q.cost)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <Button
                className="mt-2 rounded-full"
                disabled={!selectedShipping}
                onClick={() => setStep('payment')}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step: Pago */}
          {step === 'payment' && (
            <div className="form-section space-y-4">
              <h2 className="form-section__title">Método de pago</h2>
              <div className="space-y-3">
                {[
                  { id: 'mercadopago', label: 'MercadoPago', desc: 'Tarjetas, QR y más' },
                  { id: 'transfer', label: 'Transferencia bancaria', desc: 'Confirmación en 24 hs' },
                  { id: 'cash', label: 'Efectivo', desc: 'Solo para retiro en local' },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                      payment === m.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id as PaymentMethod)}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-medium text-foreground">{m.label}</p>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Resumen */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Envío ({selectedShipping?.label})
                    </span>
                    <span className="font-medium">
                      {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-heading font-semibold">Total</span>
                    <span className="font-heading text-lg font-bold">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="mt-2 rounded-full"
                onClick={handleSubmit}
                loading={submitting}
              >
                {payment === 'mercadopago' ? 'Ir a pagar' : 'Confirmar pedido'}
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
