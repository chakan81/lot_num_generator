interface SliderRange {
  min: number
  max: number
}

interface AppSettings {
  ranges: SliderRange[]
  showHistory: boolean
  lastUpdated: string
}

interface LotteryHistory {
  id: string
  numbers: number[]
  ranges: SliderRange[]
  timestamp: string
  generatedBy: 'server' | 'client'
}

const STORAGE_KEYS = {
  SETTINGS: 'lotto-user-settings',
  HISTORY: 'lotto-generation-history'
} as const

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  ranges: [
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
  ],
  showHistory: true,
  lastUpdated: new Date().toISOString()
}

// Settings management
export const settingsStorage = {
  save: (settings: AppSettings): void => {
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  load: (): AppSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate structure
        if (parsed.ranges && Array.isArray(parsed.ranges) && parsed.ranges.length === 6) {
          return { ...DEFAULT_SETTINGS, ...parsed }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return DEFAULT_SETTINGS
  },

  reset: (): AppSettings => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
    return DEFAULT_SETTINGS
  }
}

// Generate UUID with fallback for environments without crypto.randomUUID()
const generateUUID = (): string => {
  // Try native crypto.randomUUID() first (preferred)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch (error) {
      console.warn('crypto.randomUUID() failed, falling back to alternative method:', error)
    }
  }

  // Fallback: Generate UUID v4 manually using crypto.getRandomValues()
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    try {
      const bytes = crypto.getRandomValues(new Uint8Array(16))
      bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant bits

      const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
    } catch (error) {
      console.warn('crypto.getRandomValues() failed, falling back to Math.random():', error)
    }
  }

  // Last resort fallback: Use Math.random() (less secure but works everywhere)
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomPart}-${randomPart2}-${Date.now()}`
}

// History management
export const historyStorage = {
  save: (entry: Omit<LotteryHistory, 'id'>): boolean => {
    try {
      const history = historyStorage.load()
      const newEntry: LotteryHistory = {
        ...entry,
        id: generateUUID()
      }

      // Add to beginning and keep only last 10
      const updatedHistory = [newEntry, ...history].slice(0, 10)
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory))
      return true
    } catch (error) {
      console.error('Failed to save history:', error)
      return false
    }
  },

  load: (): LotteryHistory[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
    return []
  },


  remove: (id: string): void => {
    try {
      const history = historyStorage.load()
      const filtered = history.filter(entry => entry.id !== id)
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to remove history entry:', error)
    }
  },

  removeMultiple: (ids: string[]): void => {
    try {
      const history = historyStorage.load()
      const filtered = history.filter(entry => !ids.includes(entry.id))
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to remove multiple history entries:', error)
    }
  }
}

// Clipboard utility
export const copyToClipboard = async (numbers: number[]): Promise<boolean> => {
  try {
    const text = numbers.join(', ')

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for non-HTTPS or older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

// Copy multiple lottery histories to clipboard
export const copyMultipleToClipboard = async (histories: LotteryHistory[]): Promise<boolean> => {
  try {
    const text = histories
      .map(history => history.numbers.join(', '))
      .join('\n')

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for non-HTTPS or older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy multiple histories to clipboard:', error)
    return false
  }
}

export type { SliderRange, AppSettings, LotteryHistory }