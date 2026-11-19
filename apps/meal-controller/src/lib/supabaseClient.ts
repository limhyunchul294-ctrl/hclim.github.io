import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Optional Supabase client (EVKMC portal project).
 * Meal-controller split pairing no longer depends on this — the previous
 * project host `sesedcotooihnpjklqzs.supabase.co` resolves NXDOMAIN, so room
 * sync uses MQTT (`mqttRoomClient.ts`) instead.
 *
 * If you later restore a Realtime project, set VITE_SUPABASE_URL / ANON_KEY;
 * pairing still uses MQTT unless the transport is switched back intentionally.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase 설정이 없어요. 기기 나누기는 기본 MQTT 연결을 써요.',
    )
  }
  if (!client) {
    client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
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
