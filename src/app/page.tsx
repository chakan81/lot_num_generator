'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { History, RotateCcw } from 'lucide-react'
import { HeaderBannerAd, SidebarAd, FooterBannerAd } from '@/components/ads'
import { NumberDisplay } from '@/components/lottery/number-display'
import { SliderControls } from '@/components/lottery/slider-controls'
import { GenerateButton } from '@/components/lottery/generate-button'
import { HistoryPanel } from '@/components/lottery/history-panel'
import { ErrorBoundary } from '@/components/error-boundary'
import { useLotterySettings } from '@/hooks/use-lottery-settings'
import { useLotteryHistory } from '@/hooks/use-lottery-history'
import { useNumberGeneration } from '@/hooks/use-number-generation'

export default function Home() {
  // Custom hooks for managing different aspects of the app
  const {
    ranges,
    showHistory,
    updateRange,
    resetSettings,
    toggleHistoryDisplay
  } = useLotterySettings()

  const {
    history,
    selectedHistoryIds,
    isSelectMode,
    addHistoryEntry,
    toggleSelectMode,
    toggleHistorySelection,
    toggleSelectAll,
    handleCopyNumbers,
    handleMultipleCopy,
    handleMultipleDelete
  } = useLotteryHistory()

  const {
    generatedNumbers,
    isGenerating,
    generateNumbers
  } = useNumberGeneration()

  const handleGenerateNumbers = useCallback(async () => {
    const result = await generateNumbers(ranges)
    if (result) {
      // Add to history
      addHistoryEntry({
        numbers: result.numbers,
        ranges: [...ranges],
        timestamp: result.timestamp,
        generatedBy: result.generatedBy
      })
    }
  }, [generateNumbers, ranges, addHistoryEntry])

  return (
    <ErrorBoundary>
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
          <ErrorBoundary>
            <NumberDisplay
              numbers={generatedNumbers}
              isGenerating={isGenerating}
              onCopyNumbers={handleCopyNumbers}
            />
          </ErrorBoundary>

          {/* Range Controls */}
          <ErrorBoundary>
            <SliderControls
              ranges={ranges}
              onRangeUpdate={updateRange}
            />
          </ErrorBoundary>

          {/* Generate Button */}
          <ErrorBoundary>
            <GenerateButton
              onGenerate={handleGenerateNumbers}
              isGenerating={isGenerating}
            />
          </ErrorBoundary>

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
              onClick={toggleHistoryDisplay}
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
          <ErrorBoundary>
            <HistoryPanel
              history={history}
              showHistory={showHistory}
              isSelectMode={isSelectMode}
              selectedHistoryIds={selectedHistoryIds}
              onToggleSelectMode={toggleSelectMode}
              onToggleSelectAll={toggleSelectAll}
              onToggleHistorySelection={toggleHistorySelection}
              onCopyNumbers={handleCopyNumbers}
              onMultipleCopy={handleMultipleCopy}
              onMultipleDelete={handleMultipleDelete}
            />
          </ErrorBoundary>

          {/* Footer Banner Ad */}
          <FooterBannerAd />
        </div>
      </main>
    </ErrorBoundary>
  )
}