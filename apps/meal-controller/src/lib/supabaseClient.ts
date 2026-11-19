import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Public anon client for Realtime broadcast rooms only.
 * Same project as the EVKMC portal (key already shipped in public/js/config.js).
 */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  'https://sesedcotooihnpjklqzs.supabase.co'

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2VkY290b29paG5wamtscXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjA5ODAsImV4cCI6MjA3NDgzNjk4MH0.AcbNoC19S_shBKXXs6-2LOo0KSnZ_Mk1ZejZtUX1EmI'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: { eventsPerSecond: 12 },
      },
    })
  }
  return client
}
