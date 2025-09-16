'use client'

import { AdSenseAd } from './AdSenseAd'

export function HeaderBannerAd() {
  return (
    <div className="w-full flex justify-center mb-8">
      <AdSenseAd
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_BANNER_SLOT || '1234567890'}
        adFormat="horizontal"
        className="w-full max-w-[728px]"
        style={{
          minHeight: '90px',
          height: '90px',
        }}
      />
    </div>
  )
}