'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DualSlider } from '@/components/ui/dual-slider'

interface SliderRange {
  min: number
  max: number
}

export default function Home() {
  const [ranges, setRanges] = useState<SliderRange[]>([
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
    { min: 1, max: 45 },
  ])

  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const updateRange = useCallback((index: number, field: 'min' | 'max', value: number) => {
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

  const generateNumbers = useCallback(async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ranges }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '번호 생성에 실패했습니다.')
      }

      const data = await response.json()
      setGeneratedNumbers(data.numbers)
    } catch (error) {
      console.error('Number generation error:', error)
      // Fallback to client-side generation on error
      const numbers: number[] = []
      const usedNumbers = new Set<number>()

      for (let i = 0; i < 6; i++) {
        const { min, max } = ranges[i]
        let number: number
        let attempts = 0

        do {
          number = Math.floor(Math.random() * (max - min + 1)) + min
          attempts++
          if (attempts > 100) break
        } while (usedNumbers.has(number))

        numbers.push(number)
        usedNumbers.add(number)
      }

      setGeneratedNumbers(numbers)
    } finally {
      setIsGenerating(false)
    }
  }, [ranges])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            로또 번호 생성기
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            6개의 로또 번호를 개별 범위 설정으로 생성해보세요
          </p>
        </div>

        {/* Generated Numbers Display */}
        <div className="mb-12">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
            {Array.from({ length: 6 }, (_, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="size-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                    {generatedNumbers[index] || '?'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Range Controls */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {ranges.map((range, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="px-6 py-6">
                  <div className="flex flex-col items-center">
                    {/* Vertical Dual Slider */}
                    <div className="flex justify-center w-full">
                      <DualSlider
                        min={1}
                        max={45}
                        minValue={range.min}
                        maxValue={range.max}
                        onMinChange={(value) => updateRange(index, 'min', value)}
                        onMaxChange={(value) => updateRange(index, 'max', value)}
                        orientation="vertical"
                        className="mx-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="flex items-center space-x-2">
            <div className="size-4 bg-destructive rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-muted-foreground">최대값</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="size-4 bg-primary rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-muted-foreground">최소값</span>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <Button
            onClick={generateNumbers}
            disabled={isGenerating}
            size="lg"
            className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>생성 중...</span>
              </div>
            ) : (
              '번호 만들기'
            )}
          </Button>
        </div>

        {/* Usage Instructions */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            각 번호의 세로 슬라이더에서 빨간색 핸들(최대값)과 초록색 핸들(최소값)을 드래그하여 범위를 설정한 후 '번호 만들기' 버튼을 눌러보세요
          </p>
        </div>
      </div>
    </main>
  )
}