import React, { useRef, useEffect } from 'react'

interface VideoPlayerProps {
  videoPath: string
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
}

export default function VideoPlayer({ videoPath, playbackSpeed, onSpeedChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
      videoRef.current.preservesPitch = true
    }
  }, [playbackSpeed])

  return (
    <div className="mb-4">
      <div className="bg-black rounded overflow-hidden mb-2">
        <video
          ref={videoRef}
          src={`file://${videoPath}`}
          controls
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">视频倍速:</span>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm">x{playbackSpeed}</span>
      </div>
    </div>
  )
}

