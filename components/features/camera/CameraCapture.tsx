'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, RotateCcw, Check, X, Upload, Smartphone } from 'lucide-react'

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
  const [mode, setMode] = useState<'camera' | 'upload' | 'selection'>('selection')
  const [isStreamActive, setIsStreamActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setMode('camera')

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
      setError('Camera access denied. Try uploading a photo instead.')
      console.error('Camera error:', err)
      setMode('selection')
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

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setCapturedImage(result)
        setMode('upload')
        setError(null)
      }
    }
    reader.onerror = () => {
      setError('Failed to read image file.')
    }
    reader.readAsDataURL(file)
  }, [])

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const backToSelection = useCallback(() => {
    setCapturedImage(null)
    setMode('selection')
    setError(null)
    stopCamera()
  }, [stopCamera])

  return (
    <div
      className={`mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white">
        <h3 className="text-lg font-semibold">
          {mode === 'selection' ? 'Add Test Strip Photo' : 'Test Strip Photo'}
        </h3>
        <p className="mt-1 text-sm text-blue-100">
          {mode === 'selection' 
            ? 'Choose to take a photo or upload an existing image'
            : mode === 'camera'
            ? 'Position your test strip in the frame and capture'
            : 'Your uploaded test strip image'
          }
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="relative">
        {error && (
          <div className="border-l-4 border-red-400 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2 space-x-2">
              {mode !== 'selection' && (
                <button
                  onClick={backToSelection}
                  className="text-sm text-red-600 underline hover:text-red-800"
                >
                  Try Different Method
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode Selection */}
        {mode === 'selection' && !capturedImage && (
          <div className="space-y-4 p-6">
            <div className="grid gap-4">
              <button
                onClick={startCamera}
                className="flex items-center space-x-4 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Camera size={24} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Use Camera</h4>
                  <p className="text-sm text-gray-500">Take a photo with your device camera</p>
                </div>
                <Smartphone size={20} className="ml-auto text-gray-400" />
              </button>

              <button
                onClick={triggerFileUpload}
                className="flex items-center space-x-4 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-green-300 hover:bg-green-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Upload size={24} className="text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Upload Photo</h4>
                  <p className="text-sm text-gray-500">Select an existing photo from your device</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && isStreamActive && (
          <div className="relative aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-4 flex items-center justify-center rounded-lg border-2 border-dashed border-white">
              <span className="rounded bg-black bg-opacity-50 px-3 py-1 text-sm text-white">
                Align test strip here
              </span>
            </div>
          </div>
        )}

        {/* Captured/Uploaded Image Preview */}
        {capturedImage && (
          <div className="relative aspect-[4/3]">
            <Image src={capturedImage} alt="Test strip" fill className="object-cover" />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4">
        {/* Camera Controls */}
        {mode === 'camera' && isStreamActive && (
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

            <button
              onClick={backToSelection}
              className="rounded-full bg-gray-200 p-3 transition-colors hover:bg-gray-300"
              title="Back"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Image Confirmation Controls */}
        {capturedImage && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={mode === 'camera' ? retakePhoto : backToSelection}
              className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
            >
              {mode === 'camera' ? 'Retake' : 'Choose Different'}
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

        {/* Selection Mode Footer */}
        {mode === 'selection' && !capturedImage && !error && onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
