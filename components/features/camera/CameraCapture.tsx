'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, RotateCcw, Check, X } from 'lucide-react'

interface CameraCaptureProps {
  onImageCapture: (imageData: string) => void
  onCancel?: () => void
  className?: string
}

export default function CameraCapture({
  onImageCapture,
  onCancel,
  className = '',
}: CameraCaptureProps) {
  const [isStreamActive, setIsStreamActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreamActive(true)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.')
      console.error('Camera error:', err)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreamActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onImageCapture(capturedImage)
    }
  }, [capturedImage, onImageCapture])

  const flipCamera = useCallback(() => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))
    if (isStreamActive) {
      stopCamera()
      setTimeout(startCamera, 100)
    }
  }, [isStreamActive, stopCamera, startCamera])

  return (
    <div
      className={`mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white">
        <h3 className="text-lg font-semibold">Take Test Strip Photo</h3>
        <p className="mt-1 text-sm text-blue-100">
          Position your test strip in the frame and capture
        </p>
      </div>

      {/* Camera/Preview Area */}
      <div className="relative">
        {error && (
          <div className="border-l-4 border-red-400 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={startCamera}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!isStreamActive && !capturedImage && !error && (
          <div className="flex aspect-[4/3] items-center justify-center bg-gray-100">
            <button
              onClick={startCamera}
              className="flex flex-col items-center space-y-2 rounded-lg p-6 transition-colors hover:bg-gray-50"
            >
              <Camera size={48} className="text-gray-400" />
              <span className="text-gray-600">Start Camera</span>
            </button>
          </div>
        )}

        {isStreamActive && (
          <div className="relative aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {/* Overlay guide */}
            <div className="absolute inset-4 flex items-center justify-center rounded-lg border-2 border-dashed border-white">
              <span className="rounded bg-black bg-opacity-50 px-3 py-1 text-sm text-white">
                Align test strip here
              </span>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="relative aspect-[4/3]">
            <Image src={capturedImage} alt="Captured test strip" fill className="object-cover" />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4">
        {isStreamActive && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={flipCamera}
              className="rounded-full bg-gray-200 p-3 transition-colors hover:bg-gray-300"
              title="Flip Camera"
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={capturePhoto}
              className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Capture Photo
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-full bg-gray-200 p-3 transition-colors hover:bg-gray-300"
                title="Cancel"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {capturedImage && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={retakePhoto}
              className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
            >
              Retake
            </button>

            <button
              onClick={confirmPhoto}
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-8 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              <Check size={18} />
              <span>Use This Photo</span>
            </button>
          </div>
        )}

        {!isStreamActive && !capturedImage && !error && (
          <div className="text-center">
            <p className="mb-3 text-sm text-gray-500">
              Camera access is required for AI water testing
            </p>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
