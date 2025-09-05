interface WeatherData {
  temperature: number
  humidity: number
  uv_index: number
  conditions: string
  location: string
}

interface WeatherRecommendations {
  chlorine_adjustment: string
  maintenance_priority: string
  testing_frequency: string
  weather_notes: string
}

export class WeatherService {
  private static readonly WEATHER_API_KEY = process.env.WEATHER_API_KEY
  private static readonly WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
  private static readonly UV_API_URL = 'https://api.openweathermap.org/data/2.5/uvi'
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY_MS = 1000

  static async getWeatherData(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      if (!this.WEATHER_API_KEY) {
        console.warn('Weather API key not configured')
        return null
      }

      // Fetch current weather data with retry logic
      const weatherData = await this.fetchWithRetry(
        `${this.WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${this.WEATHER_API_KEY}&units=imperial`
      )

      // Fetch UV Index data with retry logic
      let uvIndex = 0
      try {
        const uvData = await this.fetchWithRetry(
          `${this.UV_API_URL}?lat=${latitude}&lon=${longitude}&appid=${this.WEATHER_API_KEY}`
        )
        uvIndex = (uvData as { value?: number }).value || 0
      } catch (uvError) {
        console.warn('UV Index data unavailable, using fallback:', uvError)
        // Use weather condition as UV fallback estimate
        const weatherResponse = weatherData as { weather: [{ main: string }] }
        const condition = weatherResponse.weather[0].main.toLowerCase()
        if (condition.includes('clear')) uvIndex = 7
        else if (condition.includes('cloud')) uvIndex = 4
        else uvIndex = 2
      }

      const weatherResponse = weatherData as {
        main: { temp: number; humidity: number }
        weather: [{ main: string }]
        name: string
        sys: { country: string }
      }

      return {
        temperature: Math.round(weatherResponse.main.temp),
        humidity: weatherResponse.main.humidity,
        uv_index: Math.round(uvIndex),
        conditions: weatherResponse.weather[0].main.toLowerCase(),
        location: `${weatherResponse.name}, ${weatherResponse.sys.country}`,
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
      return null
    }
  }

  private static async fetchWithRetry(
    url: string,
    attempt: number = 1
  ): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        console.warn(
          `API call failed (attempt ${attempt}/${this.MAX_RETRY_ATTEMPTS}), retrying...`,
          error
        )
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS * attempt))
        return this.fetchWithRetry(url, attempt + 1)
      }

      throw error
    }
  }

  static generateWeatherRecommendations(weatherData: WeatherData): WeatherRecommendations {
    const { temperature, humidity, uv_index, conditions } = weatherData

    let chlorine_adjustment = ''
    let maintenance_priority = 'normal'
    let testing_frequency = 'weekly'
    let weather_notes = ''

    // Temperature-based recommendations
    if (temperature > 85) {
      chlorine_adjustment =
        'Consider increasing chlorine by 20-30% due to high temperature accelerating chlorine consumption.'
      maintenance_priority = 'high'
      testing_frequency = 'every 2-3 days'
      weather_notes = 'High temperatures increase bather load and chemical consumption.'
    } else if (temperature < 60) {
      chlorine_adjustment = 'Lower temperatures may require less frequent chlorination adjustments.'
      maintenance_priority = 'low'
      weather_notes = 'Cool weather reduces chemical consumption and algae growth.'
    } else {
      chlorine_adjustment = 'Current temperature is ideal for standard chlorine maintenance.'
    }

    // UV Index considerations
    if (uv_index > 7) {
      chlorine_adjustment +=
        ' High UV levels will rapidly break down chlorine - consider stabilizer levels.'
      maintenance_priority = 'high'
      testing_frequency = 'daily during peak sun hours'
    } else if (uv_index > 3) {
      chlorine_adjustment += ' Moderate UV exposure - monitor chlorine levels regularly.'
    }

    // Weather condition adjustments
    if (conditions.includes('rain') || conditions.includes('storm')) {
      chlorine_adjustment += ' Rain dilutes chemicals and adds contaminants - test after rainfall.'
      maintenance_priority = 'high'
      testing_frequency = 'immediately after rain'
      weather_notes += ' Rain can affect water chemistry significantly.'
    } else if (conditions.includes('wind')) {
      weather_notes += ' Windy conditions may increase debris and evaporation.'
    }

    // Humidity considerations
    if (humidity > 70) {
      weather_notes +=
        ' High humidity may increase bather comfort but can affect chemical evaporation rates.'
    } else if (humidity < 30) {
      weather_notes += ' Low humidity increases evaporation - monitor water levels.'
    }

    return {
      chlorine_adjustment,
      maintenance_priority,
      testing_frequency,
      weather_notes: weather_notes.trim(),
    }
  }

  static async getLocationBasedRecommendations(
    latitude: number,
    longitude: number
  ): Promise<WeatherRecommendations | null> {
    const weatherData = await this.getWeatherData(latitude, longitude)

    if (!weatherData) {
      return null
    }

    return this.generateWeatherRecommendations(weatherData)
  }
}

export type { WeatherData, WeatherRecommendations }
