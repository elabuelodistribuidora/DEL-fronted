import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook de MercadoPago.
 * MP envía notificaciones de pago a esta URL.
 * Configurar en el dashboard de MP: https://www.mercadopago.com.ar/developers
 */
export async function POST(req: NextRequest) {
  const body = await req.json()

  // Validar firma HMAC de MP
  const signature = req.headers.get('x-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // TODO: reenviar al backend NestJS para procesar
  // await api.post('/payments/webhook', body)

  console.log('[MP Webhook]', body)
  return NextResponse.json({ received: true })
}
