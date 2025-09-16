import { settingsStorage, historyStorage, copyToClipboard, copyMultipleToClipboard } from '../storage'
import { AppSettings, LotteryHistory } from '../storage'

// Type definitions for mocked functions
interface MockLocalStorage {
  getItem: jest.MockedFunction<(key: string) => string | null>
  setItem: jest.MockedFunction<(key: string, value: string) => void>
  removeItem: jest.MockedFunction<(key: string) => void>
  clear: jest.MockedFunction<() => void>
}

interface MockClipboard {
  writeText: jest.MockedFunction<(text: string) => Promise<void>>
}

// Type assertions for localStorage mocks
const mockLocalStorage = localStorage as unknown as MockLocalStorage

// Type assertion for clipboard mock
const mockClipboard = navigator.clipboard as unknown as MockClipboard

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })


  describe('save', () => {
    it('should save settings to localStorage with timestamp', () => {
      const settings: AppSettings = {
        ranges: [{ min: 1, max: 10 }],
        showHistory: false,
        lastUpdated: '2023-01-01'
      }

      settingsStorage.save(settings)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lotto-user-settings',
        expect.stringContaining('"ranges":[{"min":1,"max":10}]')
      )
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lotto-user-settings',
        expect.stringContaining('"showHistory":false')
      )
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => {
        settingsStorage.save({
          ranges: [],
          showHistory: true,
          lastUpdated: '2023-01-01'
        })
      }).not.toThrow()

      expect(console.error).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error))
    })
  })

  describe('load', () => {
    it('should load settings from localStorage', () => {
      const mockSettings = {
        ranges: [
          { min: 5, max: 15 },    // 첫 번째만 다르게
          { min: 1, max: 45 },    // 나머지 5개는 기본값
          { min: 1, max: 45 },
          { min: 1, max: 45 },
          { min: 1, max: 45 },
          { min: 1, max: 45 }
        ],
        showHistory: true,
        lastUpdated: '2023-01-01'
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings))

      const result = settingsStorage.load()

      expect(localStorage.getItem).toHaveBeenCalledWith('lotto-user-settings')
      expect(result.ranges).toHaveLength(6)
      expect(result.ranges[0]).toEqual({ min: 5, max: 15 })
      expect(result.ranges[1]).toEqual({ min: 1, max: 45 })
      expect(result.showHistory).toBe(true)
    })

    it('should return default settings when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const result = settingsStorage.load()

      expect(result.ranges).toHaveLength(6)
      expect(result.ranges[0]).toEqual({ min: 1, max: 45 })
      expect(result.showHistory).toBe(true)
    })

    it('should return default settings when stored data is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const result = settingsStorage.load()

      expect(result.ranges).toHaveLength(6)
      expect(console.error).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error))
    })

    it('should return default settings when ranges array is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        ranges: [{ min: 1, max: 10 }], // Only 1 range instead of 6
        showHistory: true
      }))

      const result = settingsStorage.load()

      expect(result.ranges).toHaveLength(6)
      expect(result.ranges[0]).toEqual({ min: 1, max: 45 })
    })
  })

  describe('reset', () => {
    it('should clear localStorage and return default settings', () => {
      const result = settingsStorage.reset()

      expect(localStorage.removeItem).toHaveBeenCalledWith('lotto-user-settings')
      expect(result.ranges).toHaveLength(6)
      expect(result.showHistory).toBe(true)
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = settingsStorage.reset()

      expect(console.error).toHaveBeenCalledWith('Failed to reset settings:', expect.any(Error))
      expect(result.ranges).toHaveLength(6)
    })
  })
})

