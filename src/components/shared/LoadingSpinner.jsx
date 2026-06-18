import React from 'react'

export function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex flex-col justify-center items-center h-full w-full py-12 space-y-4 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        {/* Inner pulse */}
        <div className="w-6 h-6 bg-primary/40 rounded-full animate-pulse shadow-[0_0_15px_rgba(212,133,44,0.6)]"></div>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading data...</p>
    </div>
  )
}
