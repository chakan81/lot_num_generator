'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy } from 'lucide-react'
import type { NumberDisplayProps } from '@/types/lottery'
import { LOTTERY_NUMBERS_COUNT } from '@/constants/lottery'

export const NumberDisplay = memo(function NumberDisplay({
  numbers,
  isGenerating,
  onCopyNumbers
}: NumberDisplayProps & { onCopyNumbers: (numbers: number[]) => void }) {
  return (
    <section className="mb-12" aria-labelledby="generated-numbers" suppressHydrationWarning>
      <h2 id="generated-numbers" className="sr-only">생성된 로또 번호</h2>

      {/* Numbers Grid */}
      <div
        className="grid grid-cols-6 gap-2 sm:gap-4 max-w-3xl mx-auto"
        role="region"
        aria-label="생성된 로또 번호 6개"
      >
        {Array.from({ length: LOTTERY_NUMBERS_COUNT }, (_, index) => (
          <Card
            key={index}
            className="bg-card border-border aspect-square relative overflow-hidden"
            role="img"
            aria-label={
              isGenerating
                ? `${index + 1}번째 번호 생성 중`
                : numbers[index]
                  ? `${index + 1}번째 번호: ${numbers[index]}`
                  : `${index + 1}번째 번호: 아직 생성되지 않음`
            }
          >
            <CardContent className="absolute inset-0 flex items-center justify-center p-0">
              <div className="w-[70%] h-[70%] bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg">
                {isGenerating ? (
                  <div className="animate-spin" aria-hidden="true">🎲</div>
                ) : (
                  <span aria-hidden="true">{numbers[index] || '?'}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Copy Button */}
      {numbers.length > 0 && !isGenerating && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => onCopyNumbers(numbers)}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            번호 복사
          </Button>
        </div>
      )}
    </section>
  )
})