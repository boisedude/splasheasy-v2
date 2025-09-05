'use client'

import { useState } from 'react'
import { Droplets, Camera, BarChart3, Loader2, Brain, Cloud, TrendingUp } from 'lucide-react'
import CameraCapture from '@/components/features/camera/CameraCapture'
import TestResults from '@/components/features/results/TestResults'

type AppState = 'landing' | 'camera' | 'analyzing' | 'results'

interface AnalysisResult {
  ph: number | null
  free_chlorine: number | null
  total_alkalinity: number | null
  cyanuric_acid: number | null
  total_hardness: number | null
  confidence_score: number
  brand_detected?: string
  brand_confidence?: number
  strip_type?: string
  notes?: string
  readable_strips: boolean
  error_message?: string
  individual_confidence?: {
    ph?: number
    free_chlorine?: number
    total_alkalinity?: number
    cyanuric_acid?: number
    total_hardness?: number
  }
}

interface WeatherRecommendations {
  chlorine_adjustment: string
  maintenance_priority: string
  testing_frequency: string
  weather_notes: string
}

interface TrendAnalysis {
  parameter: string
  current_value: number | null
  previous_value: number | null
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data'
  trend_strength: 'weak' | 'moderate' | 'strong'
  days_since_last_test: number
  recommendation: string
}

interface HistoricalContext {
  trends: TrendAnalysis[]
  overall_pool_health: 'excellent' | 'good' | 'needs_attention' | 'poor'
  maintenance_insights: string[]
  next_test_recommendation: string
}

export default function HomePage() {
  const [currentState, setCurrentState] = useState<AppState>('landing')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [weatherRecommendations, setWeatherRecommendations] = useState<WeatherRecommendations | null>(null)
  const [historicalContext, setHistoricalContext] = useState<HistoricalContext | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)

  const handleStartTest = () => {
    setCurrentState('camera')
    setError(null)
    
    // Get user location for weather recommendations
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location permission denied or unavailable:', error)
          // Continue without location - weather features will be disabled
        }
      )
    }
  }

  const handleImageCapture = async (imageData: string) => {
    setCurrentState('analyzing')
    setError(null)

    try {
      const requestBody: {
        image: string
        include_trends: boolean
        latitude?: number
        longitude?: number
      } = { 
        image: imageData,
        include_trends: true // Always include trends for enhanced experience
      }

      // Add location for weather recommendations if available
      if (userLocation) {
        requestBody.latitude = userLocation.latitude
        requestBody.longitude = userLocation.longitude
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis was not successful')
      }

      setAnalysisResult(data.analysis)
      setWeatherRecommendations(data.weather_recommendations)
      setHistoricalContext(data.historical_context)
      setCurrentState('results')
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setCurrentState('camera')
    }
  }

  const handleRetakePhoto = () => {
    setCurrentState('camera')
    setAnalysisResult(null)
    setWeatherRecommendations(null)
    setHistoricalContext(null)
    setError(null)
  }

  const handleBackToHome = () => {
    setCurrentState('landing')
    setAnalysisResult(null)
    setWeatherRecommendations(null)
    setHistoricalContext(null)
    setError(null)
  }

  const handleSaveResults = () => {
    // TODO: Implement saving to Supabase
    console.log('Save results:', analysisResult)
    alert('Results saved! (Database integration coming soon)')
  }

  if (currentState === 'camera') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Water Test Analysis</h1>
            <p className="text-gray-600">Take a clear photo of your test strip</p>
          </div>
          
          {error && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <CameraCapture 
            onImageCapture={handleImageCapture}
            onCancel={handleBackToHome}
          />
        </div>
      </main>
    )
  }

  if (currentState === 'analyzing') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Test Strip</h2>
          <p className="text-gray-600">AI is reading your chemical levels...</p>
        </div>
      </main>
    )
  }

  if (currentState === 'results' && analysisResult) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <TestResults
            results={analysisResult}
            weatherRecommendations={weatherRecommendations}
            historicalContext={historicalContext}
            onRetake={handleRetakePhoto}
            onSaveResults={handleSaveResults}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Droplets className="text-white" size={48} />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SplashEasy V2
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Next-Generation AI Water Testing for Pools & Spas
          </p>
          
          <p className="text-lg text-gray-500 mb-12">
            Multi-brand strip recognition • Weather-based recommendations • Historical trend analysis
          </p>

          <button
            onClick={handleStartTest}
            className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg"
          >
            <Camera size={24} />
            <span>Start Water Test</span>
          </button>
        </div>

        {/* Enhanced Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Brain className="mx-auto text-purple-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multi-Brand Recognition
            </h3>
            <p className="text-gray-600 text-sm">
              Identifies AquaChek, Poolmaster, HTH and other major test strip brands automatically
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Cloud className="mx-auto text-blue-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Weather Integration
            </h3>
            <p className="text-gray-600 text-sm">
              Location-based recommendations considering temperature, UV index, and weather conditions
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <TrendingUp className="mx-auto text-green-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Trend Analysis
            </h3>
            <p className="text-gray-600 text-sm">
              Track chemical changes over time with intelligent insights and maintenance predictions
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <BarChart3 className="mx-auto text-orange-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confidence Scoring
            </h3>
            <p className="text-gray-600 text-sm">
              Individual confidence scores for each chemical reading plus overall analysis reliability
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>No account required • Works on mobile & desktop • Secure & private</p>
        </div>
      </div>
    </main>
  )
}