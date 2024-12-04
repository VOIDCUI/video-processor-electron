import React, { useState, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'  // 修改为 FFmpeg 类
import VideoSelector from './components/VideoSelector'
import VideoPlayer from './components/VideoPlayer'
import ExportSettings from './components/ExportSettings'
import ProgressBar from './components/ProgressBar'

// 使用 FFmpeg 类实例化
const ffmpeg = new FFmpeg()  // 直接创建 FFmpeg 实例

export default function App() {
	const [videoPath, setVideoPath] = useState('')
	const [playbackSpeed, setPlaybackSpeed] = useState(1)
	const [outputFormat, setOutputFormat] = useState('mkv')
	const [progress, setProgress] = useState(0)
	const [processing, setProcessing] = useState(false)

	useEffect(() => {
		// 加载 FFmpeg 库
		ffmpeg.load()
	}, [])

	return (
		<div className="p-4 max-w-2xl mx-auto">
			<VideoSelector onFileSelect={setVideoPath} />
			{videoPath && (
				<>
					<VideoPlayer
						videoPath={videoPath}
						playbackSpeed={playbackSpeed}
						onSpeedChange={setPlaybackSpeed}
					/>
					<ExportSettings
						videoPath={videoPath}
						playbackSpeed={playbackSpeed}
						outputFormat={outputFormat}
						onFormatChange={setOutputFormat}
						onExport={async (savePath) => {
							setProcessing(true)
							setProgress(0)
							// 在这里实现导出逻辑
							// 更新 Progress 在 ExportSettings 组件中处理
						}}
						processing={processing}
					/>
					{processing && <ProgressBar progress={progress} />}
				</>
			)}
		</div>
	)
}
