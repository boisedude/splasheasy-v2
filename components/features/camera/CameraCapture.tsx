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
  className = '' 
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
          height: { ideal: 720 }
        }
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
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    if (isStreamActive) {
      stopCamera()
      setTimeout(startCamera, 100)
    }
  }, [isStreamActive, stopCamera, startCamera])

  return (
    <div className={`w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h3 className="text-lg font-semibold">Take Test Strip Photo</h3>
        <p className="text-blue-100 text-sm mt-1">
          Position your test strip in the frame and capture
        </p>
      </div>

      {/* Camera/Preview Area */}
      <div className="relative">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={startCamera}
              className="text-red-600 hover:text-red-800 text-sm underline mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {!isStreamActive && !capturedImage && !error && (
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
            <button
              onClick={startCamera}
              className="flex flex-col items-center space-y-2 p-6 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="w-full h-full object-cover"
            />
            
            {/* Overlay guide */}
            <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
              <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                Align test strip here
              </span>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="relative aspect-[4/3]">
            <Image
              src={capturedImage}
              alt="Captured test strip"
              fill
              className="object-cover"
            />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50">
        {isStreamActive && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={flipCamera}
              className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
              title="Flip Camera"
            >
              <RotateCcw size={20} />
            </button>
            
            <button
              onClick={capturePhoto}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Capture Photo
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
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
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              Retake
            </button>
            
            <button
              onClick={confirmPhoto}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <Check size={18} />
              <span>Use This Photo</span>
            </button>
          </div>
        )}

        {!isStreamActive && !capturedImage && !error && (
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">
              Camera access is required for AI water testing
            </p>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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