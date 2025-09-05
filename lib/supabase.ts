import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public environment variables')
}

// Browser client for client-side operations (authentication, real-time)
export const createSupabaseBrowserClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server client for server-side rendering
export const createSupabaseServerClient = () =>
  createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: () => {
        // This will be used in server components
        return undefined
      },
      set: () => {
        // This will be used in server components
      },
      remove: () => {
        // This will be used in server components
      },
    },
  })

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Legacy client for backward compatibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      water_tests: {
        Row: {
          id: string
          unit_id: string
          user_id: string
          test_method: 'ai_vision' | 'manual_color' | 'manual_numeric'
          ph: number | null
          free_chlorine: number | null
          total_alkalinity: number | null
          cyanuric_acid: number | null
          total_hardness: number | null
          confidence_score: number | null
          image_url: string | null
          notes: string | null
          created_at: string
          user_feedback: boolean | null
        }
        Insert: {
          id?: string
          unit_id: string
          user_id: string
          test_method?: 'ai_vision' | 'manual_color' | 'manual_numeric'
          ph?: number | null
          free_chlorine?: number | null
          total_alkalinity?: number | null
          cyanuric_acid?: number | null
          total_hardness?: number | null
          confidence_score?: number | null
          image_url?: string | null
          notes?: string | null
          created_at?: string
          user_feedback?: boolean | null
        }
        Update: {
          id?: string
          unit_id?: string
          user_id?: string
          test_method?: 'ai_vision' | 'manual_color' | 'manual_numeric'
          ph?: number | null
          free_chlorine?: number | null
          total_alkalinity?: number | null
          cyanuric_acid?: number | null
          total_hardness?: number | null
          confidence_score?: number | null
          image_url?: string | null
          notes?: string | null
          created_at?: string
          user_feedback?: boolean | null
        }
      }
      units: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'pool' | 'spa' | 'hot_tub'
          volume_gallons: number
          sanitizer_type: 'chlorine' | 'bromine' | 'salt_water'
          is_favorite: boolean
          created_at: string
          updated_at: string
          equipment_details: Record<string, unknown>
        }
      }
    }
  }
}
