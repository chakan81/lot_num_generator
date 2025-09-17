import type { AppSettings, SliderRange } from '@/types/lottery'

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  SETTINGS: 'lotto-user-settings',
  HISTORY: 'lotto-generation-history'
} as const

/**
 * Default lottery configuration (Korean lottery style)
 */
export const DEFAULT_LOTTERY_RANGE = { min: 1, max: 45 } as const

/**
 * Number of lottery balls to generate
 */
export const LOTTERY_NUMBERS_COUNT = 6 as const

/**
 * Default ranges for all 6 numbers
 */
export const DEFAULT_RANGES: SliderRange[] = Array(LOTTERY_NUMBERS_COUNT).fill(DEFAULT_LOTTERY_RANGE)

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  ranges: DEFAULT_RANGES,
  showHistory: false,
  lastUpdated: new Date().toISOString()
}

/**
 * Maximum history entries to keep
 */
export const MAX_HISTORY_ENTRIES = 50 as const

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  GENERATE: 2000,
  TOAST: 3000,
  SLIDER_DEBOUNCE: 500
} as const

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  GENERATE: '/api/generate'
} as const

/**
 * UI Constants
 */
export const UI_CONSTANTS = {
  SLIDER_MIN: DEFAULT_LOTTERY_RANGE.min,
  SLIDER_MAX: DEFAULT_LOTTERY_RANGE.max,
  HISTORY_VISIBLE_COUNT: 10
} as const

/**
 * Toast messages
 */
export const TOAST_MESSAGES = {
  COPY_SUCCESS: '번호가 클립보드에 복사되었습니다!',
  COPY_ERROR: '복사 중 오류가 발생했습니다.',
  GENERATION_ERROR: '번호 생성 중 오류가 발생했습니다.',
  SETTINGS_SAVED: '설정이 저장되었습니다.',
  HISTORY_CLEARED: '히스토리가 삭제되었습니다.',
  MULTIPLE_COPY_SUCCESS: '선택된 번호들이 클립보드에 복사되었습니다!'
} as const