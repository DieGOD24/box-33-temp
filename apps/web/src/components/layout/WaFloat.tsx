import { getTranslations } from 'next-intl/server'
import { buildWaLink } from '@/lib/wa'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

export async function WaFloat({ whatsappNumber }: { whatsappNumber: string }) {
  const t = await getTranslations('whatsapp')

  return (
    <a
      href={buildWaLink(whatsappNumber, t('trial'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('ariaLabel')}
      className="animate-wa-pulse bg-wa fixed right-[22px] bottom-[22px] z-100 flex h-[60px] w-[60px] items-center justify-center rounded-full text-white transition-transform hover:scale-108 hover:text-white"
    >
      <WhatsAppIcon size={30} />
    </a>
  )
}
