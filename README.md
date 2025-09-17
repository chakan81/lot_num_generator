# 🎲 로또 번호 생성기

개별 범위 설정이 가능한 지능형 로또 번호 생성 웹 서비스입니다.

🔗 **Live Site**: https://lot-num-generator.netlify.app

## ✨ 주요 기능

### 🎯 핵심 기능
- **개별 범위 설정**: 6개 번호 각각에 대해 독립적인 최소/최대값 설정
- **실시간 슬라이더**: 직관적인 세로형 듀얼 슬라이더로 범위 조정
- **스마트 생성**: 서버/클라이언트 이중 생성 시스템으로 안정성 확보
- **히스토리 관리**: 생성 기록 저장, 다중 선택, 일괄 복사/삭제
- **클립보드 통합**: 원클릭 번호 복사 기능

### 🎨 사용자 경험
- **모바일 퍼스트**: 반응형 디자인으로 모든 기기 최적화
- **접근성**: ARIA 속성과 스크린 리더 지원
- **성능 최적화**: React.memo, useCallback, 디바운싱으로 부드러운 UX
- **에러 처리**: 포괄적인 에러 바운더리와 사용자 친화적 오류 메시지

### 💰 수익화
- **Google AdSense**: 헤더, 사이드바, 푸터 광고 배치
- **SEO 최적화**: 검색엔진 최적화로 트래픽 유도

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks (Custom Hooks)
- **Icons**: Lucide React

### Development & Deployment
- **Build Tool**: Next.js 빌드 시스템
- **Deployment**: Netlify (자동 배포)
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Package Manager**: npm

## 🏗 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   └── api/generate/      # 번호 생성 API
├── components/            # React 컴포넌트
│   ├── lottery/          # 로또 관련 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── error-boundary.tsx # 에러 바운더리
├── hooks/                # 커스텀 훅
│   ├── use-lottery-settings.ts
│   ├── use-lottery-history.ts
│   ├── use-number-generation.ts
│   └── use-debounce.ts
├── lib/                  # 유틸리티 라이브러리
│   ├── storage.ts        # localStorage 관리
│   └── error-handler.ts  # 에러 처리
├── types/                # TypeScript 타입 정의
├── constants/            # 상수 정의
└── styles/              # 글로벌 스타일
```

## 🚀 개발 가이드

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 프로덕션 빌드
npm run build
```

### 개발 명령어

```bash
# 타입 체크와 린트를 한번에
npm run type-check && npm run lint

# 빌드 후 타입 체크
npm run build
```

## 📦 주요 컴포넌트

### Custom Hooks
- `useLotterySettings`: 설정 관리 (범위, 히스토리 표시)
- `useLotteryHistory`: 히스토리 관리 (CRUD, 다중 선택)
- `useNumberGeneration`: 번호 생성 (서버/클라이언트 폴백)
- `useDebounce`: 함수 디바운싱

### UI Components
- `NumberDisplay`: 생성된 번호 표시
- `SliderControls`: 범위 설정 슬라이더
- `GenerateButton`: 번호 생성 버튼
- `HistoryPanel`: 히스토리 관리 패널

## 🎨 디자인 시스템

- **색상**: Tailwind CSS 커스텀 팔레트
- **타이포그래피**: DM Sans, Lora, IBM Plex Mono
- **컴포넌트**: shadcn/ui 기반 일관된 디자인
- **반응형**: 모바일 퍼스트 접근법

## 🔧 설정 파일

- `tailwind.config.js`: Tailwind CSS 설정
- `tsconfig.json`: TypeScript 설정
- `next.config.js`: Next.js 설정
- `eslint.config.mjs`: ESLint 설정

## 📊 성능 최적화

- **React.memo**: 컴포넌트 메모이제이션
- **useCallback/useMemo**: 함수/값 메모이제이션
- **디바운싱**: 슬라이더 입력 최적화
- **에러 바운더리**: 안정적인 사용자 경험
- **번들 크기**: 최적화된 빌드 (메인 페이지 20.5KB)

## 🚀 배포

Netlify를 통한 자동 배포:
1. GitHub에 푸시
2. Netlify에서 자동 빌드
3. CDN을 통한 전세계 배포

## 📄 라이센스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다.

---

**Made with ❤️ using Next.js and TypeScript**