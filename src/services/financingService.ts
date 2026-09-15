// Servico de persistencia para solicitacoes de financiamento enviadas pelo site.
import { supabase, TABLES } from '@/config/supabase';
import { Financing } from '@/types';

export const financingService = {
  /**
   * Criar solicitação de financiamento
   */
  async createFinancingRequest(
    financing: Omit<Financing, 'id' | 'criado_em'>
  ): Promise<Financing> {
    try {
      const { data, error } = await supabase
        .from(TABLES.FINANCINGS)
        .insert([financing])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar solicitação de financiamento:', error);
      throw error;
    }
  },
};
