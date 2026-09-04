// Frontend configuration
export const config = {
  // API URL - defaults to relative path for same-origin requests
  apiUrl: import.meta.env.VITE_API_URL || '',
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(config.supabase.url && config.supabase.anonKey);
};
