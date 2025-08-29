import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbvijawoyprsgmlobzsz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtidmlqYXdveXByc2dtbG9ienN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MzA2MDAsImV4cCI6MjA3MjAwNjYwMH0.Jxw7xUS9nLn-6vYWR2B0w_FKzYxV0d9twz9qdnfeoeI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type EnhancementType = 'upscale' | 'denoise' | 'sharpen' | 'restore'

export interface UserProfile {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  plan_type: string
  credits_remaining: number
  total_processed: number
  created_at: string
  updated_at: string
}

export interface ImageEnhancement {
  id: string
  user_id: string
  original_image_url: string
  enhanced_image_url?: string
  enhancement_type: EnhancementType
  scale_factor: number
  file_size_original?: number
  file_size_enhanced?: number
  processing_status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed'
  processing_time_seconds?: number
  error_message?: string
  created_at: string
  completed_at?: string
}