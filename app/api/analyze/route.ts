import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { WeatherService } from '../../../lib/weather-service'
import { HistoricalAnalysis } from '../../../lib/historical-analysis'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const WaterTestResultSchema = z.object({
  ph: z.number().min(0).max(14).nullable(),
  free_chlorine: z.number().min(0).nullable(),
  total_alkalinity: z.number().min(0).nullable(),
  cyanuric_acid: z.number().min(0).nullable(),
  total_hardness: z.number().min(0).nullable(),
  confidence_score: z.number().min(0).max(1),
  brand_detected: z.string().optional(),
  brand_confidence: z.number().min(0).max(1).optional(),
  strip_type: z.string().optional(),
  notes: z.string().optional(),
  readable_strips: z.boolean(),
  error_message: z.string().optional(),
  individual_confidence: z.object({
    ph: z.number().min(0).max(1).optional(),
    free_chlorine: z.number().min(0).max(1).optional(),
    total_alkalinity: z.number().min(0).max(1).optional(),
    cyanuric_acid: z.number().min(0).max(1).optional(),
    total_hardness: z.number().min(0).max(1).optional(),
  }).optional()
})

type WaterTestResult = z.infer<typeof WaterTestResultSchema>

function isValidImageFormat(imageData: string): boolean {
  return imageData.startsWith('data:image/') && imageData.includes('base64,')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Extract optional location, historical data, and user context
    const { latitude, longitude, include_trends = false, user_id, unit_id } = body

    if (!isValidImageFormat(body.image)) {
      return NextResponse.json(
        { error: 'Invalid image format. Please provide a valid base64 image.' },
        { status: 400 }
      )
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = `You are an expert water chemistry analyst with extensive knowledge of different test strip brands. Analyze pool/spa test strips in images and extract chemical readings with brand recognition.

MULTI-BRAND RECOGNITION:
Identify the test strip brand from these common manufacturers:
- AquaChek (most common): 7-in-1, 4-in-1, Select series
- Poolmaster: Digital test strips, Smart Test strips  
- Taylor Technologies: K-1000, K-2006 series
- LaMotte: ColorQ, Insta-Test series
- HTH: 6-in-1 test strips
- Clorox: Pool&Spa test strips
- Generic/Store brands

BRAND-SPECIFIC ANALYSIS:
1. Look for brand logos, text, or distinctive color patterns
2. Each brand has different color charts and ranges
3. Provide brand confidence score (0-1) for detection accuracy
4. Note strip type (4-in-1, 6-in-1, 7-in-1, etc.)

ENHANCED CONFIDENCE SCORING:
1. Overall confidence (0-1) based on image quality and strip clarity
2. Individual parameter confidence for each chemical reading
3. Brand detection confidence separate from reading confidence
4. Consider lighting, focus, strip condition, and color chart visibility

CHEMICAL ANALYSIS:
Extract numerical values for: pH, Free Chlorine, Total Alkalinity, Cyanuric Acid, Total Hardness
- Compare colors to brand-specific reference charts when visible
- Account for brand variations in color standards
- Provide individual confidence scores for each reading

EXPECTED RANGES:
- pH: 7.0-7.6 (ideal), 6.8-8.2 (acceptable)
- Free Chlorine: 1.0-3.0 ppm (pools), 3.0-5.0 ppm (spas)
- Total Alkalinity: 80-120 ppm
- Cyanuric Acid: 30-50 ppm (pools with stabilized chlorine)
- Total Hardness: 150-300 ppm

Return ONLY valid JSON matching this exact structure:
{
  "ph": number | null,
  "free_chlorine": number | null,
  "total_alkalinity": number | null,
  "cyanuric_acid": number | null,
  "total_hardness": number | null,
  "confidence_score": number (0-1),
  "brand_detected": "string (brand name if recognizable)",
  "brand_confidence": number (0-1, confidence in brand detection),
  "strip_type": "string (e.g., '7-in-1', '4-in-1', 'pH-Chlorine')",
  "notes": "string (brand-specific insights and analysis notes)",
  "readable_strips": boolean,
  "error_message": "string (if any issues)",
  "individual_confidence": {
    "ph": number (0-1),
    "free_chlorine": number (0-1),
    "total_alkalinity": number (0-1),
    "cyanuric_acid": number (0-1),
    "total_hardness": number (0-1)
  }
}`

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this water test strip and provide the chemical readings in the specified JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: body.image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })

    const aiResponse = response.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI analysis' },
        { status: 500 }
      )
    }

    // Parse and validate AI response
    let analysisResult: WaterTestResult
    try {
      const parsedResponse = JSON.parse(aiResponse)
      analysisResult = WaterTestResultSchema.parse(parsedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({
        error: 'Failed to parse analysis results',
        raw_response: aiResponse
      }, { status: 500 })
    }

    // Get weather-based recommendations if location provided
    let weatherRecommendations = null
    if (latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number') {
      weatherRecommendations = await WeatherService.getLocationBasedRecommendations(latitude, longitude)
    }

    // Get historical context if requested
    let historicalContext = null
    if (include_trends) {
      // Fetch historical readings from database (with fallback to mock data)
      const historicalReadings = await HistoricalAnalysis.getHistoricalReadings(user_id, unit_id)
      const currentReading = {
        timestamp: new Date().toISOString(),
        ph: analysisResult.ph,
        free_chlorine: analysisResult.free_chlorine,
        total_alkalinity: analysisResult.total_alkalinity,
        cyanuric_acid: analysisResult.cyanuric_acid,
        total_hardness: analysisResult.total_hardness,
        confidence_score: analysisResult.confidence_score
      }
      historicalContext = HistoricalAnalysis.analyzeTrends(historicalReadings, currentReading)
      
      // Save current reading to database if user context available
      if (user_id && unit_id) {
        await HistoricalAnalysis.saveTestResult(currentReading, user_id, unit_id, body.image_url)
      }
    }

    // Return enhanced analysis with weather and trends
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      weather_recommendations: weatherRecommendations,
      historical_context: historicalContext,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'API endpoint ready',
    implemented: true,
    message: 'GPT-4 Vision analysis ready for POST requests',
    openai_configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  })
}