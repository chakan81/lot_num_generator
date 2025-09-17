'use client'

import { AdSenseAd } from './AdSenseAd'

export function HeaderBannerAd() {
  return (
    <div className="w-full flex justify-center mb-8">
      <div
        className="w-full max-w-[320px] md:max-w-[728px] overflow-hidden"
        style={{
          height: '50px',
          minHeight: '50px',
          maxHeight: '50px',
          position: 'relative',
          display: 'block'
        }}
      >
        <AdSenseAd
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_BANNER_SLOT || '1234567890'}
          adFormat="horizontal"
          className="w-full h-full"
        />
      </div>
    </div>
  )
}