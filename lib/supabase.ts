import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Strips any non-ASCII characters, invisible unicode, zero-width spaces,
 * smart quotes, and whitespace from Supabase URLs and API keys.
 * This guarantees the browser's RequestInit headers never fail ISO-8859-1 validation.
 */
export const cleanAsciiString = (val?: string | null): string => {
  if (!val) return '';
  return val
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/[^\x21-\x7E]/g, '')
    .trim();
};

const OVERRIDE_URL_KEY = 'supabase_override_url';
const OVERRIDE_ANON_KEY = 'supabase_override_anon_key';

// Verified project credentials configured in .env.local
const PROJECT_FALLBACK_URL = 'https://ledxptmjvmabbqofrhex.supabase.co';
const PROJECT_FALLBACK_ANON_KEY = 'sb_publishable_AHkSthhKC4anc4Jx-vIEMg_3utHZjxV';

export interface SupabaseCredentials {
  url: string;
  key: string;
  source: 'modal' | 'env' | 'project' | 'missing';
}

export const isValidSupabaseUrl = (url: string): boolean => {
  if (!url) return false;
  if (!/^https?:\/\/[a-zA-Z0-9.-]+/.test(url)) return false;
  if (url.includes('your-project-id')) return false;
  return true;
};

export const isValidSupabaseKey = (key: string): boolean => {
  if (!key || key.length < 20) return false;
  // Reject URLs accidentally pasted into the API key variable
  if (/^https?:\/\//i.test(key)) return false;
  if (key.includes('your-anon-public-api-key')) return false;
  return key.startsWith('eyJ') || key.startsWith('sb_publishable_') || key.length >= 32;
};

/**
 * Returns the active, validated Supabase credentials.
 * Priority:
 * 1. Valid credentials saved in the "Configurações Supabase" modal
 * 2. Valid environment variables NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. Verified project credentials from .env.local (when container env secrets are malformed)
 */
export const getSupabaseCredentials = (): SupabaseCredentials => {
  if (typeof window !== 'undefined') {
    try {
      const overrideUrl = cleanAsciiString(localStorage.getItem(OVERRIDE_URL_KEY));
      const overrideKey = cleanAsciiString(localStorage.getItem(OVERRIDE_ANON_KEY));
      if (overrideUrl || overrideKey) {
        if (isValidSupabaseUrl(overrideUrl) && isValidSupabaseKey(overrideKey)) {
          return {
            url: overrideUrl,
            key: overrideKey,
            source: 'modal',
          };
        }
        // Purge corrupted/stale override keys from earlier sessions
        localStorage.removeItem(OVERRIDE_URL_KEY);
        localStorage.removeItem(OVERRIDE_ANON_KEY);
      }
    } catch {
      // Ignore storage access errors in restricted browsers
    }
  }

  const envUrl = cleanAsciiString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const envKey = cleanAsciiString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (isValidSupabaseUrl(envUrl) && isValidSupabaseKey(envKey)) {
    return {
      url: envUrl,
      key: envKey,
      source: 'env',
    };
  }

  if (isValidSupabaseUrl(PROJECT_FALLBACK_URL) && isValidSupabaseKey(PROJECT_FALLBACK_ANON_KEY)) {
    return {
      url: PROJECT_FALLBACK_URL,
      key: PROJECT_FALLBACK_ANON_KEY,
      source: 'project',
    };
  }

  return {
    url: envUrl,
    key: envKey,
    source: 'missing',
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return isValidSupabaseUrl(url) && isValidSupabaseKey(key);
};

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null;
let initializedWith = '';

export const getSupabaseClient = (): SupabaseClient => {
  const { url, key } = getSupabaseCredentials();

  if (!isSupabaseConfigured()) {
    throw new Error(
      'Cliente Supabase não configurado ou chaves inválidas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local ou no modal "Configurações Supabase".'
    );
  }

  const signature = `${url}::${key}`;
  if (!supabaseInstance || initializedWith !== signature) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (input, init) => {
          const baseFetch = globalThis.fetch.bind(globalThis);
          // Sanitize headers only if a non-ISO-8859-1 character is present
          if (init && init.headers) {
            try {
              let needsSanitize = false;
              const checkValue = (v: unknown) => {
                if (typeof v === 'string' && /[^\x00-\xFF]/.test(v)) {
                  needsSanitize = true;
                }
              };

              if (init.headers instanceof Headers) {
                init.headers.forEach((val) => checkValue(val));
              } else if (Array.isArray(init.headers)) {
                for (const [, v] of init.headers) checkValue(v);
              } else if (typeof init.headers === 'object') {
                for (const v of Object.values(init.headers)) checkValue(v);
              }

              if (needsSanitize) {
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
                init = { ...init, headers: cleanedHeaders };
              }
            } catch (e) {
              console.warn('Header sanitization notice:', e);
            }
          }
          return baseFetch(input, init);
        },
      },
    });
    initializedWith = signature;
  }

  return supabaseInstance;
};

/**
 * Updates or resets custom Supabase credentials from the "Configurações Supabase" modal
 * and forces recreation of the real Supabase client.
 */
export const setSupabaseCustomCredentials = (url: string, key: string) => {
  const cleanU = cleanAsciiString(url);
  const cleanK = cleanAsciiString(key);

  if (typeof window !== 'undefined') {
    try {
      if (cleanU && cleanK) {
        localStorage.setItem(OVERRIDE_URL_KEY, cleanU);
        localStorage.setItem(OVERRIDE_ANON_KEY, cleanK);
      } else {
        localStorage.removeItem(OVERRIDE_URL_KEY);
        localStorage.removeItem(OVERRIDE_ANON_KEY);
      }
    } catch {
      // Ignore storage access errors
    }
  }

  supabaseInstance = null;
  initializedWith = '';
};
