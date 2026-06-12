'use client'

import { useEffect, useState } from 'react'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  ImageIcon,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usersService } from '@/services/users.service'
import { uploadService } from '@/services/upload.service'
import { api } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

export default function AdminConfiguracionPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const [loading, setLoading] = useState(true)
  const [mpConfigured, setMpConfigured] = useState(false)
  const [s3Configured, setS3Configured] = useState(false)
  const [profile, setProfile] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      api
        .get<{ configured: boolean }>('/payments/config')
        .catch(() => ({ configured: false })),
      uploadService.status().catch(() => ({ configured: false })),
      usersService.me().catch(() => null),
    ])
      .then(([mp, s3, me]) => {
        setMpConfigured(mp.configured)
        setS3Configured(s3.configured)
        if (me) setProfile(me)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const updated = await usersService.updateProfile({
        name: profile.name ?? undefined,
        phone: profile.phone ?? undefined,
        businessName: profile.businessName ?? undefined,
        cuit: profile.cuit ?? undefined,
      })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Configuración
      </h1>

      {/* Estado de integraciones */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Integraciones
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado de los servicios externos. Se activan al cargar las credenciales
          en el backend (variables de entorno).
        </p>
        <div className="mt-4 space-y-3">
          <IntegrationRow
            icon={CreditCard}
            label="MercadoPago"
            description="Cobros online (checkout + webhook)"
            ok={mpConfigured}
          />
          <IntegrationRow
            icon={ImageIcon}
            label="Almacenamiento S3"
            description="Subida de imágenes de productos y logos"
            ok={s3Configured}
          />
        </div>
      </div>

      {/* Perfil del admin */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Mi perfil
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={profile.name ?? ''}
              onChange={(e) =>
                setProfile((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={profile.phone ?? ''}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Nombre del comercio</Label>
            <Input
              value={profile.businessName ?? ''}
              onChange={(e) =>
                setProfile((p) => ({ ...p, businessName: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>CUIT / CUIL</Label>
            <Input
              value={profile.cuit ?? ''}
              onChange={(e) =>
                setProfile((p) => ({ ...p, cuit: e.target.value }))
              }
            />
          </div>
        </div>
        <Button
          onClick={saveProfile}
          disabled={saving}
          className="mt-4 rounded-full"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {saved ? 'Guardado' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}

function IntegrationRow({
  icon: Icon,
  label,
  description,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  ok: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {ok ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
          <CheckCircle2 className="size-4" />
          Conectado
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <XCircle className="size-4" />
          Sin configurar
        </span>
      )}
    </div>
  )
}
