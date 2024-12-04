import React from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
const { ipcRenderer } = window.require('electron')

const ffmpeg = createFFmpeg({ log: true })

interface ExportSettingsProps {
  videoPath: string
  playbackSpeed: number
  outputFormat: string
  onFormatChange: (format: string) => void
  onExport: (savePath: string) => Promise<void>
  processing: boolean
}

export default function ExportSettings({
  videoPath,
  playbackSpeed,
  outputFormat,
  onFormatChange,
  onExport,
  processing
}: ExportSettingsProps) {
  const handleExport = async () => {
    const defaultPath = videoPath.replace(/\.[^/.]+$/, `.${outputFormat}`)
    const savePath = await ipcRenderer.invoke('select-save-path', defaultPath)
    
    if (!savePath) return

    await onExport(savePath)

    try {
      // 使用 fetch API 来加载视频文件
      const inputData = await fetchFile(videoPath)

      const inputFileName = 'input.mp4'
      const outputFileName = `output.${outputFormat}`

      ffmpeg.FS('writeFile', inputFileName, new Uint8Array(inputData))

      await ffmpeg.run(
        '-i', inputFileName,
        '-filter:a', `atempo=${playbackSpeed}`,
        '-filter:v', `setpts=PTS/${playbackSpeed}`,
        outputFileName
      )

      const data = ffmpeg.FS('readFile', outputFileName)
      await require('fs').promises.writeFile(savePath, Buffer.from(data))

      ffmpeg.FS('unlink', inputFileName)
      ffmpeg.FS('unlink', outputFileName)

      alert('导出完成！')
    } catch (error) {
      console.error('Export error:', error)
      alert('导出失败，请查看控制台了解详情。')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          格式选择:
        </label>
        <select
          value={outputFormat}
          onChange={(e) => onFormatChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="mkv">mkv</option>
          <option value="mp4">mp4</option>
          <option value="avi">avi</option>
        </select>
      </div>

      <button
        onClick={handleExport}
        disabled={processing}
        className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
      >
        {processing ? '处理中...' : '执行处理'}
      </button>
    </div>
  )
}
