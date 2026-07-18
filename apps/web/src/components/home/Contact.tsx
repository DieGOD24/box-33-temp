import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { SiteSettings } from '@box33/types'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { buildWaLink, formatPhoneLabel } from '@/lib/wa'
import { Reveal } from './Reveal'

export async function Contact({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations('contact')
  const tw = await getTranslations('whatsapp')
  const igUrl = `https://instagram.com/${settings.instagramHandle}`

  return (
    <section
      id="contacto"
      className="border-bone/[.08] bg-carbon-deep border-t px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]"
    >
      <Reveal className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(28px,5vw,64px)]">
        <div>
          <p className="font-condensed text-moss mb-2.5 text-base font-semibold tracking-[6px] uppercase">
            {t('kicker')}
          </p>
          <h2 className="font-display mb-[18px] text-[clamp(36px,5vw,60px)] tracking-wide uppercase">
            {t.rich('title', { br: () => <br /> })}
          </h2>
          <p className="text-bone/75 mb-[30px] max-w-[440px] text-[17px] leading-relaxed">
            {t('description')}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href={buildWaLink(settings.whatsappNumber, tw('trial'))}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-wa font-condensed inline-flex items-center gap-2.5 px-[30px] py-4 text-[19px] font-bold tracking-[2.5px] text-[#111210] uppercase shadow-[4px_4px_0_#0c0d09] transition-colors hover:bg-[#3ce07a] hover:text-[#111210]"
            >
              <WhatsAppIcon size={20} />
              {formatPhoneLabel(settings.whatsappNumber)}
            </a>
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-bone/35 font-condensed text-bone hover:border-moss hover:text-moss inline-flex items-center gap-[9px] border px-[30px] py-4 text-[19px] font-semibold tracking-[2px] uppercase transition-colors"
            >
              @{settings.instagramHandle}
            </a>
          </div>
        </div>
        <div className="relative w-[min(460px,100%)] -rotate-[1.2deg] justify-self-center">
          <div className="absolute -top-3 left-[34px] z-[2] h-[26px] w-[100px] -rotate-[5deg] bg-[rgba(214,205,180,.75)] shadow-[0_2px_5px_rgba(0,0,0,.35)]" />
          <div className="bg-paper p-[14px_14px_46px] shadow-[0_18px_40px_rgba(0,0,0,.5)]">
            <div className="relative aspect-[4/3] w-full bg-[#dddbd0]">
              <Image
                src="/images/community/community-05.jpg"
                alt={t('photoAlt')}
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                className="object-cover"
              />
            </div>
            <p className="font-marker mt-3 text-center text-[17px] text-[#4a4b42]">
              {t('photoCaption')}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
