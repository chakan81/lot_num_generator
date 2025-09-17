/**
 * Core types for the lottery number generator application
 */

export interface SliderRange {
  min: number
  max: number
}

export interface AppSettings {
  ranges: SliderRange[]
  showHistory: boolean
  lastUpdated: string
}

export interface LotteryHistory {
  id: string
  numbers: number[]
  ranges: SliderRange[]
  timestamp: string
  generatedBy: 'server' | 'client'
}

export interface GenerationRequest {
  ranges: SliderRange[]
  allowDuplicates?: boolean
}

export interface GenerationResponse {
  numbers: number[]
  timestamp: string
  generatedBy: 'server' | 'client'
}

export interface DualSliderProps {
  min?: number
  max?: number
  minValue: number
  maxValue: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

export interface NumberDisplayProps {
  numbers: number[]
  isGenerating: boolean
}

export interface HistoryItemProps {
  history: LotteryHistory
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
  isSelectMode?: boolean
}

export type StorageKey = 'settings' | 'history'

export type GenerationMethod = 'server' | 'client'

export type ToastType = 'success' | 'error' | 'info'