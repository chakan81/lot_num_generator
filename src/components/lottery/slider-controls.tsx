'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DualSlider } from '@/components/ui/dual-slider'
import type { SliderRange } from '@/types/lottery'
import { LOTTERY_NUMBERS_COUNT, UI_CONSTANTS } from '@/constants/lottery'

interface SliderControlsProps {
  ranges: SliderRange[]
  onRangeUpdate: (index: number, field: 'min' | 'max', value: number) => void
}

export const SliderControls = memo(function SliderControls({ ranges, onRangeUpdate }: SliderControlsProps) {
  return (
    <section className="mb-12" aria-labelledby="range-controls" suppressHydrationWarning>
      <h2 id="range-controls" className="text-2xl font-bold text-center mb-6">
        번호 범위 설정
      </h2>

      {/* Sliders Grid */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
        {ranges.slice(0, LOTTERY_NUMBERS_COUNT).map((range, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="px-2 py-3 sm:px-6 sm:py-6">
              <div className="flex flex-col items-center">
                {/* Max value display (mobile: top, desktop: side) */}
                <div
                  className="text-xs sm:hidden text-destructive font-medium mb-6"
                  aria-label={`${index + 1}번째 번호 최대값: ${range.max}`}
                >
                  {range.max}
                </div>

                {/* Vertical Dual Slider */}
                <div className="flex justify-center w-full">
                  <div
                    role="group"
                    aria-labelledby={`slider-${index}-label`}
                    aria-describedby={`slider-${index}-description`}
                  >
                    <div
                      id={`slider-${index}-label`}
                      className="sr-only"
                    >
                      {index + 1}번째 로또 번호 범위 설정
                    </div>
                    <div
                      id={`slider-${index}-description`}
                      className="sr-only"
                    >
                      현재 범위: {range.min}부터 {range.max}까지
                    </div>
                    <DualSlider
                      min={UI_CONSTANTS.SLIDER_MIN}
                      max={UI_CONSTANTS.SLIDER_MAX}
                      minValue={range.min}
                      maxValue={range.max}
                      onMinChange={(value) => onRangeUpdate(index, 'min', value)}
                      onMaxChange={(value) => onRangeUpdate(index, 'max', value)}
                      orientation="vertical"
                      className="mx-2 sm:mx-4"
                    />
                  </div>
                </div>

                {/* Min value display (mobile: bottom, desktop: side) */}
                <div
                  className="text-xs sm:hidden text-primary font-medium mt-6"
                  aria-label={`${index + 1}번째 번호 최소값: ${range.min}`}
                >
                  {range.min}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Color Legend - Hidden on mobile since values are shown directly */}
      <div className="hidden sm:flex justify-center gap-8 mt-8">
        <div className="flex items-center space-x-2">
          <div className="size-4 bg-destructive rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-muted-foreground">최대값</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="size-4 bg-primary rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-muted-foreground">최소값</span>
        </div>
      </div>
    </section>
  )
})