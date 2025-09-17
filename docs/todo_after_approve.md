# AdSense 승인 후 해야 할 일

## 1. Netlify 환경변수 복원
- Netlify 대시보드에서 다음 환경변수 추가:
  ```
  NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6661615978497993
  ```
- 설정 후 재배포 자동 실행됨

## 2. 코드 정리 (선택사항)
승인 후 하드코딩된 AdSense 스크립트 제거:

### layout.tsx에서 제거할 부분:
```tsx
{/* AdSense for approval - will be replaced by env var after approval */}
{!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6661615978497993"
    crossOrigin="anonymous"
  />
)}
```

## 3. 동작 확인
- [ ] 실제 AdSense 광고가 표시되는지 확인
- [ ] 모바일에서 320x50 크기로 표시되는지 확인
- [ ] 데스크톱에서 728x90 크기로 표시되는지 확인
- [ ] 광고 클릭 시 정상 작동하는지 확인

## 4. 추가 광고 단위 생성 (선택사항)
AdSense 대시보드에서 추가 광고 단위를 생성하여:
- `NEXT_PUBLIC_ADSENSE_HEADER_BANNER_SLOT`
- `NEXT_PUBLIC_ADSENSE_FOOTER_BANNER_SLOT`
- `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT`

환경변수로 설정

## 현재 상태
- ✅ 하드코딩된 AdSense 스크립트 추가됨
- ✅ 환경변수 제거하면 플레이스홀더만 표시
- ✅ Google이 AdSense 코드 감지 가능
- ⏳ AdSense 승인 대기 중