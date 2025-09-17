'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Error boundary component to catch and handle React errors gracefully
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and update state with error info
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="max-w-2xl mx-auto m-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              문제가 발생했습니다
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              로또 번호 생성기에서 예상치 못한 오류가 발생했습니다.
              페이지를 새로고침하거나 다시 시도해 주세요.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  개발자 정보 (개발 환경에서만 표시)
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                페이지 새로고침
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}