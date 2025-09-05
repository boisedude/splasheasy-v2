'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplets, Camera, BarChart3, Loader2, Brain, Cloud, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CameraCapture from '@/components/features/camera/CameraCapture'
import TestResults from '@/components/features/results/TestResults'
import { useAuth } from '@/lib/auth-context'
import { createSupabaseBrowserClient } from '@/lib/supabase'

type TestState = 'setup' | 'camera' | 'analyzing' | 'results'

interface Unit {
  id: string
  name: string
  type: 'pool' | 'spa' | 'hot_tub'
}

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

export function TestFlow() {
  const { user } = useAuth()
  const [currentState, setCurrentState] = useState<TestState>('setup')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [userUnits, setUserUnits] = useState<Unit[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [weatherRecommendations, setWeatherRecommendations] =
    useState<WeatherRecommendations | null>(null)
  const [historicalContext, setHistoricalContext] = useState<HistoricalContext | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )

  const supabase = createSupabaseBrowserClient()

  const fetchUserUnits = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name, type')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserUnits(data || [])
      if (data && data.length > 0) {
        setSelectedUnit(data[0]) // Auto-select first unit
      }
    } catch (err) {
      console.error('Error fetching units:', err)
    }
  }, [user, supabase])

  // Fetch user's units if authenticated
  useEffect(() => {
    if (user) {
      fetchUserUnits()
    }
  }, [user, fetchUserUnits])

  const handleStartTest = () => {
    if (user && userUnits.length === 0) {
      // User has no units, skip to camera
      setCurrentState('camera')
    } else if (user && !selectedUnit) {
      // User has units but none selected
      return
    } else {
      setCurrentState('camera')
    }

    setError(null)

    // Get user location for weather recommendations
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        error => {
          console.log('Location permission denied or unavailable:', error)
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
        user_id?: string
        unit_id?: string
      } = {
        image: imageData,
        include_trends: true,
      }

      // Add authenticated user context
      if (user) {
        requestBody.user_id = user.id
        if (selectedUnit) {
          requestBody.unit_id = selectedUnit.id
        }
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

  const handleBackToSetup = () => {
    setCurrentState('setup')
    setAnalysisResult(null)
    setWeatherRecommendations(null)
    setHistoricalContext(null)
    setError(null)
  }

  const handleSaveResults = () => {
    // Results are automatically saved by the API for authenticated users
    if (user) {
      alert('Results saved to your history!')
    } else {
      alert('Sign in to save your test results and track trends over time!')
    }
  }

  // Setup screen for authenticated users
  if (currentState === 'setup') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-600 p-3">
              <Droplets className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Water Test Setup</h1>
          <p className="text-gray-600">
            {user
              ? 'Select which pool or spa you want to test'
              : 'Test your water with AI-powered analysis'}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {user && userUnits.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Select Pool/Spa to Test</label>
                  <Select
                    value={selectedUnit?.id || ''}
                    onValueChange={value => {
                      const unit = userUnits.find(u => u.id === value)
                      setSelectedUnit(unit || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pool or spa" />
                    </SelectTrigger>
                    <SelectContent>
                      {userUnits.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleStartTest}
                    disabled={!selectedUnit}
                    className="w-full"
                    size="lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Test for {selectedUnit?.name || 'Selected Unit'}
                  </Button>
                </div>
              </div>
            ) : user && userUnits.length === 0 ? (
              <div className="space-y-4 text-center">
                <div className="text-gray-600">
                  You haven&apos;t added any pools or spas yet. You can still test your water!
                </div>
                <Button onClick={handleStartTest} size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Water Test
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="text-gray-600">
                  Get instant AI-powered analysis of your test strip
                </div>
                <Button onClick={handleStartTest} size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Water Test
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Camera capture screen
  if (currentState === 'camera') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {selectedUnit ? `Testing ${selectedUnit.name}` : 'Water Test Analysis'}
          </h1>
          <p className="text-gray-600">Take a clear photo of your test strip</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <CameraCapture onImageCapture={handleImageCapture} onCancel={handleBackToSetup} />
      </div>
    )
  }

  // Analyzing screen
  if (currentState === 'analyzing') {
    return (
      <div className="mx-auto max-w-md text-center">
        <Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={48} />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Analyzing Your Test Strip</h2>
        <p className="text-gray-600">
          {selectedUnit
            ? `AI is reading chemical levels for ${selectedUnit.name}...`
            : 'AI is reading your chemical levels...'}
        </p>
      </div>
    )
  }

  // Results screen
  if (currentState === 'results' && analysisResult) {
    return (
      <div className="mx-auto max-w-6xl">
        <TestResults
          results={analysisResult}
          weatherRecommendations={weatherRecommendations}
          historicalContext={historicalContext}
          unitName={selectedUnit?.name}
          onRetake={handleRetakePhoto}
          onSaveResults={handleSaveResults}
        />
      </div>
    )
  }

  // Guest flow - show enhanced features
  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-600 p-4">
            <Droplets className="text-white" size={48} />
          </div>
        </div>

        <h1 className="mb-6 text-5xl font-bold text-gray-900">AI-Powered Water Testing</h1>

        <p className="mb-8 text-xl text-gray-600">Next-Generation Water Testing for Pools & Spas</p>

        <p className="mb-12 text-lg text-gray-500">
          Multi-brand strip recognition • Weather-based recommendations • Historical trend analysis
        </p>

        <Button onClick={handleStartTest} size="lg" className="px-8 py-4 text-lg">
          <Camera size={24} className="mr-3" />
          <span>Start Water Test</span>
        </Button>
      </div>

      {/* Enhanced Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="mx-auto mb-4 text-purple-600" size={40} />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Multi-Brand Recognition</h3>
            <p className="text-sm text-gray-600">
              Identifies AquaChek, Poolmaster, HTH and other major test strip brands automatically
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Cloud className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Weather Integration</h3>
            <p className="text-sm text-gray-600">
              Location-based recommendations considering temperature, UV index, and weather
              conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="mx-auto mb-4 text-green-600" size={40} />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Trend Analysis</h3>
            <p className="text-sm text-gray-600">
              Track chemical changes over time with intelligent insights and maintenance predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="mx-auto mb-4 text-orange-600" size={40} />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Confidence Scoring</h3>
            <p className="text-sm text-gray-600">
              Individual confidence scores for each chemical reading plus overall analysis
              reliability
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
