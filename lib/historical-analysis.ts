import { supabaseAdmin } from './supabase'

interface HistoricalReading {
  timestamp: string
  ph: number | null
  free_chlorine: number | null
  total_alkalinity: number | null
  cyanuric_acid: number | null
  total_hardness: number | null
  confidence_score: number
  weather_conditions?: string
  temperature?: number
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

export class HistoricalAnalysis {
  // Get historical readings from database
  static async getHistoricalReadings(
    userId?: string,
    unitId?: string,
    limit: number = 10
  ): Promise<HistoricalReading[]> {
    try {
      if (!userId || !unitId) {
        // Return mock data if no user context (public access)
        return this.mockHistoricalData()
      }

      const { data, error } = await supabaseAdmin
        .from('water_tests')
        .select('*')
        .eq('user_id', userId)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch historical readings:', error)
        return this.mockHistoricalData()
      }

      return data.map(test => ({
        timestamp: test.created_at,
        ph: test.ph,
        free_chlorine: test.free_chlorine,
        total_alkalinity: test.total_alkalinity,
        cyanuric_acid: test.cyanuric_acid,
        total_hardness: test.total_hardness,
        confidence_score: test.confidence_score || 0.9,
        weather_conditions: undefined, // Could be added later
        temperature: undefined,
      }))
    } catch (error) {
      console.error('Database connection error:', error)
      return this.mockHistoricalData()
    }
  }

