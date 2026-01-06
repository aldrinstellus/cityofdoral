import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for server-side operations (API routes)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  priority: 'low' | 'medium' | 'high'
  views: number
  helpful: number
  not_helpful: number
  status: 'active' | 'inactive'
  url?: string
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent'
  start_date: string
  end_date: string
  target_audience: 'all' | 'residents' | 'businesses'
  language: 'en' | 'es' | 'both'
  is_active: boolean
  views: number
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  session_id: string
  start_time: string
  end_time?: string
  messages: unknown[]
  language: 'en' | 'es'
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
  escalated: boolean
  feedback_given: boolean
  channel: 'web' | 'ivr' | 'sms' | 'facebook' | 'instagram' | 'whatsapp'
  user_id?: string
  user_agent?: string
  referrer?: string
  created_at: string
}

export interface Feedback {
  id: string
  message_id: string
  conversation_id: string
  rating: 'positive' | 'negative'
  query?: string
  response?: string
  language: 'en' | 'es'
  created_at: string
}

export interface Escalation {
  id: string
  session_id: string
  user_name: string
  contact_method: 'email' | 'phone'
  contact_value: string
  reason: string
  status: 'pending' | 'in_progress' | 'resolved'
  requested_at: string
  assigned_to?: string
  resolved_at?: string
  notes: string
}

export interface Notification {
  id: string
  type: 'system' | 'activity' | 'reminder'
  category: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  link?: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditLog {
  id: string
  timestamp: string
  user_name: string
  action: string
  resource: string
  resource_id: string
  details: Record<string, unknown>
  ip_address?: string
}

export interface Settings {
  id: string
  general: Record<string, unknown>
  chatbot: Record<string, unknown>
  appearance: Record<string, unknown>
  llm: Record<string, unknown>
  notifications: Record<string, unknown>
  integration: Record<string, unknown>
  integrations: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  section: string
  url?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  filename: string
  original_name: string
  type: 'pdf' | 'docx' | 'txt'
  size: number
  chunks: number
  storage_path?: string
  uploaded_at: string
}

export interface CrawlerUrl {
  id: string
  url: string
  full_url: string
  title: string
  section: string
  enabled: boolean
  is_custom: boolean
  language: 'en' | 'es'
  last_crawled?: string
  last_status: 'success' | 'error' | 'pending' | 'never'
  created_at: string
}
