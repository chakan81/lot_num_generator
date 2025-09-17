'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { settingsStorage } from '@/lib/storage'
import type { SliderRange, AppSettings } from '@/types/lottery'
import { DEFAULT_SETTINGS, ANIMATION_DURATIONS } from '@/constants/lottery'
import { useDebounce } from './use-debounce'

/**
 * Custom hook for managing lottery game settings
 *
 * Manages the lottery number ranges and history display preferences.
 * Automatically saves settings to localStorage with debouncing.
 *
 * @returns Object containing:
 * - `ranges`: Array of min/max ranges for each lottery number
 * - `showHistory`: Boolean indicating if history panel should be visible
 * - `updateRange`: Function to update a specific range
 * - `resetSettings`: Function to reset all settings to defaults
 * - `toggleHistoryDisplay`: Function to toggle history visibility
 * - `setShowHistory`: Direct setter for history visibility
 *
 * @example
 * ```tsx
 * const { ranges, updateRange, resetSettings } = useLotterySettings()
 *
 * // Update first number's minimum value to 10
 * updateRange(0, 'min', 10)
 *
 * // Reset all settings to defaults
 * resetSettings()
 * ```
 */
export function useLotterySettings() {
  const [ranges, setRanges] = useState<SliderRange[]>(DEFAULT_SETTINGS.ranges)
  const [showHistory, setShowHistory] = useState<boolean>(DEFAULT_SETTINGS.showHistory)

  // Load settings on mount
  useEffect(() => {
    const settings = settingsStorage.load()
    setRanges(settings.ranges)
    setShowHistory(settings.showHistory)
  }, [])

  // Save settings when they change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const settings: AppSettings = {
        ranges,
        showHistory,
        lastUpdated: new Date().toISOString()
      }
      settingsStorage.save(settings)
    }, ANIMATION_DURATIONS.SLIDER_DEBOUNCE)

    return () => clearTimeout(timeoutId)
  }, [ranges, showHistory])

  // Debounced range update for smoother UI performance
  const updateRangeImmediate = useCallback((index: number, field: 'min' | 'max', value: number) => {
    setRanges(prev => {
      const newRanges = [...prev]
      const currentRange = newRanges[index]

      if (field === 'min') {
        newRanges[index] = { ...currentRange, min: Math.min(value, currentRange.max) }
      } else {
        newRanges[index] = { ...currentRange, max: Math.max(value, currentRange.min) }
      }

      return newRanges
    })
  }, [])

  // Apply debouncing for smoother slider interaction
  const updateRange = useDebounce(updateRangeImmediate, 50)

  const resetSettings = useCallback(() => {
    setRanges(DEFAULT_SETTINGS.ranges)
    setShowHistory(DEFAULT_SETTINGS.showHistory)
    settingsStorage.reset()
  }, [])

  const toggleHistoryDisplay = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  const settingsState = useMemo(() => ({
    ranges,
    showHistory,
    updateRange,
    resetSettings,
    toggleHistoryDisplay,
    setShowHistory
  }), [ranges, showHistory, updateRange, resetSettings, toggleHistoryDisplay])

  return settingsState
}