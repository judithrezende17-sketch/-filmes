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

export const getSupabaseCredentials = () => {
  let localUrl = '';
  let localKey = '';

  if (typeof window !== 'undefined') {
    try {
      const rawUrl = localStorage.getItem('supabase_override_url');
      const rawKey = localStorage.getItem('supabase_override_anon_key');
      localUrl = cleanAsciiString(rawUrl);
      localKey = cleanAsciiString(rawKey);

      // If localStorage had dirty characters, fix them
      if (rawUrl && rawUrl !== localUrl) localStorage.setItem('supabase_override_url', localUrl);
      if (rawKey && rawKey !== localKey) localStorage.setItem('supabase_override_anon_key', localKey);
    } catch {
      // Ignore localStorage access restrictions
    }
  }

  const envUrl = cleanAsciiString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const envKey = cleanAsciiString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return {
    url: localUrl || envUrl || 'https://ledxptmjvmabbqofrhex.supabase.co',
    key: localKey || envKey || 'sb_publishable_AHkSthhKC4anc4Jx-vIEMg_3utHZjxV',
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-public-api-key') &&
    url.startsWith('https://') &&
    key.length > 20
  );
};

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, key } = getSupabaseCredentials();

  if (!supabaseInstance || lastUrl !== url || lastKey !== key) {
    try {
      supabaseInstance = createClient(url, key, {
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
      lastUrl = url;
      lastKey = key;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
};

export const setSupabaseCustomCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    const cleanUrl = cleanAsciiString(url);
    const cleanKey = cleanAsciiString(key);

    if (cleanUrl && cleanKey) {
      localStorage.setItem('supabase_override_url', cleanUrl);
      localStorage.setItem('supabase_override_anon_key', cleanKey);
    } else {
      localStorage.removeItem('supabase_override_url');
      localStorage.removeItem('supabase_override_anon_key');
    }
    supabaseInstance = null; // force re-create
  }
};
