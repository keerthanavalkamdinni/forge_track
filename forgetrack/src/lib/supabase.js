import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export a dummy client if keys are not configured yet, to prevent app crash on startup
export const supabase = supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      auth: { getSession: async () => ({ data: { session: null }, error: null }) },
      from: () => ({ select: () => ({ eq: () => [] }) })
    };
