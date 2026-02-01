'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class SimpleErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-bold">Terjadi Kesalahan Tampilan</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Mohon maaf, terjadi kesalahan saat menampilkan halaman ini di perangkat Anda.
          </p>
          <div className="bg-white p-3 rounded border border-red-100 text-xs font-mono text-red-500 overflow-auto max-h-40 mb-4">
            {this.state.error?.message || "Unknown error"}
          </div>
          <Button 
            variant="outline" 
            className="border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => this.setState({ hasError: false })}
          >
            Coba Lagi
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
