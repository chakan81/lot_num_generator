"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DualSliderProps {
  min?: number
  max?: number
  minValue: number
  maxValue: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

const DualSlider = React.forwardRef<HTMLDivElement, DualSliderProps>(
  (
    {
      min = 1,
      max = 45,
      minValue,
      maxValue,
      onMinChange,
      onMaxChange,
      orientation = "vertical",
      className,
    },
    ref
  ) => {
    const trackRef = React.useRef<HTMLDivElement>(null)
    const [isDraggingMin, setIsDraggingMin] = React.useState(false)
    const [isDraggingMax, setIsDraggingMax] = React.useState(false)
    const [dragMinPercent, setDragMinPercent] = React.useState<number | null>(null)
    const [dragMaxPercent, setDragMaxPercent] = React.useState<number | null>(null)

    // Calculate positions based on values or drag state
    const minPercent = dragMinPercent ?? ((minValue - min) / (max - min)) * 100
    const maxPercent = dragMaxPercent ?? ((maxValue - min) / (max - min)) * 100

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (!trackRef.current) return

        const rect = trackRef.current.getBoundingClientRect()
        let percent: number

        if (orientation === "vertical") {
          percent = ((rect.bottom - e.clientY) / rect.height) * 100
        } else {
          percent = ((e.clientX - rect.left) / rect.width) * 100
        }

        percent = Math.max(0, Math.min(100, percent))
        const value = Math.round(min + (percent / 100) * (max - min))

        if (isDraggingMin) {
          const newMinValue = Math.min(value, maxValue)
          setDragMinPercent(((newMinValue - min) / (max - min)) * 100)
          onMinChange(newMinValue)
        } else if (isDraggingMax) {
          const newMaxValue = Math.max(value, minValue)
          setDragMaxPercent(((newMaxValue - min) / (max - min)) * 100)
          onMaxChange(newMaxValue)
        }
      },
      [isDraggingMin, isDraggingMax, min, max, minValue, maxValue, onMinChange, onMaxChange, orientation]
    )

    const handleMouseUp = React.useCallback(() => {
      setIsDraggingMin(false)
      setIsDraggingMax(false)
      setDragMinPercent(null)
      setDragMaxPercent(null)
    }, [])

    React.useEffect(() => {
      if (isDraggingMin || isDraggingMax) {
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        return () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
        }
      }
    }, [isDraggingMin, isDraggingMax, handleMouseMove, handleMouseUp])

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex touch-none select-none items-center",
          orientation === "vertical"
            ? "h-48 w-6 flex-col justify-end"
            : "h-6 w-full",
          className
        )}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className={cn(
            "relative bg-muted rounded-full overflow-hidden",
            orientation === "vertical"
              ? "h-full w-1.5"
              : "h-1.5 w-full"
          )}
        >
          {/* Range */}
          <div
            className="absolute bg-primary rounded-full"
            style={
              orientation === "vertical"
                ? {
                    bottom: `${minPercent}%`,
                    top: `${100 - maxPercent}%`,
                    left: 0,
                    right: 0,
                  }
                : {
                    left: `${minPercent}%`,
                    right: `${100 - maxPercent}%`,
                    top: 0,
                    bottom: 0,
                  }
            }
          />
        </div>

        {/* Min Handle */}
        <div
          className={cn(
            "absolute size-4 rounded-full border-2 border-primary bg-background shadow-sm transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
            isDraggingMin && "scale-110"
          )}
          style={
            orientation === "vertical"
              ? {
                  bottom: `${minPercent}%`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }
              : {
                  left: `${minPercent}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }
          }
          onMouseDown={() => setIsDraggingMin(true)}
          tabIndex={0}
          role="slider"
          aria-label="Minimum value"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minValue}
        />

        {/* Max Handle */}
        <div
          className={cn(
            "absolute size-4 rounded-full border-2 border-destructive bg-background shadow-sm transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
            isDraggingMax && "scale-110"
          )}
          style={
            orientation === "vertical"
              ? {
                  bottom: `${maxPercent}%`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }
              : {
                  left: `${maxPercent}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }
          }
          onMouseDown={() => setIsDraggingMax(true)}
          tabIndex={0}
          role="slider"
          aria-label="Maximum value"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxValue}
        />

        {/* Value Labels */}
        {orientation === "vertical" && (
          <>
            <div className="absolute -right-8 text-xs font-medium text-destructive"
                 style={{ bottom: `${maxPercent}%`, transform: "translateY(-50%)" }}>
              {maxValue}
            </div>
            <div className="absolute -right-8 text-xs font-medium text-primary"
                 style={{ bottom: `${minPercent}%`, transform: "translateY(-50%)" }}>
              {minValue}
            </div>
          </>
        )}
      </div>
    )
  }
)

DualSlider.displayName = "DualSlider"

export { DualSlider }