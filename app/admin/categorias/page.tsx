'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoriasService } from '@/services/categorias.service'
import type { Categoria } from '@/types/product'

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado para borrado con reasignación
  const [deleting, setDeleting] = useState<Categoria | null>(null)
  const [reassignTo, setReassignTo] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reassigning, setReassigning] = useState(false)

  // Búsqueda + paginación (client-side, la lista viene completa)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q
      ? categorias.filter((c) => c.name.toLowerCase().includes(q))
      : categorias
  }, [categorias, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search])

  const load = () =>
    categoriasService
      .list(true)
      .then(setCategorias)
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setError(null)
    setShowForm(true)
  }

  const openEdit = (c: Categoria) => {
    setEditing(c)
    setName(c.name)
    setDescription(c.description ?? '')
    setError(null)
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await categoriasService.update(editing.id, {
          name,
          description: description || undefined,
        })
      } else {
        await categoriasService.create({
          name,
          description: description || undefined,
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

  const startDelete = async (c: Categoria) => {
    if ((c._count?.products ?? 0) === 0) {
      if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return
      setBusyId(c.id)
      try {
        await categoriasService.remove(c.id)
        await load()
      } finally {
        setBusyId(null)
      }
      return
    }
    // Tiene productos: pedir categoría destino
    setDeleting(c)
    setReassignTo('')
  }

  const confirmReassignDelete = async () => {
    if (!deleting || !reassignTo) return
    setReassigning(true)
    try {
      await categoriasService.remove(deleting.id, reassignTo)
      setDeleting(null)
      await load()
    } finally {
      setReassigning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Categorías
          </h1>
          <p className="text-sm text-muted-foreground">
            Rubros del catálogo. Se usan en los filtros y al crear productos.
          </p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {editing ? 'Editar categoría' : 'Nueva categoría'}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escolar"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={save}
            loading={saving}
            disabled={!name}
            className="mt-4 rounded-full"
          >
            Guardar
          </Button>
        </div>
      )}

      {/* Panel de reasignación al borrar */}
      {deleting && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="font-heading text-base font-semibold text-amber-900">
            Reasignar productos de “{deleting.name}”
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Esta categoría tiene {deleting._count?.products} producto(s). Elegí a
            qué categoría moverlos antes de eliminarla.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-64 space-y-2">
              <Label>Mover productos a</Label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias
                    .filter((c) => c.id !== deleting.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-full"
              disabled={!reassignTo}
              loading={reassigning}
              onClick={confirmReassignDelete}
            >
              Reasignar y eliminar
            </Button>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
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
                <th>Productos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c._count?.products ?? 0}</td>
                  <td>
                    <span
                      className={`status-badge ${c.active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {c.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Pencil className="size-3" /> Editar
                      </button>
                      <button
                        onClick={() => startDelete(c)}
                        disabled={busyId === c.id}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        {busyId === c.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}{' '}
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No hay categorías.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
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
