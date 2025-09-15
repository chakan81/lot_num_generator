import { POST, GET } from '../route'
import { NextRequest } from 'next/server'

// Mock console.error to avoid cluttering test output
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

// Mock NextRequest
const createMockRequest = (body: any) => {
  const mockRequest = {
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest

  return mockRequest
}

describe('/api/generate route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Math.random to make tests deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterAll(() => {
    consoleSpy.mockRestore()
    jest.restoreAllMocks()
  })

  describe('POST /api/generate', () => {
    it('should generate valid lottery numbers with correct ranges', async () => {
      const requestBody = {
        ranges: [
          { min: 1, max: 10 },
          { min: 11, max: 20 },
          { min: 21, max: 30 },
          { min: 31, max: 40 },
          { min: 1, max: 5 },
          { min: 40, max: 45 },
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.numbers).toHaveLength(6)
      expect(data.ranges).toEqual(requestBody.ranges)
      expect(data.timestamp).toBeDefined()

      // Check if numbers are within their respective ranges
      data.numbers.forEach((number: number, index: number) => {
        const range = requestBody.ranges[index]
        expect(number).toBeGreaterThanOrEqual(range.min)
        expect(number).toBeLessThanOrEqual(range.max)
      })
    })

    it('should handle duplicate numbers when ranges allow it', async () => {
      const requestBody = {
        ranges: [
          { min: 1, max: 2 }, // Small range to force potential duplicates
          { min: 1, max: 2 },
          { min: 1, max: 2 },
          { min: 1, max: 2 },
          { min: 1, max: 2 },
          { min: 1, max: 2 },
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.numbers).toHaveLength(6)

      // All numbers should be 1 or 2
      data.numbers.forEach((number: number) => {
        expect(number).toBeGreaterThanOrEqual(1)
        expect(number).toBeLessThanOrEqual(2)
      })
    })

    it('should return 400 for missing ranges', async () => {
      const request = createMockRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('6개의 범위가 필요합니다.')
    })

    it('should return 400 for invalid range count', async () => {
      const requestBody = {
        ranges: [
          { min: 1, max: 10 },
          { min: 11, max: 20 },
          // Missing 4 ranges
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('6개의 범위가 필요합니다.')
    })

    it('should return 400 for ranges with missing min/max values', async () => {
      const requestBody = {
        ranges: [
          { min: 1, max: 10 },
          { min: 11 }, // Missing max
          { max: 30 }, // Missing min
          { min: 31, max: 40 },
          { min: 1, max: 5 },
          { min: 40, max: 45 },
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('min과 max 값이 필요합니다.')
    })

    it('should return 400 for ranges outside 1-45', async () => {
      const requestBody = {
        ranges: [
          { min: 0, max: 10 }, // min < 1
          { min: 11, max: 20 },
          { min: 21, max: 30 },
          { min: 31, max: 40 },
          { min: 1, max: 5 },
          { min: 40, max: 46 }, // max > 45
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('1-45 사이여야 합니다.')
    })

    it('should return 400 when min > max', async () => {
      const requestBody = {
        ranges: [
          { min: 10, max: 5 }, // min > max
          { min: 11, max: 20 },
          { min: 21, max: 30 },
          { min: 31, max: 40 },
          { min: 1, max: 5 },
          { min: 40, max: 45 },
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('최소값이 최대값보다 클 수 없습니다.')
    })

    it('should return 500 for invalid JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('번호 생성 중 오류가 발생했습니다.')
      expect(console.error).toHaveBeenCalledWith('Number generation error:', expect.any(Error))
    })

    it('should generate numbers using optimized algorithm', async () => {
      // Restore real Math.random for this test to check randomness
      jest.restoreAllMocks()

      // Test with large total available numbers
      const requestBody = {
        ranges: [
          { min: 1, max: 45 },
          { min: 1, max: 45 },
          { min: 1, max: 45 },
          { min: 1, max: 45 },
          { min: 1, max: 45 },
          { min: 1, max: 45 },
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.numbers).toHaveLength(6)

      // Check that all numbers are within range
      data.numbers.forEach((number: number) => {
        expect(number).toBeGreaterThanOrEqual(1)
        expect(number).toBeLessThanOrEqual(45)
      })

      // Restore mock for other tests
      jest.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    it('should handle edge case with very small ranges', async () => {
      const requestBody = {
        ranges: [
          { min: 1, max: 1 }, // Only one possible value
          { min: 2, max: 2 }, // Only one possible value
          { min: 3, max: 3 }, // Only one possible value
          { min: 4, max: 4 }, // Only one possible value
          { min: 5, max: 5 }, // Only one possible value
          { min: 6, max: 6 }, // Only one possible value
        ]
      }

      const request = createMockRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.numbers).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('GET /api/generate', () => {
    it('should return 405 Method Not Allowed', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.message).toBe('POST 요청을 사용해주세요.')
    })
  })
})

describe('Number generation algorithm tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should handle scenario with insufficient total numbers for uniqueness', async () => {
    // Mock Math.random to return different values for variety
    let callCount = 0
    jest.spyOn(Math, 'random').mockImplementation(() => {
      callCount++
      return callCount * 0.1 % 1 // Different values each time
    })

    const requestBody = {
      ranges: [
        { min: 1, max: 2 }, // 2 numbers available
        { min: 1, max: 2 }, // 2 numbers available
        { min: 1, max: 2 }, // 2 numbers available
        { min: 3, max: 3 }, // 1 number available
        { min: 4, max: 4 }, // 1 number available
        { min: 5, max: 5 }, // 1 number available
      ]
      // Total: 8 available numbers, need 6 - should work with some duplicates allowed
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.numbers).toHaveLength(6)

    // Check ranges are respected
    expect([1, 2]).toContain(data.numbers[0])
    expect([1, 2]).toContain(data.numbers[1])
    expect([1, 2]).toContain(data.numbers[2])
    expect(data.numbers[3]).toBe(3)
    expect(data.numbers[4]).toBe(4)
    expect(data.numbers[5]).toBe(5)
  })
})