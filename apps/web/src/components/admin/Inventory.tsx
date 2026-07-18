'use client'

import Image from 'next/image'
import { useMemo, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { CreateProductInput, Product, ProductCategory, ProductGender } from '@box33/types'
import { cn } from '@/lib/cn'
import { ADMIN_CARD, ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { addProduct, editProduct, removeProduct, toggleStock, uploadPhoto } from './actions'

const CATEGORIES: ProductCategory[] = ['tops', 'shorts', 'camisetas', 'pantalonetas', 'otros']

interface DraftProduct {
  name: string
  gender: ProductGender
  category: ProductCategory
  pesos: string
  imageUrl: string | null
  featured: boolean
  active: boolean
}

const EMPTY_DRAFT: DraftProduct = {
  name: '',
  gender: 'm',
  category: 'tops',
  pesos: '',
  imageUrl: null,
  featured: false,
  active: true,
}

function draftToInput(draft: DraftProduct): CreateProductInput {
  return {
    name: draft.name.trim(),
    gender: draft.gender,
    category: draft.category,
    priceCents: draft.pesos === '' ? null : Math.round(Number(draft.pesos) * 100),
    imageUrl: draft.imageUrl,
    featured: draft.featured,
    active: draft.active,
  }
}

function ImagePicker({
  imageUrl,
  onUploaded,
  label,
}: {
  imageUrl: string | null
  onUploaded: (url: string) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadPhoto(formData)
      if (result.ok && result.url) onUploaded(result.url)
      else toast.error(result.message ?? 'Error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-[52px] flex-none overflow-hidden bg-[#dddbd0]">
        {imageUrl && <Image src={imageUrl} alt="" fill sizes="52px" className="object-cover" />}
      </div>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="border-bone/25 font-condensed text-bone/60 hover:border-moss hover:text-moss cursor-pointer border px-3 py-2 text-xs font-semibold tracking-wider uppercase disabled:opacity-50"
      >
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </div>
  )
}

function ProductEditor({
  draft,
  setDraft,
  onSubmit,
  submitLabel,
  pending,
}: {
  draft: DraftProduct
  setDraft: (d: DraftProduct) => void
  onSubmit: () => void
  submitLabel: string
  pending: boolean
}) {
  const t = useTranslations('admin.inventory')
  const tStore = useTranslations('store')

  return (
    <div className={ADMIN_CARD}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <div className="col-span-full">
          <label className={ADMIN_LABEL}>{t('nameLabel')}</label>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className={ADMIN_INPUT}
          />
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('genderLabel')}</label>
          <select
            value={draft.gender}
            onChange={(e) => setDraft({ ...draft, gender: e.target.value as ProductGender })}
            className={ADMIN_INPUT}
          >
            <option value="m">{tStore('tagWomen')}</option>
            <option value="h">{tStore('tagMen')}</option>
          </select>
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('categoryLabel')}</label>
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as ProductCategory })}
            className={ADMIN_INPUT}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('priceLabel')}</label>
          <input
            value={draft.pesos}
            onChange={(e) => setDraft({ ...draft, pesos: e.target.value.replace(/[^0-9]/g, '') })}
            inputMode="numeric"
            placeholder="85000"
            className={`${ADMIN_INPUT} font-led`}
          />
          <p className="text-bone/40 mt-1 text-[11px]">{t('priceHelp')}</p>
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('imageLabel')}</label>
          <ImagePicker
            imageUrl={draft.imageUrl}
            onUploaded={(url) => setDraft({ ...draft, imageUrl: url })}
            label={t('uploadImage')}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <label className="font-condensed text-bone/70 flex cursor-pointer items-center gap-2 text-sm tracking-wider uppercase">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
            className="h-4 w-4 accent-[#C9A648]"
          />
          {t('featuredLabel')}
        </label>
        <label className="font-condensed text-bone/70 flex cursor-pointer items-center gap-2 text-sm tracking-wider uppercase">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            className="h-4 w-4 accent-[#A8B570]"
          />
          {t('activeLabel')}
        </label>
        <button
          type="button"
          disabled={pending || draft.name.trim().length < 2}
          onClick={onSubmit}
          className={ADMIN_SAVE}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

