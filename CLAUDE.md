# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a lottery number generator web service built with Next.js and Tailwind CSS. The application allows users to generate 6 random lottery numbers with individually configurable min/max ranges for each number via sliders. The project includes Google AdSense integration for monetization.

## Technology Stack
- **Frontend**: Next.js (React) + Tailwind CSS + shadcn/ui
- **UI Components**: shadcn/ui component library (use shadcn MCP)
- **Deployment**: Netlify or Vercel (to be decided)
- **Monetization**: Google AdSense integration

## Development Commands
Note: This project hasn't been initialized yet. Once Next.js is set up, typical commands will be:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking (if using TypeScript)

## Architecture & Key Features

### Core Functionality
- 6 independent min/max range sliders (default: 1-45 for Korean lottery)
- Real-time value display and validation
- Random number generation within specified ranges
- Duplicate number handling options
- Animated result display with lottery ball styling

### Additional Features
- Local storage for saving user settings
- History tracking (last 10 generations)
- Copy to clipboard functionality
- Mobile-first responsive design

### Component Structure (Planned)
**Reference Layout**: `design_source/lotto_design_mockup.svg` (기본 레이아웃 참조용)
*Note: 실제 구현 시 모던한 디자인으로 업그레이드*

**핵심 레이아웃 구조**:
1. **Header Area**: 로고 및 타이틀 "로또 번호 생성기"
2. **Number Display Section**: 6개 네모칸으로 생성된 번호 표시 (상단)
3. **Range Control Section**: 6개 세로 슬라이더로 각 번호별 범위 설정
   - 빨간 핸들: 최대값 조정 (상단)
   - 녹색 핸들: 최소값 조정 (하단)
   - 실시간 값 표시
4. **Control Legend**: 최대값/최소값 색상 범례
5. **Generate Button**: "번호 만들기" 액션 버튼
6. **Instructions**: 사용법 안내 텍스트

**구현 컴포넌트**:
- Slider components (shadcn/ui Slider 기반 커스터마이징)
- Number display components with animations
- History management components (추후)
- AdSense integration components (추후)

## Agent Specialization
This project uses specialized agents for different development phases:
- **backend-code-developer**: Project setup, API routes, AdSense integration
- **web-design-specialist**: Design planning, SEO, layout architecture
- **frontend-code-writer**: React components, shadcn/ui integration, UI interactions
- **qa-engineer**: Testing, bug detection, quality assurance
- **code-reviewer**: Code quality, performance optimization, security

## AdSense Integration Strategy
- Header banner (728x90 desktop, 320x50 mobile)
- Sidebar panel (300x250/300x600, desktop only)
- Footer banner (728x90 desktop, 320x50 mobile)

## Development Phases
1. **Phase 1**: Next.js setup and project structure
2. **Phase 2**: UI/UX implementation with responsive design
3. **Phase 3**: Core lottery generation logic and API
4. **Phase 4**: Local storage and history features
5. **Phase 5**: AdSense integration and SEO optimization
6. **Phase 6**: Testing and code review

Refer to `task.md` for detailed phase breakdowns and task assignments.

## Design Guidelines
- Use shadcn/ui components exclusively for all UI elements
- Leverage the shadcn MCP tool to access component code and examples
- Prioritize the green color scheme defined in the CSS variables (primary colors)
- Use the custom fonts: DM Sans (sans-serif), Lora (serif), IBM Plex Mono (monospace)
- Follow the defined shadow and radius variables for consistent spacing and depth

### Layout Reference
- **Basic Layout**: `design_source/lotto_design_mockup.svg` provides the fundamental structure
- **Design Philosophy**: Transform basic layout into modern, polished UI
- **Mobile-First**: Ensure responsive design adapts the vertical slider layout for mobile
- **Accessibility**: Maintain clear visual hierarchy and touch-friendly controls
