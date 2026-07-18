'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { Podium, PodiumEntry } from '@box33/types'
import { ADMIN_CARD, ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { savePodium, uploadPhoto } from './actions'

const MEDAL_BORDER: Record<number, string> = {
  1: 'border-gold/50 border-l-gold',
  2: 'border-silver/40 border-l-silver',
  3: 'border-bronze/45 border-l-bronze',
}
const MEDAL_TEXT: Record<number, string> = {
  1: 'text-gold',
  2: 'text-silver',
  3: 'text-bronze',
}

/** 'Juan S. · 18 WODs, Sara P. · +12 kg' ⇄ [{name, achievement}] */
export function parseMentions(raw: string): Array<{ name: string; achievement: string }> {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [name, achievement] = s.split('·')
      return { name: (name ?? '').trim(), achievement: (achievement ?? '').trim() }
    })
    .filter((m) => m.name.length > 0)
}

export function joinMentions(mentions: Array<{ name: string; achievement: string }>): string {
  return mentions.map((m) => (m.achievement ? `${m.name} · ${m.achievement}` : m.name)).join(', ')
}

function PhotoField({
  entry,
  onUploaded,
  labels,
}: {
  entry: PodiumEntry
  onUploaded: (url: string) => void
  labels: { upload: string; alt: string }
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
    <div className="flex flex-none items-center gap-2">
      <div className="bg-bone/10 relative h-12 w-12 overflow-hidden rounded-full">
        {entry.photoUrl && (
          <Image src={entry.photoUrl} alt={labels.alt} fill sizes="48px" className="object-cover" />
        )}
      </div>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="border-bone/25 font-condensed text-bone/60 hover:border-moss hover:text-moss cursor-pointer border px-2.5 py-1.5 text-xs font-semibold tracking-wider uppercase disabled:opacity-50"
      >
        {labels.upload}
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

export function PodiumForm({ initial }: { initial: Podium }) {
  const t = useTranslations('admin.podium')
  const tCommon = useTranslations('common')
  const [month, setMonth] = useState(initial.month)
  const [entries, setEntries] = useState<PodiumEntry[]>(
    [1, 2, 3].map(
      (place) =>
        initial.entries.find((e) => e.place === place) ?? {
          place: place as 1 | 2 | 3,
          name: '',
          achievement: '',
          photoUrl: null,
        }
    )
  )
  const [mentionsRaw, setMentionsRaw] = useState(joinMentions(initial.mentions))
  const [pending, startTransition] = useTransition()

  const patchEntry = (place: number, patch: Partial<PodiumEntry>) =>
    setEntries((prev) => prev.map((e) => (e.place === place ? { ...e, ...patch } : e)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await savePodium({ month, entries, mentions: parseMentions(mentionsRaw) })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="max-w-[220px]">
        <label htmlFor="podio-month" className={ADMIN_LABEL}>
          {t('monthLabel')}
        </label>
        <input
          id="podio-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder={t('monthPlaceholder')}
          className={ADMIN_INPUT}
        />
      </div>

      {entries.map((entry) => (
        <div
          key={entry.place}
          className={`bg-surface flex flex-wrap items-center gap-3 border border-l-4 px-4 py-3.5 ${MEDAL_BORDER[entry.place]}`}
        >
          <span
            className={`font-display w-[34px] flex-none text-center text-3xl ${MEDAL_TEXT[entry.place]}`}
          >
            {entry.place}
          </span>
          <PhotoField
            entry={entry}
            onUploaded={(url) => patchEntry(entry.place, { photoUrl: url })}
            labels={{ upload: t('uploadPhoto'), alt: entry.name || t('photoLabel') }}
          />
          <input
            value={entry.name}
            onChange={(e) => patchEntry(entry.place, { name: e.target.value })}
            placeholder={t('namePlaceholder')}
            aria-label={t('nameLabel')}
            className={`${ADMIN_INPUT} min-w-[130px] flex-none basis-[200px]`}
          />
          <input
            value={entry.achievement}
            onChange={(e) => patchEntry(entry.place, { achievement: e.target.value })}
            placeholder={t('achievementPlaceholder')}
            aria-label={t('achievementLabel')}
            className={`${ADMIN_INPUT} min-w-[150px] flex-1`}
          />
        </div>
      ))}

      <div className={ADMIN_CARD}>
        <label htmlFor="podio-mentions" className={ADMIN_LABEL}>
          {t('mentionsLabel')}
        </label>
        <p className="text-bone/40 mb-2 text-[13px]">{t('mentionsHelp')}</p>
        <textarea
          id="podio-mentions"
          value={mentionsRaw}
          onChange={(e) => setMentionsRaw(e.target.value)}
          rows={3}
          className={`${ADMIN_INPUT} resize-y leading-relaxed`}
        />
      </div>

      <div>
        <button type="submit" disabled={pending} className={ADMIN_SAVE}>
          {pending ? tCommon('saving') : tCommon('save')}
        </button>
      </div>
    </form>
  )
}
