# Distribuidora de Arte — Frontend

Next.js 14 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand

## Estructura

```
frontend/
├── app/                    # Rutas (Next.js App Router)
│   ├── (auth)/             # Login y registro
│   ├── admin/              # Panel administrador (protegido)
│   ├── carrito/
│   ├── catalogo/[slug]/
│   ├── checkout/
│   ├── cuenta/
│   ├── api/                # Route handlers (NextAuth, webhooks)
│   └── globals.css         # Entry point de estilos
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Header, Footer, Logo, WhatsApp
│   ├── home/               # Hero, Features, Brands, etc.
│   ├── catalogo/           # ProductCard, ProductCatalog
│   ├── carrito/            # CartDrawer, CartItem
│   ├── checkout/           # CheckoutForm, PaymentWidget
│   ├── cuenta/             # AccountTabs
│   └── admin/              # Tablas, formularios admin
├── hooks/                  # useCart, useProducts, useOrders, useShipping
├── store/                  # Zustand: cartStore, uiStore
├── styles/                 # Tokens de diseño separados por dominio
│   ├── index.css           # Paleta, tipografía, animaciones globales
│   ├── layout.css          # Header, footer, sidebar admin
│   └── components.css      # Cards, badges, tablas, formularios
├── types/                  # TypeScript types por dominio
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── user.ts
│   └── shipping.ts
├── utils/                  # Utilidades puras
│   ├── api.ts              # Fetch wrapper para el backend
│   ├── cn.ts               # Class merging (Tailwind)
│   ├── formatters.ts       # Precio AR, fechas, CUIT
│   └── validators.ts       # Email, CUIT, teléfono, etc.
├── lib/
│   ├── utils.ts            # Re-export de cn para shadcn
│   └── products.ts         # Mock data (reemplazar por API calls)
├── middleware.ts            # Protege rutas /admin y /cuenta
└── public/
    └── hero-art.jpg        # Hero image
```

## Arrancar

```bash
pnpm install
pnpm dev
```

## Variables de entorno

Copiar `.env.local` y completar:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
NEXT_PUBLIC_MP_PUBLIC_KEY=...
NEXT_PUBLIC_WA_NUMBER=5493410000000
```

## Pendiente (se agrega cuando el backend esté listo)

- [ ] Configurar NextAuth en `lib/auth.ts`
- [ ] Reemplazar mock data de `lib/products.ts` por API calls
- [ ] Implementar `hooks/useOrders.ts` con token real
- [ ] MercadoPago Bricks en `components/checkout/PaymentWidget.tsx`
- [ ] Integración Andreani/OCA en `hooks/useShipping.ts`
