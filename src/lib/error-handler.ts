import { toast } from 'sonner'
import { TOAST_MESSAGES, DEFAULT_LOTTERY_RANGE } from '@/constants/lottery'
import type { ToastType } from '@/types/lottery'

/**
 * Custom error classes
 */
export class LotteryError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'LotteryError'
  }
}

export class StorageError extends LotteryError {
  constructor(message: string, public operation: 'save' | 'load' | 'remove') {
    super(message, 'STORAGE_ERROR')
    this.name = 'StorageError'
  }
}

export class ValidationError extends LotteryError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class GenerationError extends LotteryError {
  constructor(message: string, public method?: 'server' | 'client') {
    super(message, 'GENERATION_ERROR')
    this.name = 'GenerationError'
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  private static logError(error: Error, context?: string): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    }
    console.error('Lottery App Error:', errorInfo)
  }

  private static showToast(message: string, type: ToastType = 'error'): void {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'info':
        toast.info(message)
        break
    }
  }

  public static handle(error: unknown, context?: string): void {
    let message: string = TOAST_MESSAGES.GENERATION_ERROR

    if (error instanceof ValidationError) {
      message = `검증 오류: ${error.message}`
    } else if (error instanceof StorageError) {
      message = `저장소 오류: ${error.message}`
    } else if (error instanceof GenerationError) {
      message = TOAST_MESSAGES.GENERATION_ERROR
    } else if (error instanceof Error) {
      this.logError(error, context)
      message = error.message
    }

    this.showToast(message, 'error')
  }

  public static async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await asyncFn()
    } catch (error) {
      this.handle(error, context)
      return null
    }
  }

  public static handleSync<T>(
    syncFn: () => T,
    context?: string
  ): T | null {
    try {
      return syncFn()
    } catch (error) {
      this.handle(error, context)
      return null
    }
  }
}

/**
 * Validation utilities
 */
export const validateRange = (min: number, max: number): void => {
  if (min < DEFAULT_LOTTERY_RANGE.min || min > DEFAULT_LOTTERY_RANGE.max) {
    throw new ValidationError(`최소값은 ${DEFAULT_LOTTERY_RANGE.min}-${DEFAULT_LOTTERY_RANGE.max} 사이여야 합니다`, 'min')
  }
  if (max < DEFAULT_LOTTERY_RANGE.min || max > DEFAULT_LOTTERY_RANGE.max) {
    throw new ValidationError(`최대값은 ${DEFAULT_LOTTERY_RANGE.min}-${DEFAULT_LOTTERY_RANGE.max} 사이여야 합니다`, 'max')
  }
  if (min >= max) {
    throw new ValidationError('최소값은 최대값보다 작아야 합니다', 'range')
  }
}

export const validateNumbers = (numbers: number[]): void => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new ValidationError('번호 배열이 올바르지 않습니다', 'numbers')
  }

  for (const num of numbers) {
    if (!Number.isInteger(num) || num < DEFAULT_LOTTERY_RANGE.min || num > DEFAULT_LOTTERY_RANGE.max) {
      throw new ValidationError(`번호 ${num}이(가) 유효하지 않습니다`, 'number')
    }
  }
}

/**
 * Safe JSON parsing
 */
export const safeJsonParse = <T>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.warn('JSON 파싱 실패:', error)
    return defaultValue
  }
}

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('localStorage.getItem 실패:', error)
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error('localStorage.setItem 실패:', error)
      return false
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('localStorage.removeItem 실패:', error)
      return false
    }
  }
}