'use client'

import { useEffect, useRef } from 'react'

interface AdSenseAdProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  adLayout?: string
  adLayoutKey?: string
  style?: React.CSSProperties
  className?: string
  fullWidthResponsive?: boolean
}

export function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  style,
  className,
  fullWidthResponsive = true,
}: AdSenseAdProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    // Show placeholder for development/testing
    return (
      <div
        ref={adRef}
        className={`bg-muted/30 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm ${className || ''}`}
        style={style}
      >
        <div className="text-center p-4">
          <div className="font-medium mb-1">AdSense 광고 영역</div>
          <div className="text-xs">슬롯: {adSlot}</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={adRef} className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}

// Declare global type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>
  }
}