export function Inventory({ products }: { products: Product[] }) {
  const t = useTranslations('admin.inventory')
  const tStore = useTranslations('store')
  const tCommon = useTranslations('common')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState<DraftProduct>(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<DraftProduct>(EMPTY_DRAFT)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
  }, [products, query])

  const report = (result: { ok: boolean; message?: string }) => {
    if (result.ok) toast.success(tCommon('saved'))
    else toast.error(result.message ?? tCommon('error'))
  }

  const create = () =>
    startTransition(async () => {
      report(await addProduct(draftToInput(createDraft)))
      setCreating(false)
      setCreateDraft(EMPTY_DRAFT)
    })

  const saveEdit = (id: string) =>
    startTransition(async () => {
      report(await editProduct(id, draftToInput(editDraft)))
      setEditingId(null)
    })

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditDraft({
      name: product.name,
      gender: product.gender,
      category: product.category,
      pesos: product.priceCents == null ? '' : String(Math.round(product.priceCents / 100)),
      imageUrl: product.imageUrl,
      featured: product.featured,
      active: product.active,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className={`${ADMIN_INPUT} max-w-xs min-w-[220px]`}
        />
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="border-moss font-condensed text-moss hover:bg-moss/10 cursor-pointer border px-4 py-2.5 text-sm font-bold tracking-[2px] uppercase transition-colors"
        >
          {t('newProduct')}
        </button>
      </div>

      {creating && (
        <ProductEditor
          draft={createDraft}
          setDraft={setCreateDraft}
          onSubmit={create}
          submitLabel={t('create')}
          pending={pending}
        />
      )}

      {filtered.length === 0 && <p className="text-bone/50 py-8 text-center">{t('empty')}</p>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3">
        {filtered.map((product) => (
          <div key={product.id} className="border-bone/10 bg-surface flex flex-col border p-2.5">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-[52px] flex-none overflow-hidden bg-[#dddbd0]">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="52px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-condensed text-bone truncate text-[15px] font-bold tracking-wide uppercase">
                  {product.name}
                </p>
                <p className="text-bone/45 text-xs">
                  {product.gender === 'm' ? tStore('tagWomen') : tStore('tagMen')} ·{' '}
                  {product.category}
                  {!product.active && ' · ✕'}
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(async () => report(await toggleStock(product.id)))}
                className={cn(
                  'font-condensed flex-none cursor-pointer border px-2.5 py-2 text-xs font-bold tracking-[1.5px] uppercase',
                  product.soldOut
                    ? 'border-ember bg-ember/15 text-ember'
                    : 'border-moss/60 bg-moss/[.12] text-moss'
                )}
              >
                {product.soldOut ? t('soldOut') : t('available')}
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => (editingId === product.id ? setEditingId(null) : startEdit(product))}
                className="border-bone/20 font-condensed text-bone/60 hover:border-moss hover:text-moss flex-1 cursor-pointer border px-2 py-1.5 text-xs font-semibold tracking-wider uppercase"
              >
                {tCommon('edit')}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(t('deleteConfirm'))) {
                    startTransition(async () => report(await removeProduct(product.id)))
                  }
                }}
                className="border-bone/20 font-condensed text-bone/60 hover:border-ember hover:text-ember flex-1 cursor-pointer border px-2 py-1.5 text-xs font-semibold tracking-wider uppercase"
              >
                {tCommon('delete')}
              </button>
            </div>
            {editingId === product.id && (
              <div className="mt-2">
                <ProductEditor
                  draft={editDraft}
                  setDraft={setEditDraft}
                  onSubmit={() => saveEdit(product.id)}
                  submitLabel={tCommon('save')}
                  pending={pending}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
