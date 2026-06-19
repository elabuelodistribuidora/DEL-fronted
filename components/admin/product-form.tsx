'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Checkbox } from '@/components/ui/checkbox'
import { productsService } from '@/services/products.service'
import { categoriasService } from '@/services/categorias.service'
import { marcasService } from '@/services/marcas.service'
import { uploadService } from '@/services/upload.service'
import type { Categoria, Marca } from '@/types/product'

type FormState = {
  name: string
  description: string
  sku: string
  price: string
  categoriaId: string
  marcaId: string
  inStock: boolean
  hidden: boolean
  featured: boolean
  onSale: boolean
  salePrice: string
  exclusive: boolean
  image: string
}

const empty: FormState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  categoriaId: '',
  marcaId: '',
  inStock: true,
  hidden: false,
  featured: false,
  onSale: false,
  salePrice: '',
  exclusive: false,
  image: '',
}

export function ProductForm({ id }: { id: string }) {
  const isNew = id === 'nuevo'
  const router = useRouter()
  const [form, setForm] = useState<FormState>(empty)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    categoriasService.list(true).then(setCategorias).catch(() => {})
    marcasService.list(true).then(setMarcas).catch(() => {})
    if (!isNew) {
      productsService
        .getOne(id)
        .then((p) =>
          setForm({
            name: p.name,
            description: p.description ?? '',
            sku: p.sku ?? '',
            price: String(p.price),
            categoriaId: p.categoriaId,
            marcaId: p.marcaId ?? '',
            inStock: Boolean(p.inStock),
            hidden: Boolean(p.hidden),
            featured: Boolean(p.featured),
            onSale: Boolean(p.onSale),
            salePrice: p.salePrice != null ? String(p.salePrice) : '',
            exclusive: Boolean(p.exclusive),
            image: p.image ?? '',
          }),
        )
        .catch(() => setError('No se pudo cargar el producto'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleUpload = async (file?: File) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { key } = await uploadService.uploadFile(file, 'productos')
      set('image', key)
    } catch {
      setError(
        'No se pudo subir la imagen (¿S3 configurado?). Podés guardar sin imagen por ahora.',
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description || undefined,
      sku: form.sku || undefined,
      price: Number(form.price),
      categoriaId: form.categoriaId,
      marcaId: form.marcaId || null,
      inStock: form.inStock,
      hidden: form.hidden,
      featured: form.featured,
      onSale: form.onSale,
      salePrice:
        form.onSale && form.salePrice ? Number(form.salePrice) : undefined,
      exclusive: form.exclusive,
      image: form.image || undefined,
    }
    try {
      if (isNew) {
        await productsService.create(payload)
      } else {
        await productsService.update(id, payload)
      }
      router.push('/admin/productos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Productos
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </h1>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        {!isNew && (
          <p className="rounded-lg bg-muted px-4 py-2.5 text-xs text-muted-foreground">
            Código, nombre, precio, categoría y marca se actualizan desde el
            Excel (solo lectura). Acá editás imagen, descripción, stock, oferta,
            exclusividad y visibilidad.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nombre</Label>
            <Input
              required
              disabled={!isNew}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Nombre del producto (incluye la unidad/medida)"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descripción (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <SearchableSelect
              value={form.categoriaId}
              onChange={(v) => set('categoriaId', v)}
              options={categorias.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Seleccioná una categoría"
              disabled={!isNew}
            />
          </div>

          <div className="space-y-2">
            <Label>Marca (opcional)</Label>
            <SearchableSelect
              value={form.marcaId}
              onChange={(v) => set('marcaId', v)}
              options={marcas.map((m) => ({ value: m.id, label: m.name }))}
              placeholder="Sin marca"
              clearLabel="Sin marca"
              disabled={!isNew}
            />
          </div>

          <div className="space-y-2">
            <Label>Código</Label>
            <Input
              disabled={!isNew}
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="15601"
            />
          </div>
          <div className="space-y-2">
            <Label>Precio mayorista</Label>
            <Input
              required
              disabled={!isNew}
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="1109.88"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Imagen</Label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : form.image ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Upload className="size-4" />
                )}
                {form.image ? 'Imagen cargada' : 'Subir imagen'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="inStock"
              checked={form.inStock}
              onCheckedChange={(v) => set('inStock', Boolean(v))}
            />
            <Label htmlFor="inStock" className="cursor-pointer font-normal">
              Hay stock
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={form.featured}
              onCheckedChange={(v) => set('featured', Boolean(v))}
            />
            <Label htmlFor="featured" className="cursor-pointer font-normal">
              Destacado (aparece en la home)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="exclusive"
              checked={form.exclusive}
              onCheckedChange={(v) => set('exclusive', Boolean(v))}
            />
            <Label htmlFor="exclusive" className="cursor-pointer font-normal">
              Exclusivo (se diferencia del resto)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="onSale"
              checked={form.onSale}
              onCheckedChange={(v) => set('onSale', Boolean(v))}
            />
            <Label htmlFor="onSale" className="cursor-pointer font-normal">
              En oferta / liquidación
            </Label>
          </div>
          {form.onSale && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Precio de oferta</Label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => set('salePrice', e.target.value)}
                placeholder="Precio en oferta / liquidación"
              />
            </div>
          )}
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="hidden"
              checked={form.hidden}
              onCheckedChange={(v) => set('hidden', Boolean(v))}
            />
            <Label htmlFor="hidden" className="cursor-pointer font-normal">
              Ocultar (no visible para los clientes)
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="rounded-full"
          loading={saving}
          disabled={!form.categoriaId || (form.onSale && !form.salePrice)}
        >
          Guardar
        </Button>
      </form>
    </div>
  )
}
