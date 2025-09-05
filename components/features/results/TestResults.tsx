import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Cloud,
} from 'lucide-react'

interface ChemicalReading {
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

interface TestResultsProps {
  results: ChemicalReading
  weatherRecommendations?: WeatherRecommendations | null
  historicalContext?: HistoricalContext | null
  unitName?: string
  onRetake?: () => void
  onSaveResults?: () => void
  className?: string
}

interface ChemicalRange {
  name: string
  value: number | null
  unit: string
  ideal: { min: number; max: number }
  acceptable: { min: number; max: number }
  recommendations: {
    low: string
    high: string
    good: string
  }
}

function getStatus(
  value: number | null,
  ideal: { min: number; max: number },
  acceptable: { min: number; max: number }
) {
  if (value === null) return 'unknown'
  if (value >= ideal.min && value <= ideal.max) return 'ideal'
  if (value >= acceptable.min && value <= acceptable.max) return 'acceptable'
  return 'needs-attention'
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'ideal':
      return <CheckCircle className="text-green-500" size={20} />
    case 'acceptable':
      return <AlertTriangle className="text-yellow-500" size={20} />
    case 'needs-attention':
      return <XCircle className="text-red-500" size={20} />
    default:
      return <Info className="text-gray-400" size={20} />
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    ideal: 'bg-green-100 text-green-800 border-green-200',
    acceptable: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'needs-attention': 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const labels = {
    ideal: 'Ideal',
    acceptable: 'Acceptable',
    'needs-attention': 'Needs Attention',
    unknown: 'Not Detected',
  }

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`}
    >
      {labels[status as keyof typeof labels]}
    </span>
  )
}

function TrendIcon({ direction }: { direction: string }) {
  switch (direction) {
    case 'increasing':
      return <TrendingUp className="text-blue-500" size={16} />
    case 'decreasing':
      return <TrendingDown className="text-orange-500" size={16} />
    case 'stable':
      return <Minus className="text-green-500" size={16} />
    default:
      return <Info className="text-gray-400" size={16} />
  }
}

function ChemicalCard({
  chemical,
  individualConfidence,
  trend,
}: {
  chemical: ChemicalRange
  individualConfidence?: number
  trend?: TrendAnalysis
}) {
  const status = getStatus(chemical.value, chemical.ideal, chemical.acceptable)

  let recommendation = chemical.recommendations.good
  if (chemical.value !== null) {
    if (chemical.value < chemical.acceptable.min) {
      recommendation = chemical.recommendations.low
    } else if (chemical.value > chemical.acceptable.max) {
      recommendation = chemical.recommendations.high
    }
  }

  // Use trend recommendation if available
  if (trend && trend.recommendation) {
    recommendation = trend.recommendation
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusIcon status={status} />
          <h3 className="font-medium text-gray-900">{chemical.name}</h3>
          {trend && <TrendIcon direction={trend.trend_direction} />}
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={status} />
          {individualConfidence && (
            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {Math.round(individualConfidence * 100)}%
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {chemical.value !== null ? `${chemical.value} ${chemical.unit}` : 'Not detected'}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Ideal: {chemical.ideal.min}-{chemical.ideal.max} {chemical.unit}
          </span>
          {trend && trend.previous_value !== null && (
            <span className="text-xs text-gray-400">
              Was: {trend.previous_value} {chemical.unit}
            </span>
          )}
        </div>
      </div>

      <div className="rounded bg-gray-50 p-3 text-sm text-gray-700">{recommendation}</div>
    </div>
  )
}

export default function TestResults({
  results,
  weatherRecommendations,
  historicalContext,
  unitName,
  onRetake,
  onSaveResults,
  className = '',
}: TestResultsProps) {
  const chemicals: ChemicalRange[] = [
    {
      name: 'pH Level',
      value: results.ph,
      unit: '',
      ideal: { min: 7.0, max: 7.6 },
      acceptable: { min: 6.8, max: 8.2 },
      recommendations: {
        low: 'pH is too low (acidic). Add pH increaser or baking soda to raise pH levels.',
        high: 'pH is too high (alkaline). Add pH decreaser or muriatic acid to lower pH levels.',
        good: 'pH levels are in the ideal range. Your water is properly balanced.',
      },
    },
    {
      name: 'Free Chlorine',
      value: results.free_chlorine,
      unit: 'ppm',
      ideal: { min: 1.0, max: 3.0 },
      acceptable: { min: 0.5, max: 5.0 },
      recommendations: {
        low: 'Chlorine levels are too low. Add chlorine tablets or shock treatment to sanitize your pool.',
        high: 'Chlorine levels are too high. Wait for levels to naturally decrease or add sodium thiosulfate.',
        good: 'Chlorine levels are perfect. Your pool is properly sanitized.',
      },
    },
    {
      name: 'Total Alkalinity',
      value: results.total_alkalinity,
      unit: 'ppm',
      ideal: { min: 80, max: 120 },
      acceptable: { min: 60, max: 180 },
      recommendations: {
        low: 'Alkalinity is too low. Add alkalinity increaser to stabilize pH levels.',
        high: 'Alkalinity is too high. Add muriatic acid carefully to reduce alkalinity.',
        good: 'Alkalinity levels are ideal. This helps maintain stable pH levels.',
      },
    },
    {
      name: 'Cyanuric Acid',
      value: results.cyanuric_acid,
      unit: 'ppm',
      ideal: { min: 30, max: 50 },
      acceptable: { min: 0, max: 100 },
      recommendations: {
        low: 'Stabilizer levels are low. Add cyanuric acid to protect chlorine from UV breakdown.',
        high: 'Stabilizer levels are too high. Consider partially draining and refilling your pool.',
        good: 'Stabilizer levels are perfect. Your chlorine is protected from sun degradation.',
      },
    },
    {
      name: 'Total Hardness',
      value: results.total_hardness,
      unit: 'ppm',
      ideal: { min: 150, max: 300 },
      acceptable: { min: 100, max: 500 },
      recommendations: {
        low: 'Water hardness is too low. Add calcium chloride to prevent equipment damage.',
        high: 'Water hardness is too high. Consider using a water softener or partial water change.',
        good: 'Calcium hardness is in the ideal range. Your equipment is protected.',
      },
    },
  ]

  if (!results.readable_strips) {
    return (
      <div className={`mx-auto max-w-2xl rounded-lg bg-white shadow-lg ${className}`}>
        <div className="p-6 text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Unable to Read Test Strip</h2>
          <p className="mb-6 text-gray-600">
            The test strip image was not clear enough for accurate analysis. Please try again with
            better lighting and a clearer image.
          </p>
          {results.error_message && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{results.error_message}</p>
            </div>
          )}
          <button
            onClick={onRetake}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Take New Photo
          </button>
        </div>
      </div>
    )
  }

  const overallStatus = chemicals.some(
    c => getStatus(c.value, c.ideal, c.acceptable) === 'needs-attention'
  )
    ? 'needs-attention'
    : chemicals.every(c => getStatus(c.value, c.ideal, c.acceptable) === 'ideal')
      ? 'ideal'
      : 'acceptable'

  return (
    <div className={`mx-auto max-w-4xl rounded-lg bg-gray-50 shadow-lg ${className}`}>
      {/* Header */}
      <div className="rounded-t-lg border-b border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {unitName ? `${unitName} Test Results` : 'Water Test Results'}
            </h2>
            <div className="mb-2 flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Confidence: {Math.round(results.confidence_score * 100)}%
              </span>
              <StatusBadge status={overallStatus} />
              {historicalContext && (
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    historicalContext.overall_pool_health === 'excellent'
                      ? 'bg-green-100 text-green-800'
                      : historicalContext.overall_pool_health === 'good'
                        ? 'bg-blue-100 text-blue-800'
                        : historicalContext.overall_pool_health === 'needs_attention'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  Pool Health: {historicalContext.overall_pool_health.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Brand Detection */}
            {results.brand_detected && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Info size={16} />
                <span>
                  {results.strip_type} strip detected: {results.brand_detected}
                  {results.brand_confidence && (
                    <span className="ml-1 text-gray-400">
                      ({Math.round(results.brand_confidence * 100)}% confidence)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {results.notes && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-1 font-medium text-blue-900">AI Analysis Notes</h4>
            <p className="text-sm text-blue-700">{results.notes}</p>
          </div>
        )}

        {/* Weather Recommendations */}
        {weatherRecommendations && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 flex items-center font-medium text-yellow-900">
              <Cloud className="mr-2" size={16} />
              Weather-Based Recommendations
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-800">{weatherRecommendations.chlorine_adjustment}</p>
              <div className="flex justify-between text-yellow-700">
                <span>Testing frequency: {weatherRecommendations.testing_frequency}</span>
                <span>Priority: {weatherRecommendations.maintenance_priority}</span>
              </div>
              {weatherRecommendations.weather_notes && (
                <p className="text-xs text-yellow-700">{weatherRecommendations.weather_notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Historical Context */}
        {historicalContext && historicalContext.maintenance_insights.length > 0 && (
          <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-2 font-medium text-purple-900">Historical Insights</h4>
            <div className="space-y-1">
              {historicalContext.maintenance_insights.map((insight, index) => (
                <p key={index} className="text-sm text-purple-700">
                  • {insight}
                </p>
              ))}
              <p className="mt-2 text-sm font-medium text-purple-800">
                Next test: {historicalContext.next_test_recommendation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chemical Readings */}
      <div className="p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {chemicals.map(chemical => {
            const paramKey = chemical.name
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace('level', '')
              .trim() as keyof typeof results.individual_confidence
            const individualConfidence =
              results.individual_confidence?.[
                paramKey === 'ph'
                  ? 'ph'
                  : paramKey === 'free_chlorine'
                    ? 'free_chlorine'
                    : paramKey === 'total_alkalinity'
                      ? 'total_alkalinity'
                      : paramKey === 'cyanuric_acid'
                        ? 'cyanuric_acid'
                        : 'total_hardness'
              ]
            const trend = historicalContext?.trends.find(
              t =>
                t.parameter.toLowerCase().replace(/\s+/g, '_') === paramKey ||
                t.parameter === chemical.name
            )

            return (
              <ChemicalCard
                key={chemical.name}
                chemical={chemical}
                individualConfidence={individualConfidence}
                trend={trend}
              />
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4 border-t border-gray-200 pt-4">
          <button
            onClick={onRetake}
            className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
          >
            Take New Test
          </button>

          {onSaveResults && (
            <button
              onClick={onSaveResults}
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              Save Results
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
