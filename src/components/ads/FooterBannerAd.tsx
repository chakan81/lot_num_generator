'use client'

import { AdSenseAd } from './AdSenseAd'

export function FooterBannerAd() {
  return (
    <footer className="w-full flex justify-center mt-12 py-8 border-t border-border">
      <AdSenseAd
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_FOOTER_BANNER_SLOT || '1234567893'}
        adFormat="horizontal"
        className="w-full max-w-[728px]"
        style={{
          minHeight: '90px',
          height: '90px',
        }}
      />
    </footer>
  )
}