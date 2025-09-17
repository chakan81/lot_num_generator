'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Trash2, CheckSquare } from 'lucide-react'
import type { LotteryHistory } from '@/types/lottery'

interface HistoryPanelProps {
  history: LotteryHistory[]
  showHistory: boolean
  isSelectMode: boolean
  selectedHistoryIds: Set<string>
  onToggleSelectMode: () => void
  onToggleSelectAll: (checked: boolean) => void
  onToggleHistorySelection: (id: string) => void
  onCopyNumbers: (numbers: number[]) => void
  onMultipleCopy: () => void
  onMultipleDelete: () => void
}

export const HistoryPanel = memo(function HistoryPanel({
  history,
  showHistory,
  isSelectMode,
  selectedHistoryIds,
  onToggleSelectMode,
  onToggleSelectAll,
  onToggleHistorySelection,
  onCopyNumbers,
  onMultipleCopy,
  onMultipleDelete
}: HistoryPanelProps) {
  if (!showHistory) return null

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">생성 기록</CardTitle>
            {history.length > 0 && (
              <Button
                onClick={onToggleSelectMode}
                variant="outline"
                size="sm"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {isSelectMode ? '선택 취소' : '선택 모드'}
                </span>
                <span className="sm:hidden">
                  {isSelectMode ? '취소' : '선택'}
                </span>
              </Button>
            )}
          </div>

          {/* Multi-select action buttons */}
          {isSelectMode && selectedHistoryIds.size > 0 && (
            <div className="flex justify-end gap-2">
              <Button
                onClick={onMultipleCopy}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  선택 복사 ({selectedHistoryIds.size})
                </span>
                <span className="sm:hidden">
                  복사 ({selectedHistoryIds.size})
                </span>
              </Button>
              <Button
                onClick={onMultipleDelete}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  선택 삭제 ({selectedHistoryIds.size})
                </span>
                <span className="sm:hidden">
                  삭제 ({selectedHistoryIds.size})
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Select all checkbox */}
        {isSelectMode && history.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              checked={selectedHistoryIds.size === history.length}
              onCheckedChange={onToggleSelectAll}
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
                    onCheckedChange={() => onToggleHistorySelection(entry.id)}
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
                    onClick={() => onCopyNumbers(entry.numbers)}
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
  )
})