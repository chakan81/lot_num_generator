'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'

interface GenerateButtonProps {
  onGenerate: () => void
  isGenerating: boolean
  disabled?: boolean
}

export const GenerateButton = memo(function GenerateButton({ onGenerate, isGenerating, disabled }: GenerateButtonProps) {
  return (
    <div className="text-center mb-8">
      <Button
        onClick={onGenerate}
        disabled={isGenerating || disabled}
        size="lg"
        className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label={isGenerating ? "로또 번호 생성 중입니다. 잠시만 기다려주세요." : "새로운 로또 번호 6개를 생성합니다"}
        aria-describedby="generate-button-description"
      >
        {isGenerating ? (
          <div className="flex items-center space-x-2">
            <div
              className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            ></div>
            <span>생성 중...</span>
          </div>
        ) : (
          '번호 만들기'
        )}
      </Button>
      <div id="generate-button-description" className="sr-only">
        설정된 범위 내에서 중복되지 않는 6개의 로또 번호를 무작위로 생성합니다.
      </div>
    </div>
  )
})