describe('historyStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('save', () => {
    it('should save new entry with generated ID', () => {
      const entry = {
        numbers: [1, 2, 3, 4, 5, 6],
        ranges: [{ min: 1, max: 45 }],
        timestamp: '2023-01-01',
        generatedBy: 'server' as const
      }

      historyStorage.save(entry)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lotto-generation-history',
        expect.stringContaining('"numbers":[1,2,3,4,5,6]')
      )
    })

    it('should maintain maximum 10 entries (FIFO)', () => {
      // Mock existing 10 entries
      const existingEntries = Array.from({ length: 10 }, (_, i) => ({
        id: `old-${i}`,
        numbers: [i, i+1, i+2, i+3, i+4, i+5],
        ranges: [{ min: 1, max: 45 }],
        timestamp: `2023-01-0${i+1}`,
        generatedBy: 'server' as const
      }))

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingEntries))

      const newEntry = {
        numbers: [7, 8, 9, 10, 11, 12],
        ranges: [{ min: 1, max: 45 }],
        timestamp: '2023-01-11',
        generatedBy: 'client' as const
      }

      historyStorage.save(newEntry)

      // Should save only 10 entries with the new one first
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(10)
      expect(savedData[0].numbers).toEqual([7, 8, 9, 10, 11, 12])
      expect(savedData[9].id).toBe('old-8') // Last old entry should be old-8 (old-9 removed)
    })
  })

  describe('load', () => {
    it('should load history from localStorage', () => {
      const mockHistory = [{
        id: 'test-1',
        numbers: [1, 2, 3, 4, 5, 6],
        ranges: [{ min: 1, max: 45 }],
        timestamp: '2023-01-01',
        generatedBy: 'server'
      }]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory))

      const result = historyStorage.load()

      expect(result).toEqual(mockHistory)
    })

    it('should return empty array when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const result = historyStorage.load()

      expect(result).toEqual([])
    })

    it('should return empty array when stored data is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const result = historyStorage.load()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('Failed to load history:', expect.any(Error))
    })
  })


  describe('remove', () => {
    it('should remove specific entry by ID', () => {
      const mockHistory = [
        { id: 'keep-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const },
        { id: 'remove-me', numbers: [7, 8, 9, 10, 11, 12], ranges: [], timestamp: '2023-01-02', generatedBy: 'client' as const },
        { id: 'keep-2', numbers: [13, 14, 15, 16, 17, 18], ranges: [], timestamp: '2023-01-03', generatedBy: 'server' as const }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory))

      historyStorage.remove('remove-me')

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(2)
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'remove-me')).toBeUndefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-1')).toBeDefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-2')).toBeDefined()
    })
  })

  describe('removeMultiple', () => {
    it('should remove multiple entries by IDs', () => {
      const mockHistory = [
        { id: 'keep-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const },
        { id: 'remove-1', numbers: [7, 8, 9, 10, 11, 12], ranges: [], timestamp: '2023-01-02', generatedBy: 'client' as const },
        { id: 'keep-2', numbers: [13, 14, 15, 16, 17, 18], ranges: [], timestamp: '2023-01-03', generatedBy: 'server' as const },
        { id: 'remove-2', numbers: [19, 20, 21, 22, 23, 24], ranges: [], timestamp: '2023-01-04', generatedBy: 'client' as const },
        { id: 'keep-3', numbers: [25, 26, 27, 28, 29, 30], ranges: [], timestamp: '2023-01-05', generatedBy: 'server' as const }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory))

      historyStorage.removeMultiple(['remove-1', 'remove-2'])

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(3)
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'remove-1')).toBeUndefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'remove-2')).toBeUndefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-1')).toBeDefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-2')).toBeDefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-3')).toBeDefined()
    })

    it('should handle empty ID array', () => {
      const mockHistory = [
        { id: 'keep-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory))

      historyStorage.removeMultiple([])

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].id).toBe('keep-1')
    })

    it('should handle non-existent IDs gracefully', () => {
      const mockHistory = [
        { id: 'keep-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const },
        { id: 'keep-2', numbers: [7, 8, 9, 10, 11, 12], ranges: [], timestamp: '2023-01-02', generatedBy: 'client' as const }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory))

      historyStorage.removeMultiple(['non-existent-1', 'non-existent-2'])

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(2)
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-1')).toBeDefined()
      expect(savedData.find((entry: LotteryHistory) => entry.id === 'keep-2')).toBeDefined()
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => {
        historyStorage.removeMultiple(['some-id'])
      }).not.toThrow()

      expect(console.error).toHaveBeenCalledWith('Failed to remove multiple history entries:', expect.any(Error))
    })
  })
})

