// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuração para desenvolvimento (valores mockados)
const mockSupabase = {
  auth: {
    signUp: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ error: null })
  }),
  rpc: async () => ({ data: null, error: null })
};

// Exporta cliente real se tiver configurado, ou mock se não
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'sua_url_do_supabase') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;

console.log('Supabase configurado:', supabaseUrl ? '✓' : '⚠️ (modo desenvolvimento)');