const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

// Frontend configuration
const apiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || '');

export const config = {
  // API URL - defaults to relative path for same-origin requests
  apiUrl,

  // Socket.IO URL - defaults to the API URL, then same-origin for local previews
  socketUrl: trimTrailingSlash(
    import.meta.env.VITE_SOCKET_URL ||
      apiUrl ||
      (typeof window !== 'undefined' ? window.location.origin : '')
  ),
  
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
