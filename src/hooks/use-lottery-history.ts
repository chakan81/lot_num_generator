'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { historyStorage, copyToClipboard, copyMultipleToClipboard } from '@/lib/storage'
import type { LotteryHistory } from '@/types/lottery'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/lottery'

/**
 * Custom hook for managing lottery generation history
 *
 * Provides functionality to store, retrieve, and manage lottery number generation history.
 * Includes multi-select capabilities for bulk operations like copy and delete.
 *
 * @returns Object containing:
 * - `history`: Array of historical lottery generations
 * - `selectedHistoryIds`: Set of currently selected history entry IDs
 * - `isSelectMode`: Boolean indicating if multi-select mode is active
 * - `addHistoryEntry`: Function to add a new history entry
 * - `toggleSelectMode`: Function to toggle multi-select mode
 * - `toggleHistorySelection`: Function to toggle selection of a specific entry
 * - `toggleSelectAll`: Function to select/deselect all entries
 * - `handleCopyNumbers`: Function to copy numbers to clipboard
 * - `handleMultipleCopy`: Function to copy multiple entries to clipboard
 * - `handleMultipleDelete`: Function to delete multiple entries
 * - `removeHistoryEntry`: Function to remove a single entry
 * - `clearAllHistory`: Function to clear all history
 *
 * @example
 * ```tsx
 * const { history, addHistoryEntry, handleCopyNumbers } = useLotteryHistory()
 *
 * // Add new generation to history
 * addHistoryEntry({
 *   numbers: [1, 2, 3, 4, 5, 6],
 *   ranges: ranges,
 *   timestamp: new Date().toISOString(),
 *   generatedBy: 'client'
 * })
 *
 * // Copy numbers to clipboard
 * handleCopyNumbers([1, 2, 3, 4, 5, 6])
 * ```
 */
export function useLotteryHistory() {
  const [history, setHistory] = useState<LotteryHistory[]>([])
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)

  // Load history on mount
  useEffect(() => {
    setHistory(historyStorage.load())
  }, [])

  // Auto-exit select mode when history becomes empty
  useEffect(() => {
    if (isSelectMode && history.length === 0) {
      setIsSelectMode(false)
      setSelectedHistoryIds(new Set())
    }
  }, [history.length, isSelectMode])

  const addHistoryEntry = useCallback((entry: Omit<LotteryHistory, 'id'>) => {
    const success = historyStorage.save(entry)
    if (success) {
      setHistory(historyStorage.load())
    }
    return success
  }, [])

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => {
      if (prev) {
        // Exiting select mode - clear selections
        setSelectedHistoryIds(new Set())
      }
      return !prev
    })
  }, [])

  const toggleHistorySelection = useCallback((id: string) => {
    setSelectedHistoryIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedHistoryIds(new Set(history.map(entry => entry.id)))
    } else {
      setSelectedHistoryIds(new Set())
    }
  }, [history])

  const handleCopyNumbers = useCallback(async (numbers: number[]) => {
    const success = await copyToClipboard(numbers)
    if (success) {
      toast.success(TOAST_MESSAGES.COPY_SUCCESS)
    } else {
      toast.error(TOAST_MESSAGES.COPY_ERROR)
    }
  }, [])

  const handleMultipleCopy = useCallback(async () => {
    if (selectedHistoryIds.size === 0) {
      toast.warning('복사할 기록을 선택해주세요.')
      return
    }

    const selectedHistories = history.filter(entry => selectedHistoryIds.has(entry.id))
    const success = await copyMultipleToClipboard(selectedHistories)

    if (success) {
      toast.success(TOAST_MESSAGES.MULTIPLE_COPY_SUCCESS, {
        description: '각 번호는 줄바꿈으로 구분됩니다.'
      })
    } else {
      toast.error(TOAST_MESSAGES.COPY_ERROR, {
        description: '다시 시도해주세요.'
      })
    }
  }, [history, selectedHistoryIds])

  const handleMultipleDelete = useCallback(() => {
    if (selectedHistoryIds.size === 0) {
      toast.warning('삭제할 기록을 선택해주세요.')
      return
    }

    historyStorage.removeMultiple(Array.from(selectedHistoryIds))
    setHistory(prev => prev.filter(entry => !selectedHistoryIds.has(entry.id)))
    setSelectedHistoryIds(new Set())
    toast.success(`${selectedHistoryIds.size}개의 기록이 삭제되었습니다.`)
  }, [selectedHistoryIds])

  const removeHistoryEntry = useCallback((id: string) => {
    historyStorage.remove(id)
    setHistory(prev => prev.filter(entry => entry.id !== id))
  }, [])

  const clearAllHistory = useCallback(() => {
    setHistory([])
    setSelectedHistoryIds(new Set())
    setIsSelectMode(false)
    // Clear from storage as well
    history.forEach(entry => historyStorage.remove(entry.id))
    toast.success(TOAST_MESSAGES.HISTORY_CLEARED)
  }, [history])

  // Memoize the return object to prevent unnecessary re-renders
  const historyState = useMemo(() => ({
    history,
    selectedHistoryIds,
    isSelectMode,
    addHistoryEntry,
    toggleSelectMode,
    toggleHistorySelection,
    toggleSelectAll,
    handleCopyNumbers,
    handleMultipleCopy,
    handleMultipleDelete,
    removeHistoryEntry,
    clearAllHistory
  }), [
    history,
    selectedHistoryIds,
    isSelectMode,
    addHistoryEntry,
    toggleSelectMode,
    toggleHistorySelection,
    toggleSelectAll,
    handleCopyNumbers,
    handleMultipleCopy,
    handleMultipleDelete,
    removeHistoryEntry,
    clearAllHistory
  ])

  return historyState
}