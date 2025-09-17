'use client'

import { AdSenseAd } from './AdSenseAd'

export function FooterBannerAd() {
  return (
    <footer className="w-full flex justify-center mt-12 py-8 border-t border-border">
      <AdSenseAd
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_FOOTER_BANNER_SLOT || '1234567893'}
        adFormat="horizontal"
        className="w-full !h-[50px] md:!h-[90px] !max-w-[320px] md:!max-w-[728px]"
      />
    </footer>
  )
}