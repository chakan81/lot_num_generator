'use client'

import { useCallback, useRef } from 'react'

/**
 * Custom hook for debouncing function calls
 *
 * Delays the execution of a function until after the specified delay has passed
 * since the last time it was invoked. Useful for optimizing performance by
 * reducing the frequency of expensive operations.
 *
 * @template T - Function type to be debounced
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced version of the callback function
 *
 * @example
 * ```tsx
 * const handleSearch = useDebounce((query: string) => {
 *   performSearch(query)
 * }, 500)
 *
 * // Will only execute after 500ms of no new calls
 * handleSearch('user input')
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}