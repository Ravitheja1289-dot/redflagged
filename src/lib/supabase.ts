import { createClient } from '@supabase/supabase-js';

// The URL and Key are required
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use this strictly server-side for operations that bypass RLS
// e.g. checking an unapproved report, managing tokens.
export function getServiceSupabase() {
  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_SECRET_KEY is not set');
  }
  return createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY);
}
