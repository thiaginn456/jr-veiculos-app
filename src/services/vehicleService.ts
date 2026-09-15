// Servico publico de consulta de veiculos, filtros, ordenacao e paginacao.
import { supabase, TABLES } from '@/config/supabase';
import { Vehicle, VehicleFilters, PaginatedResponse } from '@/types';

const ITEMS_PER_PAGE = 12;

export const vehicleService = {
  /**
   * Obter todos os veículos com filtros
   */
  async getVehicles(
    filters?: VehicleFilters
  ): Promise<PaginatedResponse<Vehicle>> {
    try {
      let query = supabase
        .from(TABLES.VEHICLES)
        .select('*', { count: 'exact' })
        .eq('status', 'disponivel');

      // Aplicar filtros
      if (filters?.marca) {
        query = query.ilike('marca', `%${filters.marca}%`);
      }
      if (filters?.modelo) {
        query = query.ilike('modelo', `%${filters.modelo}%`);
      }
      if (filters?.ano_min) {
        query = query.gte('ano', filters.ano_min);
      }
      if (filters?.ano_max) {
        query = query.lte('ano', filters.ano_max);
      }
      if (filters?.preco_min) {
        query = query.gte('preco', filters.preco_min);
      }
      if (filters?.preco_max) {
        query = query.lte('preco', filters.preco_max);
      }
      if (filters?.combustivel) {
        query = query.eq('combustivel', filters.combustivel);
      }
      if (filters?.cambio) {
        query = query.eq('cambio', filters.cambio);
      }
      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }

      // Ordenação
      let orderBy = 'criado_em';
      let ascending = false;

      switch (filters?.ordem) {
        case 'preco_baixo':
          orderBy = 'preco';
          ascending = true;
          break;
        case 'preco_alto':
          orderBy = 'preco';
          ascending = false;
          break;
        case 'km_baixo':
          orderBy = 'km';
          ascending = true;
          break;
        default:
          orderBy = 'criado_em';
          ascending = false;
      }

      query = query.order(orderBy, { ascending });

      // Paginação
      const page = filters?.pagina || 1;
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        dados: data || [],
        paginacao: {
          total: count || 0,
          pagina: page,
          limite: ITEMS_PER_PAGE,
          total_paginas: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        },
      };
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      throw error;
    }
  },

  /**
   * Obter um veículo específico
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.VEHICLES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      throw error;
    }
  },

  /**
   * Obter veículos em destaque (para Home)
   */
  async getFeaturedVehicles(limit: number = 6): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.VEHICLES)
        .select('*')
        .eq('status', 'disponivel')
        .eq('destaque', true)
        .order('criado_em', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar veículos em destaque:', error);
      throw error;
    }
  },

  /**
   * Obter opções únicas para filtros
   */
  async getFilterOptions(): Promise<{
    marcas: string[];
    modelos: string[];
    anos: number[];
    categorias: string[];
    combustiveis: string[];
    cambios: string[];
  }> {
    try {
      const [marcas, modelos, anos, categorias, combustiveis, cambios] =
        await Promise.all([
          supabase
            .from(TABLES.VEHICLES)
            .select('marca')
            .eq('status', 'disponivel')
            .then(({ data }) =>
              [...new Set(data?.map((v) => v.marca))].filter(Boolean)
            ),
          supabase
            .from(TABLES.VEHICLES)
            .select('modelo')
            .eq('status', 'disponivel')
            .then(({ data }) =>
              [...new Set(data?.map((v) => v.modelo))].filter(Boolean)
            ),
          supabase
            .from(TABLES.VEHICLES)
            .select('ano')
            .eq('status', 'disponivel')
            .then(({ data }) =>
              [...new Set(data?.map((v) => v.ano))].filter(Boolean)
            ),
          supabase
            .from(TABLES.VEHICLES)
            .select('categoria')
            .eq('status', 'disponivel')
            .then(({ data }) =>
              [...new Set(data?.map((v) => v.categoria))].filter(Boolean)
            ),
          supabase
            .from(TABLES.VEHICLES)
            .select('combustivel')
            .eq('status', 'disponivel')
            .then(({ data }) =>
              [...new Set(data?.map((v) => v.combustivel))].filter(Boolean)
            ),
          supabase
            .from(TABLES.VEHICLES)
            .select('cambio')
            .eq('status', 'disponivel')
            .then(({ data }) =>
              [...new Set(data?.map((v) => v.cambio))].filter(Boolean)
            ),
        ]);

      return {
        marcas: marcas.sort() as string[],
        modelos: modelos.sort() as string[],
        anos: (anos as number[]).sort((a, b) => b - a),
        categorias: categorias.sort() as string[],
        combustiveis: combustiveis.sort() as string[],
        cambios: cambios.sort() as string[],
      };
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
      return {
        marcas: [],
        modelos: [],
        anos: [],
        categorias: [],
        combustiveis: [],
        cambios: [],
      };
    }
  },
};
