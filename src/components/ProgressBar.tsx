import React from 'react'

interface ProgressBarProps {
  progress: number
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
      <div
        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

