'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DualSlider } from '@/components/ui/dual-slider'
import { settingsStorage, historyStorage, copyToClipboard, copyMultipleToClipboard, type SliderRange, type LotteryHistory } from '@/lib/storage'
import { Copy, History, RotateCcw, Trash2, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { HeaderBannerAd, SidebarAd, FooterBannerAd } from '@/components/ads'

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
  const [history, setHistory] = useState<LotteryHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Multi-select functionality states
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)

  // Load settings and history on mount
  useEffect(() => {
    const settings = settingsStorage.load()
    setRanges(settings.ranges)
    setShowHistory(settings.showHistory)
    setHistory(historyStorage.load())
  }, [])

  // Save settings when ranges change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      settingsStorage.save({
        ranges,
        showHistory,
        lastUpdated: new Date().toISOString()
      })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [ranges, showHistory])

  // Auto-exit select mode when history becomes empty
  useEffect(() => {
    if (isSelectMode && history.length === 0) {
      setIsSelectMode(false)
      setSelectedHistoryIds(new Set())
    }
  }, [history.length, isSelectMode])

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
    let generatedBy: 'server' | 'client' = 'server'
    let numbers: number[] = []

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
      numbers = data.numbers
    } catch (error) {
      console.error('Number generation error:', error)
      generatedBy = 'client'

      // Fallback to client-side generation on error
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
    } finally {
      setIsGenerating(false)
    }

    // Update state
    setGeneratedNumbers(numbers)

    // Save to history
    if (numbers.length > 0) {
      const saveSuccess = historyStorage.save({
        numbers,
        ranges: [...ranges],
        timestamp: new Date().toISOString(),
        generatedBy
      })

      if (saveSuccess) {
        setHistory(historyStorage.load())
      } else {
        toast.error('히스토리 저장에 실패했습니다.', {
          description: 'HTTPS 환경에서 더 안정적으로 작동합니다.'
        })
      }
    }
  }, [ranges])

  const handleCopyNumbers = useCallback(async (numbers: number[]) => {
    const success = await copyToClipboard(numbers)
    if (success) {
      toast.success('번호가 복사되었습니다!', {
        description: numbers.join(', ')
      })
    } else {
      toast.error('복사에 실패했습니다.', {
        description: '다시 시도해주세요.'
      })
    }
  }, [])

  const resetSettings = useCallback(() => {
    const defaultSettings = settingsStorage.reset()
    setRanges(defaultSettings.ranges)
    setShowHistory(defaultSettings.showHistory)
  }, [])


  // Multi-select functionality handlers
  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev)
    setSelectedHistoryIds(new Set()) // Clear selections when toggling mode
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

  const toggleSelectAll = useCallback(() => {
    setSelectedHistoryIds(prev => {
      if (prev.size === history.length) {
        // If all are selected, deselect all
        return new Set()
      } else {
        // If not all are selected, select all
        return new Set(history.map(entry => entry.id))
      }
    })
  }, [history])

  const handleMultipleCopy = useCallback(async () => {
    const selectedHistories = history.filter(entry => selectedHistoryIds.has(entry.id))
    if (selectedHistories.length === 0) {
      toast.warning('복사할 기록을 선택해주세요.')
      return
    }

    const success = await copyMultipleToClipboard(selectedHistories)
    if (success) {
      toast.success(`${selectedHistories.length}개의 번호가 복사되었습니다!`, {
        description: '각 번호는 줄바꿈으로 구분됩니다.'
      })
    } else {
      toast.error('복사에 실패했습니다.', {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 relative lg:pr-80">
        {/* Sidebar Ads (Desktop only) */}
        <SidebarAd />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            로또 번호 생성기
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            6개의 로또 번호를 개별 범위 설정으로 생성해보세요
          </p>
        </div>

        {/* Header Banner Ad */}
        <HeaderBannerAd />

        {/* Generated Numbers Display */}
        <section className="mb-12" aria-labelledby="generated-numbers" suppressHydrationWarning>
          <h2 id="generated-numbers" className="sr-only">생성된 로또 번호</h2>
          <div className="grid grid-cols-6 gap-2 sm:gap-4 max-w-3xl mx-auto">
            {Array.from({ length: 6 }, (_, index) => (
              <Card key={index} className="bg-card border-border aspect-square relative overflow-hidden">
                <CardContent className="absolute inset-0 flex items-center justify-center p-0">
                  <div className="w-[70%] h-[70%] bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg">
                    {generatedNumbers[index] || '?'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Copy Button */}
          {generatedNumbers.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => handleCopyNumbers(generatedNumbers)}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                번호 복사
              </Button>
            </div>
          )}
        </section>

        {/* Range Controls */}
        <section className="mb-12" aria-labelledby="range-controls" suppressHydrationWarning>
          <h2 id="range-controls" className="text-2xl font-bold text-center mb-6">번호 범위 설정</h2>
          <div className="grid grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
            {ranges.map((range, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="px-2 py-3 sm:px-6 sm:py-6">
                  <div className="flex flex-col items-center">
                    {/* Max value display (mobile: top, desktop: side) */}
                    <div className="text-xs sm:hidden text-destructive font-medium mb-6">{range.max}</div>

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
                        className="mx-2 sm:mx-4"
                      />
                    </div>

                    {/* Min value display (mobile: bottom, desktop: side) */}
                    <div className="text-xs sm:hidden text-primary font-medium mt-6">{range.min}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Color Legend - Hidden on mobile since values are shown directly */}
        <div className="hidden sm:flex justify-center gap-8 mb-12">
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
        <section className="text-center mb-12" aria-labelledby="usage-instructions">
          <h3 id="usage-instructions" className="text-lg font-semibold mb-4">사용 방법</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            각 번호의 세로 슬라이더에서 빨간색 핸들(최대값)과 초록색 핸들(최소값)을 드래그하여 범위를 설정한 후 &apos;번호 만들기&apos; 버튼을 눌러보세요
          </p>
        </section>

        {/* Settings & History Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            size="sm"
          >
            <History className="w-4 h-4 mr-2" />
            히스토리 {showHistory ? '숨기기' : '보기'}
          </Button>
          <Button
            onClick={resetSettings}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            범위 설정 초기화
          </Button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">생성 기록</CardTitle>
                  {history.length > 0 && (
                    <Button
                      onClick={toggleSelectMode}
                      variant="outline"
                      size="sm"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{isSelectMode ? '선택 취소' : '선택 모드'}</span>
                      <span className="sm:hidden">{isSelectMode ? '취소' : '선택'}</span>
                    </Button>
                  )}
                </div>

                {/* 데스크탑: 같은 줄 오른쪽, 모바일: 다음 줄 오른쪽 */}
                {isSelectMode && selectedHistoryIds.size > 0 && (
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleMultipleCopy}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">선택 복사 ({selectedHistoryIds.size})</span>
                      <span className="sm:hidden">복사 ({selectedHistoryIds.size})</span>
                    </Button>
                    <Button
                      onClick={handleMultipleDelete}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">선택 삭제 ({selectedHistoryIds.size})</span>
                      <span className="sm:hidden">삭제 ({selectedHistoryIds.size})</span>
                    </Button>
                  </div>
                )}
              </div>

              {isSelectMode && history.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    checked={selectedHistoryIds.size === history.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    전체 선택 ({selectedHistoryIds.size}/{history.length})
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  아직 생성된 번호가 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                    >
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedHistoryIds.has(entry.id)}
                          onCheckedChange={() => toggleHistorySelection(entry.id)}
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex gap-1 mb-1">
                          {entry.numbers.map((number, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center justify-center w-8 h-8 text-xs font-semibold bg-primary text-primary-foreground rounded-full"
                            >
                              {number}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString('ko-KR')}
                        </p>
                      </div>

                      {!isSelectMode && (
                        <Button
                          onClick={() => handleCopyNumbers(entry.numbers)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer Banner Ad */}
        <FooterBannerAd />
      </div>
    </main>
  )
}