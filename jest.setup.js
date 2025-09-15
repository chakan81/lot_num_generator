import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock console methods globally
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 15)
  }
})

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Mock isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  configurable: true,
})

// Mock document.execCommand for clipboard fallback
document.execCommand = jest.fn(() => true)

// Mock NextRequest and NextResponse globals for API tests
global.Request = Request
global.Response = Response
global.Headers = Headers

// Mock NextResponse for API route testing
const mockNextResponse = {
  json: (data, init) => {
    const response = new Response(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    })
    response.json = async () => data
    return response
  }
}

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}))