'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Plus,
  Loader2,
  Pencil,
  KeyRound,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
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
import type { User } from '@/types/user'

const PAGE_SIZE = 20

export default function AdminClientesPage() {
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })

  // Form de alta/edición
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
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
      const res = await usersService.list(page, PAGE_SIZE, search.trim() || undefined)
      // Solo clientes (no admins)
      setClients(res.data.filter((u) => u.role === 'customer'))
      setMeta(res.meta)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => {
    setEditing(null)
    setEmail('')
    setName('')
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
        await usersService.updateClient(editing.id, { name, address })
      } else {
        await usersService.createClient({ email, name, password, address })
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
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
                <Label>Nombre / Comercio</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
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

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((u) => {
                const a = u.addresses?.[0]
                return (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="text-muted-foreground">
                      {a ? `${a.city}, ${a.province}` : '—'}
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
                      <div className="flex gap-3">
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
                      </div>
                    </td>
                  </tr>
                )
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
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
