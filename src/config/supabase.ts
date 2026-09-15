// Configuracao central do cliente Supabase e dos nomes de tabelas usados pelos servicos.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de bucket
export const BUCKETS = {
  VEHICLE_IMAGES: 'fotos-carros',
  PROFILE_IMAGES: 'fotos-perfil',
} as const;

// Nomes das tabelas
export const TABLES = {
  VEHICLES: 'veiculos',
  SELLERS: 'vendedores',
  LEADS: 'leads',
  FINANCINGS: 'financiamentos',
  PROFILES: 'profiles',
  CONFIG: 'configuracoes',
} as const;
