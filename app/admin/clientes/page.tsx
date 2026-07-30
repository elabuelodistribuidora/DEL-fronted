'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  Plus,
  Loader2,
  Pencil,
  KeyRound,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Ban,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AddressAutocomplete,
  emptyAddress,
  type AddressValue,
} from '@/components/ui/address-autocomplete'
import { PasswordFields } from '@/components/cuenta/password-fields'
import { usersService } from '@/services/users.service'
import { isPasswordValid } from '@/utils/password'
import type { ClientStatus, User } from '@/types/user'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

const STATUS_FILTERS: { value: ClientStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' },
]

const STATUS_LABELS: Record<ClientStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  // Form de alta/edición
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [clientNumber, setClientNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [address, setAddress] = useState<AddressValue>(emptyAddress)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset de contraseña
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [resetPass, setResetPass] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetting, setResetting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersService.list(
        page,
        PAGE_SIZE,
        search.trim() || undefined,
        statusFilter === 'all' ? undefined : statusFilter,
      )
      // Solo clientes (no admins)
      setClients(res.data.filter((u) => u.role === 'customer'))
      setMeta(res.meta)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => {
    setEditing(null)
    setEmail('')
    setName('')
    setBusinessName('')
    setClientNumber('')
    setPassword('')
    setConfirm('')
    setAddress(emptyAddress)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setEmail(u.email)
    setName(u.name)
    setBusinessName(u.businessName ?? '')
    setClientNumber(u.clientNumber ?? '')
    const a = u.addresses?.[0]
    setAddress(
      a
        ? {
            street: a.street ?? '',
            number: a.number ?? '',
            floor: a.floor ?? '',
            city: a.city ?? '',
            province: a.province ?? '',
            postalCode: a.postalCode ?? '',
            lat: a.lat ?? undefined,
            lng: a.lng ?? undefined,
            placeId: a.placeId ?? undefined,
            formattedAddress: a.formattedAddress ?? undefined,
          }
        : emptyAddress,
    )
    setError(null)
    setShowForm(true)
  }

  const addressValid =
    address.street.trim() &&
    address.city.trim() &&
    address.province.trim() &&
    address.postalCode.trim()

  const save = async () => {
    setError(null)
    if (!addressValid) {
      setError('Completá la ubicación (calle, ciudad, provincia y CP)')
      return
    }
    if (!editing) {
      if (!isPasswordValid(password)) {
        setError('La contraseña no cumple los requisitos')
        return
      }
      if (password !== confirm) {
        setError('Las contraseñas no coinciden')
        return
      }
    }
    setSaving(true)
    try {
      if (editing) {
        await usersService.updateClient(editing.id, {
          name,
          businessName: businessName || undefined,
          clientNumber: clientNumber || undefined,
          address,
        })
      } else {
        await usersService.createClient({
          email,
          name,
          businessName: businessName || undefined,
          clientNumber: clientNumber || undefined,
          password,
          address,
        })
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const approve = async (id: string) => {
    setActioningId(id)
    try {
      await usersService.approve(id)
      await load()
    } finally {
      setActioningId(null)
    }
  }

  const reject = async (id: string, name: string) => {
    if (
      !window.confirm(
        `¿Rechazar a "${name}"? Va a quedar inactivo y no va a poder iniciar sesión.`,
      )
    )
      return
    setActioningId(id)
    try {
      await usersService.reject(id)
      await load()
    } finally {
      setActioningId(null)
    }
  }

  const doReset = async () => {
    if (!resetUser) return
    if (!isPasswordValid(resetPass) || resetPass !== resetConfirm) return
    setResetting(true)
    try {
      await usersService.resetPassword(resetUser.id, resetPass)
      setResetUser(null)
      setResetPass('')
      setResetConfirm('')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Cuentas mayoristas. Las creás vos y les pasás las credenciales.
          </p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      </div>

      {/* Form alta/edición */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {editing ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          {error && (
            <p className="mb-3 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre comercial</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Razón social</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Pérez SRL"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!editing}
                />
              </div>
              <div className="space-y-2">
                <Label>N° de cliente</Label>
                <Input
                  value={clientNumber}
                  onChange={(e) => setClientNumber(e.target.value)}
                  placeholder="1042"
                />
              </div>
            </div>

            {!editing && (
              <PasswordFields
                password={password}
                setPassword={setPassword}
                confirm={confirm}
                setConfirm={setConfirm}
              />
            )}

            <div className="space-y-3 rounded-xl border border-border p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Ubicación del local
              </h3>
              <AddressAutocomplete value={address} onChange={setAddress} />
            </div>
          </div>
          <Button
            onClick={save}
            loading={saving}
            className="mt-4 rounded-full"
          >
            {editing ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      )}

      {/* Reset de contraseña */}
      {resetUser && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-amber-900">
              Resetear contraseña de {resetUser.name}
            </h2>
            <button
              onClick={() => setResetUser(null)}
              className="text-amber-700 hover:text-amber-900"
            >
              <X className="size-4" />
            </button>
          </div>
          <PasswordFields
            password={resetPass}
            setPassword={setResetPass}
            confirm={resetConfirm}
            setConfirm={setResetConfirm}
            label="Nueva contraseña"
          />
          <Button
            onClick={doReset}
            loading={resetting}
            disabled={!isPasswordValid(resetPass) || resetPass !== resetConfirm}
            className="mt-4 rounded-full"
          >
            Cambiar contraseña
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-muted/40 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>N° cliente</th>
                <th>Nombre comercial</th>
                <th>Razón social</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Aprobación</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((u) => {
                const a = u.addresses?.[0]
                const status = u.status ?? 'approved'
                const expanded = expandedId === u.id
                return (
                  <Fragment key={u.id}>
                  <tr>
                    <td className="text-muted-foreground">
                      {u.clientNumber || '—'}
                    </td>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-muted-foreground">
                      {u.businessName || '—'}
                    </td>
                    <td>{u.email}</td>
                    <td className="text-muted-foreground">
                      <button
                        onClick={() => setExpandedId(expanded ? null : u.id)}
                        className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                      >
                        <MapPin className="size-3" />
                        {a ? `${a.city}, ${a.province}` : '—'}
                      </button>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'status-badge',
                          status === 'approved' && 'status-badge--delivered',
                          status === 'pending' && 'status-badge--pending',
                          status === 'rejected' && 'status-badge--cancelled',
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          usersService
                            .setActive(u.id, !u.active)
                            .then(load)
                        }
                        className={`status-badge ${u.active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                      >
                        {u.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-3">
                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() => approve(u.id)}
                              disabled={actioningId === u.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
                            >
                              <Check className="size-3" /> Aprobar
                            </button>
                            <button
                              onClick={() => reject(u.id, u.name)}
                              disabled={actioningId === u.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                            >
                              <Ban className="size-3" /> Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Pencil className="size-3" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            setResetUser(u)
                            setResetPass('')
                            setResetConfirm('')
                          }}
                          className="inline-flex items-center gap-1 text-xs text-amber-700 hover:underline"
                        >
                          <KeyRound className="size-3" /> Contraseña
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Eliminar al cliente "${u.name}"? Se borrarán también sus órdenes. Esta acción no se puede deshacer.`,
                              )
                            ) {
                              usersService
                                .remove(u.id)
                                .then(load)
                                .catch((e) =>
                                  setError(
                                    e instanceof Error
                                      ? e.message
                                      : 'No se pudo eliminar',
                                  ),
                                )
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="size-3" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={8} className="bg-muted/30">
                        {a ? (
                          <div className="grid gap-x-6 gap-y-1 py-2 text-xs text-muted-foreground sm:grid-cols-3">
                            <span>
                              <strong className="text-foreground">Dirección:</strong>{' '}
                              {a.street} {a.number}
                              {a.floor ? `, ${a.floor}` : ''}
                            </span>
                            <span>
                              <strong className="text-foreground">CP:</strong>{' '}
                              {a.postalCode}
                            </span>
                            <span>
                              <strong className="text-foreground">Tel:</strong>{' '}
                              {a.phone || '—'}
                            </span>
                          </div>
                        ) : (
                          <p className="py-2 text-xs text-muted-foreground">
                            Sin dirección cargada.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                )
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No hay clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
