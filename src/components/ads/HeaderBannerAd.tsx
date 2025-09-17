'use client'

import { AdSenseAd } from './AdSenseAd'

export function HeaderBannerAd() {
  return (
    <div className="w-full flex justify-center mb-8">
      <AdSenseAd
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_BANNER_SLOT || '1234567890'}
        adFormat="horizontal"
        className="w-full !h-[50px] md:!h-[90px] !max-w-[320px] md:!max-w-[728px]"
      />
    </div>
  )
}