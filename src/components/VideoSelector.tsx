import React from 'react'
const { ipcRenderer } = window.require('electron')

interface VideoSelectorProps {
  onFileSelect: (path: string) => void
}

export default function VideoSelector({ onFileSelect }: VideoSelectorProps) {
  const handleFileSelect = async () => {
    const filePath = await ipcRenderer.invoke('select-file')
    if (filePath) {
      onFileSelect(filePath)
    }
  }

  return (
    <button
      onClick={handleFileSelect}
      className="w-full bg-blue-500 text-white p-2 rounded mb-4"
    >
      选择视频
    </button>
  )
}