  // Save new test result to database
  static async saveTestResult(
    reading: HistoricalReading,
    userId?: string,
    unitId?: string,
    imageUrl?: string
  ): Promise<boolean> {
    try {
      if (!userId || !unitId) {
        // Skip saving if no user context (public access)
        return false
      }

      const { error } = await supabaseAdmin.from('water_tests').insert({
        user_id: userId,
        unit_id: unitId,
        test_method: 'ai_vision',
        ph: reading.ph,
        free_chlorine: reading.free_chlorine,
        total_alkalinity: reading.total_alkalinity,
        cyanuric_acid: reading.cyanuric_acid,
        total_hardness: reading.total_hardness,
        confidence_score: reading.confidence_score,
        image_url: imageUrl,
        created_at: reading.timestamp,
      })

      if (error) {
        console.error('Failed to save test result:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Database connection error during save:', error)
      return false
    }
  }

  static analyzeTrends(
    readings: HistoricalReading[],
    current: HistoricalReading
  ): HistoricalContext {
    if (readings.length === 0) {
      return {
        trends: [],
        overall_pool_health: 'good',
        maintenance_insights: ['This is your first test. Establish a baseline by testing weekly.'],
        next_test_recommendation: 'Test again in 3-7 days to establish trends.',
      }
    }

    const sortedReadings = readings.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    const trends: TrendAnalysis[] = [
      this.analyzeSingleParameter('pH', 'ph', readings, current),
      this.analyzeSingleParameter('Free Chlorine', 'free_chlorine', readings, current),
      this.analyzeSingleParameter('Total Alkalinity', 'total_alkalinity', readings, current),
      this.analyzeSingleParameter('Cyanuric Acid', 'cyanuric_acid', readings, current),
      this.analyzeSingleParameter('Total Hardness', 'total_hardness', readings, current),
    ].filter(trend => trend.current_value !== null)

    const overall_pool_health = this.assessOverallHealth(trends)
    const maintenance_insights = this.generateMaintenanceInsights(trends, sortedReadings)
    const next_test_recommendation = this.generateNextTestRecommendation(trends)

    return {
      trends,
      overall_pool_health,
      maintenance_insights,
      next_test_recommendation,
    }
  }

  private static analyzeSingleParameter(
    name: string,
    key: keyof HistoricalReading,
    readings: HistoricalReading[],
    current: HistoricalReading
  ): TrendAnalysis {
    const currentValue = current[key] as number | null

    if (currentValue === null) {
      return {
        parameter: name,
        current_value: null,
        previous_value: null,
        trend_direction: 'insufficient_data',
        trend_strength: 'weak',
        days_since_last_test: 0,
        recommendation: `${name} could not be read from current test strip.`,
      }
    }

    // Get the most recent previous reading with this parameter
    const previousReading = readings.find(r => r[key] !== null)
    const previousValue = previousReading ? (previousReading[key] as number) : null

    if (previousValue === null) {
      return {
        parameter: name,
        current_value: currentValue,
        previous_value: null,
        trend_direction: 'insufficient_data',
        trend_strength: 'weak',
        days_since_last_test: 0,
        recommendation: `Establish baseline for ${name} by testing regularly.`,
      }
    }

    const daysSinceLastTest = previousReading
      ? Math.floor(
          (new Date(current.timestamp).getTime() - new Date(previousReading.timestamp).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

    // Calculate trend
    const difference = currentValue - previousValue
    const percentChange = Math.abs(difference / previousValue) * 100

    let trend_direction: TrendAnalysis['trend_direction'] = 'stable'
    let trend_strength: TrendAnalysis['trend_strength'] = 'weak'

    const threshold = this.getTrendThreshold(key as string)

    if (Math.abs(difference) > threshold) {
      trend_direction = difference > 0 ? 'increasing' : 'decreasing'

      if (percentChange > 20) trend_strength = 'strong'
      else if (percentChange > 10) trend_strength = 'moderate'
      else trend_strength = 'weak'
    }

    const recommendation = this.generateParameterRecommendation(
      name,
      key as string,
      currentValue,
      previousValue,
      trend_direction,
      daysSinceLastTest
    )

    return {
      parameter: name,
      current_value: currentValue,
      previous_value: previousValue,
      trend_direction,
      trend_strength,
      days_since_last_test: daysSinceLastTest,
      recommendation,
    }
  }

  private static getTrendThreshold(parameter: string): number {
    const thresholds: Record<string, number> = {
      ph: 0.2,
      free_chlorine: 0.5,
      total_alkalinity: 10,
      cyanuric_acid: 5,
      total_hardness: 20,
    }
    return thresholds[parameter] || 1
  }

  private static generateParameterRecommendation(
    name: string,
    key: string,
    current: number,
    previous: number,
    trend: TrendAnalysis['trend_direction'],
    days: number
  ): string {
    const direction = trend === 'increasing' ? 'rising' : 'falling'

    if (trend === 'stable') {
      return `${name} is stable at ${current}${this.getUnit(key)}. Good consistency!`
    }

    if (days > 7) {
      return `${name} is ${direction} from ${previous} to ${current}${this.getUnit(key)} over ${days} days. Consider more frequent testing.`
    }

    // Parameter-specific recommendations
    switch (key) {
      case 'ph':
        if (trend === 'increasing' && current > 7.6) {
          return `pH trending up (${previous}→${current}). Add pH decreaser before it gets too high.`
        } else if (trend === 'decreasing' && current < 7.0) {
          return `pH trending down (${previous}→${current}). Add pH increaser to prevent acidity.`
        }
        break

      case 'free_chlorine':
        if (trend === 'decreasing' && current < 1.0) {
          return `Chlorine dropping fast (${previous}→${current} ppm). Add chlorine immediately.`
        } else if (trend === 'increasing' && current > 3.0) {
          return `Chlorine building up (${previous}→${current} ppm). Reduce dosing or increase circulation.`
        }
        break
    }

    return `${name} ${direction} from ${previous} to ${current}${this.getUnit(key)}. Monitor closely.`
  }

  private static getUnit(parameter: string): string {
    return parameter === 'ph' ? '' : ' ppm'
  }

  private static assessOverallHealth(
    trends: TrendAnalysis[]
  ): HistoricalContext['overall_pool_health'] {
    if (trends.length === 0) return 'good'

    const problematicTrends = trends.filter(
      t =>
        t.recommendation.toLowerCase().includes('immediately') ||
        t.recommendation.toLowerCase().includes('add') ||
        t.trend_strength === 'strong'
    )

    if (problematicTrends.length >= 3) return 'poor'
    if (problematicTrends.length >= 2) return 'needs_attention'
    if (problematicTrends.length >= 1) return 'good'
    return 'excellent'
  }

  private static generateMaintenanceInsights(
    trends: TrendAnalysis[],
    _readings: HistoricalReading[]
  ): string[] {
    const insights: string[] = []

    // Check testing frequency
    if (_readings.length > 1) {
      const avgDaysBetweenTests =
        _readings.slice(0, 3).reduce((sum, reading, index) => {
          if (index === 0) return sum
          const prevReading = _readings[index - 1]
          const days = Math.floor(
            (new Date(prevReading.timestamp).getTime() - new Date(reading.timestamp).getTime()) /
              (1000 * 60 * 60 * 24)
          )
          return sum + days
        }, 0) / Math.max(1, _readings.length - 1)

      if (avgDaysBetweenTests > 10) {
        insights.push(
          'Consider testing more frequently (every 3-7 days) for better trend tracking.'
        )
      }
    }

    // Check for concerning patterns
    const strongTrends = trends.filter(t => t.trend_strength === 'strong')
    if (strongTrends.length > 0) {
      insights.push(
        `Strong trends detected in: ${strongTrends.map(t => t.parameter).join(', ')}. May indicate systematic issue.`
      )
    }

    // Seasonal recommendations
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 5 && currentMonth <= 8) {
      // Summer months
      insights.push('Summer requires more frequent testing due to increased bather load and heat.')
    } else if (currentMonth >= 11 || currentMonth <= 2) {
      // Winter months
      insights.push("Winter maintenance allows less frequent testing, but don't skip completely.")
    }

    if (insights.length === 0) {
      insights.push('Your pool chemistry trends look good. Keep up the regular testing!')
    }

    return insights
  }

  private static generateNextTestRecommendation(trends: TrendAnalysis[]): string {
    const urgentTrends = trends.filter(
      t => t.recommendation.toLowerCase().includes('immediately') || t.trend_strength === 'strong'
    )

    if (urgentTrends.length > 0) {
      return 'Test again in 1-2 days to verify chemical adjustments are working.'
    }

    const moderateTrends = trends.filter(t => t.trend_strength === 'moderate')
    if (moderateTrends.length > 0) {
      return 'Test again in 3-4 days to monitor trending parameters.'
    }

    return 'Continue regular testing schedule (weekly recommended).'
  }

  static mockHistoricalData(): HistoricalReading[] {
    // Fallback data for demo purposes or when database is unavailable
    const now = new Date()
    return [
      {
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        ph: 7.4,
        free_chlorine: 2.1,
        total_alkalinity: 95,
        cyanuric_acid: 45,
        total_hardness: 220,
        confidence_score: 0.92,
      },
      {
        timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        ph: 7.6,
        free_chlorine: 1.8,
        total_alkalinity: 105,
        cyanuric_acid: 42,
        total_hardness: 215,
        confidence_score: 0.88,
      },
      {
        timestamp: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
        ph: 7.8,
        free_chlorine: 1.2,
        total_alkalinity: 110,
        cyanuric_acid: 40,
        total_hardness: 200,
        confidence_score: 0.85,
      },
    ]
  }
}

export type { HistoricalReading, TrendAnalysis, HistoricalContext }
