'use client'

import { AdSenseAd } from './AdSenseAd'

export function SidebarAd() {
  return (
    <aside className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-10">
      <div className="space-y-4">
        <AdSenseAd
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_1 || '1234567891'}
          adFormat="rectangle"
          className="w-[300px]"
          style={{
            minHeight: '250px',
            height: '250px',
          }}
        />

        {/* Optional second sidebar ad */}
        <AdSenseAd
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_2 || '1234567892'}
          adFormat="rectangle"
          className="w-[300px]"
          style={{
            minHeight: '600px',
            height: '600px',
          }}
        />
      </div>
    </aside>
  )
}