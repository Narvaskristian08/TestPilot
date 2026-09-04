import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from './constants';

// Check if Supabase is configured
const isConfigured = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

if (!isConfigured) {
  console.warn('');
  console.warn('╔════════════════════════════════════════════════════════════╗');
  console.warn('║  ⚠️  SUPABASE NOT CONFIGURED                               ║');
  console.warn('╚════════════════════════════════════════════════════════════╝');
  console.warn('');
  console.warn('Authentication features are DISABLED.');
  console.warn('Only guest mode will work (3 QA runs per IP).');
  console.warn('');
  console.warn('To enable authentication:');
  console.warn('1. Create a Supabase project at https://supabase.com');
  console.warn('2. Copy your credentials from Settings → API');
  console.warn('3. Add to backend/.env:');
  console.warn('   SUPABASE_URL=https://xxxxx.supabase.co');
  console.warn('   SUPABASE_ANON_KEY=eyJhbGc...');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...');
  console.warn('');
}

// Create a dummy client that provides helpful error messages
const createDummyClient = (): SupabaseClient => {
  const handler = {
    get: (target: any, prop: string) => {
      if (prop === 'auth') {
        return {
          getUser: () => Promise.reject(new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env')),
          signUp: () => Promise.reject(new Error('Supabase not configured')),
          signIn: () => Promise.reject(new Error('Supabase not configured')),
        };
      }
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    }
  };
  return new Proxy({} as SupabaseClient, handler);
};

// Client for verifying auth tokens (uses anon key)
export const supabase = isConfigured
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createDummyClient();

// Admin client for user management (uses service role key)
export const supabaseAdmin = isConfigured && CONFIG.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createDummyClient();

export default supabase;

// Export helper to check if Supabase is available
export const isSupabaseConfigured = () => isConfigured;
