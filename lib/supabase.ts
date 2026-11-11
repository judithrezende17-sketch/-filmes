import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Strips any non-ASCII characters, invisible unicode, zero-width spaces,
 * smart quotes, and whitespace from Supabase URLs and API keys.
 * This guarantees the browser's RequestInit headers never fail ISO-8859-1 validation.
 */
export const cleanAsciiString = (val?: string | null): string => {
  if (!val) return '';
  return val
    // Replace smart/curly quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    // Strip zero-width spaces and Byte Order Marks
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    // Remove any character with code point > 127 (non-ASCII)
    .replace(/[^\x21-\x7E]/g, '')
    .trim();
};

// Permanent verified Supabase project credentials provided by user
export const SUPABASE_URL = cleanAsciiString(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ledxptmjvmabbqofrhex.supabase.co'
);

export const SUPABASE_ANON_KEY = cleanAsciiString(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AHkSthhKC4anc4Jx-vIEMg_3utHZjxV'
);

// Clear any stale or corrupted localStorage keys from older sessions
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('supabase_override_url');
    localStorage.removeItem('supabase_override_anon_key');
  } catch {
    // Ignore restricted environments
  }
}

export const getSupabaseCredentials = () => {
  return {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
  };
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
};

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          fetch: (input, init) => {
            // Protect against "String contains non ISO-8859-1 code point" in browser headers
            if (init && init.headers) {
              try {
                const cleanedHeaders = new Headers();
                if (init.headers instanceof Headers) {
                  init.headers.forEach((val, name) => {
                    cleanedHeaders.set(name, val.replace(/[^\x00-\xFF]/g, ''));
                  });
                } else if (Array.isArray(init.headers)) {
                  for (const [k, v] of init.headers) {
                    cleanedHeaders.set(k, String(v).replace(/[^\x00-\xFF]/g, ''));
                  }
                } else if (typeof init.headers === 'object') {
                  for (const [k, v] of Object.entries(init.headers)) {
                    cleanedHeaders.set(k, String(v).replace(/[^\x00-\xFF]/g, ''));
                  }
                }
                init.headers = cleanedHeaders;
              } catch (e) {
                console.warn('Header sanitization notice:', e);
              }
            }
            return fetch(input, init);
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      // Fallback instance without custom fetch if fetch wrapper fails
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }

  return supabaseInstance;
};

export const setSupabaseCustomCredentials = (_url: string, _key: string) => {
  // Always maintain official credentials
  supabaseInstance = null;
};
