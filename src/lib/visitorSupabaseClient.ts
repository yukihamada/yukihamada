import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const cache = new Map<string, SupabaseClient<Database>>();

export function getVisitorSupabaseClient(visitorId: string) {
  const existing = cache.get(visitorId);
  if (existing) return existing;

  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  const client = createClient<Database>(url, key, {
    global: {
      headers: {
        'x-visitor-id': visitorId,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  cache.set(visitorId, client);
  return client;
}
