import { NextRequest, NextResponse } from 'next/server'

interface SliderRange {
  min: number
  max: number
}

interface GenerateRequest {
  ranges: SliderRange[]
}

function generateOptimizedNumbers(ranges: SliderRange[]): number[] {
  const numbers: number[] = []
  const usedNumbers = new Set<number>()

  // Calculate total available numbers across all ranges
  const totalAvailable = ranges.reduce((sum, range) => {
    return sum + (range.max - range.min + 1)
  }, 0)

  // If we need more unique numbers than available, allow duplicates
  const allowDuplicates = totalAvailable < 6

  for (let i = 0; i < 6; i++) {
    const { min, max } = ranges[i]
    let number: number
    let attempts = 0
    const maxAttempts = allowDuplicates ? 10 : (max - min + 1) * 2

    do {
      number = Math.floor(Math.random() * (max - min + 1)) + min
      attempts++

      // Break if we've tried enough times or if duplicates are allowed
      if (attempts >= maxAttempts) {
        break
      }
    } while (!allowDuplicates && usedNumbers.has(number))

    numbers.push(number)
    if (!allowDuplicates) {
      usedNumbers.add(number)
    }
  }

  return numbers
}

function validateRanges(ranges: SliderRange[]): string | null {
  if (!Array.isArray(ranges) || ranges.length !== 6) {
    return '6개의 범위가 필요합니다.'
  }

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]

    if (!range || typeof range.min !== 'number' || typeof range.max !== 'number') {
      return `범위 ${i + 1}: min과 max 값이 필요합니다.`
    }

    if (range.min < 1 || range.max > 45) {
      return `범위 ${i + 1}: 값은 1-45 사이여야 합니다.`
    }

    if (range.min > range.max) {
      return `범위 ${i + 1}: 최소값이 최대값보다 클 수 없습니다.`
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    // Validate input
    const validationError = validateRanges(body.ranges)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Generate numbers
    const numbers = generateOptimizedNumbers(body.ranges)

    return NextResponse.json({
      numbers,
      timestamp: new Date().toISOString(),
      ranges: body.ranges
    })

  } catch (error) {
    console.error('Number generation error:', error)

    return NextResponse.json(
      { error: '번호 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'POST 요청을 사용해주세요.' },
    { status: 405 }
  )
}