'use client'

import { useState, useCallback, useMemo } from 'react'
import type { SliderRange, GenerationMethod } from '@/types/lottery'
import { API_ENDPOINTS, ANIMATION_DURATIONS } from '@/constants/lottery'
import { ErrorHandler, GenerationError } from '@/lib/error-handler'

/**
 * Custom hook for lottery number generation
 *
 * Handles the generation of lottery numbers either server-side or client-side.
 * Provides loading states and error handling with graceful fallbacks.
 *
 * @returns Object containing:
 * - `generatedNumbers`: Array of currently generated numbers
 * - `isGenerating`: Boolean indicating if generation is in progress
 * - `generateNumbers`: Function to generate new numbers with given ranges
 * - `resetNumbers`: Function to clear generated numbers
 *
 * @example
 * ```tsx
 * const { generatedNumbers, isGenerating, generateNumbers } = useNumberGeneration()
 *
 * // Generate numbers with custom ranges
 * const result = await generateNumbers([
 *   { min: 1, max: 10 },
 *   { min: 11, max: 20 },
 *   // ... more ranges
 * ])
 *
 * if (result) {
 *   console.log('Generated:', result.numbers)
 *   console.log('Method:', result.generatedBy)
 * }
 * ```
 */
export function useNumberGeneration() {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateClientSideNumbers = useCallback((ranges: SliderRange[]): number[] => {
    const numbers: number[] = []

    for (const range of ranges) {
      const randomNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
      numbers.push(randomNumber)
    }

    return numbers
  }, [])

  const generateNumbers = useCallback(async (ranges: SliderRange[]) => {
    setIsGenerating(true)
    let generatedBy: GenerationMethod = 'server'
    let numbers: number[] = []

    try {
      // Try server-side generation first
      const response = await fetch(API_ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ranges }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new GenerationError(errorData.error || '서버에서 번호 생성에 실패했습니다.', 'server')
      }

      const data = await response.json()
      numbers = data.numbers
    } catch (error) {
      console.warn('Server-side generation failed, falling back to client-side:', error)

      try {
        // Fallback to client-side generation
        generatedBy = 'client'
        numbers = generateClientSideNumbers(ranges)
      } catch {
        throw new GenerationError('클라이언트에서도 번호 생성에 실패했습니다.', 'client')
      }
    }

    // Animate the generation process
    setTimeout(() => {
      setGeneratedNumbers(numbers)
      setIsGenerating(false)
    }, ANIMATION_DURATIONS.GENERATE)

    return {
      numbers,
      generatedBy,
      timestamp: new Date().toISOString()
    }
  }, [generateClientSideNumbers])

  const generateNumbersWithErrorHandling = useCallback(async (ranges: SliderRange[]) => {
    return ErrorHandler.handleAsync(
      () => generateNumbers(ranges),
      'Number generation'
    )
  }, [generateNumbers])

  const resetNumbers = useCallback(() => {
    setGeneratedNumbers([])
    setIsGenerating(false)
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  const generationState = useMemo(() => ({
    generatedNumbers,
    isGenerating,
    generateNumbers: generateNumbersWithErrorHandling,
    resetNumbers
  }), [generatedNumbers, isGenerating, generateNumbersWithErrorHandling, resetNumbers])

  return generationState
}