describe('copyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should copy numbers using navigator.clipboard when available', async () => {
    const numbers = [1, 2, 3, 4, 5, 6]

    const result = await copyToClipboard(numbers)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1, 2, 3, 4, 5, 6')
    expect(result).toBe(true)
  })

  it('should use fallback when navigator.clipboard fails', async () => {
    // Temporarily override window.isSecureContext to force fallback
    const originalIsSecureContext = window.isSecureContext
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    })

    // Mock DOM methods for fallback
    const mockTextArea = {
      value: '',
      style: {},
      select: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document, 'execCommand').mockReturnValue(true)

    const numbers = [7, 8, 9, 10, 11, 12]

    const result = await copyToClipboard(numbers)

    // Should use fallback due to insecure context
    expect(document.createElement).toHaveBeenCalledWith('textarea')
    expect(mockTextArea.value).toBe('7, 8, 9, 10, 11, 12')
    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(result).toBe(true)

    // Restore original value
    Object.defineProperty(window, 'isSecureContext', {
      value: originalIsSecureContext,
      configurable: true,
    })
  })

  it('should return false when fallback method fails', async () => {
    // Temporarily override window.isSecureContext to force fallback
    const originalIsSecureContext = window.isSecureContext
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    })

    const mockTextArea = {
      value: '',
      style: {},
      select: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document, 'execCommand').mockReturnValue(false) // Make fallback fail

    const numbers = [1, 2, 3, 4, 5, 6]

    const result = await copyToClipboard(numbers)

    expect(result).toBe(false)
    expect(document.execCommand).toHaveBeenCalledWith('copy')

    // Restore original value
    Object.defineProperty(window, 'isSecureContext', {
      value: originalIsSecureContext,
      configurable: true,
    })
  })

  it('should return false and log error when exception occurs', async () => {
    // Mock clipboard.writeText to throw an error
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API error'))

    const numbers = [1, 2, 3, 4, 5, 6]

    const result = await copyToClipboard(numbers)

    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error))
  })
})

describe('copyMultipleToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset navigator.clipboard.writeText to success by default
    mockClipboard.writeText.mockResolvedValue()
  })

  it('should copy multiple lottery histories to clipboard with newlines', async () => {
    const histories = [
      { id: 'hist-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const },
      { id: 'hist-2', numbers: [7, 8, 9, 10, 11, 12], ranges: [], timestamp: '2023-01-02', generatedBy: 'client' as const },
      { id: 'hist-3', numbers: [13, 14, 15, 16, 17, 18], ranges: [], timestamp: '2023-01-03', generatedBy: 'server' as const }
    ]

    const result = await copyMultipleToClipboard(histories)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1, 2, 3, 4, 5, 6\n7, 8, 9, 10, 11, 12\n13, 14, 15, 16, 17, 18')
    expect(result).toBe(true)
  })

  it('should handle single history', async () => {
    const histories = [
      { id: 'hist-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const }
    ]

    const result = await copyMultipleToClipboard(histories)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1, 2, 3, 4, 5, 6')
    expect(result).toBe(true)
  })

  it('should handle empty history array', async () => {
    const histories: LotteryHistory[] = []

    const result = await copyMultipleToClipboard(histories)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('')
    expect(result).toBe(true)
  })

  it('should use fallback when navigator.clipboard fails', async () => {
    // Temporarily override window.isSecureContext to force fallback
    const originalIsSecureContext = window.isSecureContext
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    })

    const mockTextArea = {
      value: '',
      style: {},
      select: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockTextArea as unknown as HTMLTextAreaElement)
    jest.spyOn(document, 'execCommand').mockReturnValue(true)

    const histories = [
      { id: 'hist-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const },
      { id: 'hist-2', numbers: [7, 8, 9, 10, 11, 12], ranges: [], timestamp: '2023-01-02', generatedBy: 'client' as const }
    ]

    const result = await copyMultipleToClipboard(histories)

    expect(document.createElement).toHaveBeenCalledWith('textarea')
    expect(mockTextArea.value).toBe('1, 2, 3, 4, 5, 6\n7, 8, 9, 10, 11, 12')
    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(result).toBe(true)

    // Restore original value
    Object.defineProperty(window, 'isSecureContext', {
      value: originalIsSecureContext,
      configurable: true,
    })
  })

  it('should return false when clipboard operation fails', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'))

    const histories = [
      { id: 'hist-1', numbers: [1, 2, 3, 4, 5, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const }
    ]

    const result = await copyMultipleToClipboard(histories)

    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Failed to copy multiple histories to clipboard:', expect.any(Error))
  })

  it('should format numbers consistently with single copy', async () => {
    const histories = [
      { id: 'hist-1', numbers: [1, 23, 45, 12, 34, 6], ranges: [], timestamp: '2023-01-01', generatedBy: 'server' as const },
      { id: 'hist-2', numbers: [7, 8, 9, 10, 11, 12], ranges: [], timestamp: '2023-01-02', generatedBy: 'client' as const }
    ]

    const result = await copyMultipleToClipboard(histories)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1, 23, 45, 12, 34, 6\n7, 8, 9, 10, 11, 12')
    expect(result).toBe(true)
  })
})