import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { PreRegisterForm } from './PreRegisterForm'

export async function Hero() {
  const t = await getTranslations('hero')

  return (
    <section
      id="inicio"
      className="relative flex min-h-[88vh] items-center overflow-hidden bg-[#26271f]"
    >
      {/* Split-diagonal stage from the logo's own geometry */}
      <div
        className="bg-steel absolute inset-0"
        style={{ clipPath: 'polygon(0 0,100% 0,100% 26%,0 78%)' }}
      />
      <div
        className="bg-olive-deep absolute inset-0"
        style={{ clipPath: 'polygon(0 78%,100% 26%,100% 100%,0 100%)' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(105deg,rgba(255,255,255,.022) 0 1px,transparent 1px 7px),repeating-linear-gradient(15deg,rgba(0,0,0,.06) 0 2px,transparent 2px 9px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(120% 90% at 50% 40%,transparent 40%,rgba(10,11,7,.55) 100%)',
        }}
      />
      <svg
        width="380"
        height="600"
        viewBox="0 0 14 22"
        fill="rgba(255,255,255,.045)"
        aria-hidden="true"
        className="pointer-events-none absolute -right-[70px] -bottom-[120px] rotate-[10deg]"
      >
        <path d="M8.8 0 0 12.6h4.4L3.2 22 14 8.4H8.6L11.4 0Z" />
      </svg>

      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-[clamp(30px,5vw,70px)] px-[clamp(20px,5vw,64px)] py-[clamp(56px,7vw,100px)]">
        <div>
          <div className="animate-float-y bg-gold font-condensed inline-block px-[18px] py-[7px] text-[15px] font-bold tracking-[3px] text-[#171712] uppercase shadow-[0_3px_10px_rgba(0,0,0,.4)]">
            {t('badge')}
          </div>
          <div className="relative mt-[26px]">
            <Image
              src="/images/logo-box33.png"
              alt={t('logoAlt')}
              width={540}
              height={324}
              priority
              className="animate-bolt-glow block w-[min(540px,94%)] drop-shadow-[0_14px_34px_rgba(0,0,0,.55)]"
            />
          </div>
          <div className="border-bone/45 font-condensed text-bone/80 mt-[26px] inline-block -rotate-[.5deg] border-2 px-4 py-2 text-[15px] font-semibold tracking-[5px] uppercase">
            {t('motto')}
          </div>
        </div>
        <PreRegisterForm />
      </div>

      {/* Chevron band */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 opacity-90">
        <svg width="100%" height="30" className="block" aria-hidden="true">
          <defs>
            <pattern id="chevband" width="36" height="30" patternUnits="userSpaceOnUse">
              <path d="M3 3 L17 15 L3 27 H13 L27 15 L13 3 Z" fill="rgba(20,21,16,.6)" />
            </pattern>
          </defs>
          <rect width="100%" height="30" fill="url(#chevband)" />
        </svg>
      </div>
    </section>
  )
}
