import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: '로또 번호 생성기 - 개별 범위 설정으로 랜덤 번호 생성',
  description: '6개의 로또 번호를 각각 다른 범위로 설정하여 생성하는 고급 로또 번호 생성기. 설정 저장, 히스토리 관리, 복사 기능을 지원합니다.',
  keywords: ['로또', '로또번호', '번호생성기', '로또번호생성기', '랜덤번호', 'lotto', 'lottery', '복권'],
  authors: [{ name: 'Lottery Number Generator' }],
  creator: 'Lottery Number Generator',
  publisher: 'Lottery Number Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '로또 번호 생성기 - 개별 범위 설정으로 랜덤 번호 생성',
    description: '6개의 로또 번호를 각각 다른 범위로 설정하여 생성하는 고급 로또 번호 생성기. 설정 저장, 히스토리 관리, 복사 기능을 지원합니다.',
    url: '/',
    siteName: '로또 번호 생성기',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '로또 번호 생성기 - 개별 범위 설정',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 번호 생성기 - 개별 범위 설정',
    description: '6개의 로또 번호를 각각 다른 범위로 설정하여 생성하는 고급 로또 번호 생성기',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "로또 번호 생성기",
    "description": "6개의 로또 번호를 각각 다른 범위로 설정하여 생성하는 고급 로또 번호 생성기",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002',
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "featureList": [
      "개별 번호별 범위 설정",
      "랜덤 번호 생성",
      "생성 기록 저장 및 관리",
      "클립보드 복사 기능",
      "모바일 반응형 디자인"
    ],
    "inLanguage": "ko-KR",
    "creator": {
      "@type": "Organization",
      "name": "Lottery Number Generator"
    }
  }

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}