// Servico de persistencia para consulta e manutencao de vendedores.
import { supabase, TABLES } from '@/config/supabase';
import { Seller } from '@/types';

export const sellerService = {
  /**
   * Verificar se existe algum vendedor ativo para receber contatos
   */
  async hasActiveSellers(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SELLERS)
        .select('id')
        .eq('ativo', true)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Erro ao verificar vendedores:', error);
      throw error;
    }
  },

  /**
   * Obter um vendedor ativo aleatoriamente para distribuir os contatos
   */
  async getRandomActiveSeller(): Promise<Seller | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SELLERS)
        .select('*')
        .eq('ativo', true);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data[Math.floor(Math.random() * data.length)];
    } catch (error) {
      console.error('Erro ao sortear vendedor:', error);
      throw error;
    }
  },

  /**
   * Obter todos os vendedores
   */
  async getAllSellers(): Promise<Seller[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SELLERS)
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      throw error;
    }
  },

  /**
   * Obter um vendedor por ID
   */
  async getSellerById(id: string): Promise<Seller | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SELLERS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar vendedor:', error);
      throw error;
    }
  },

  /**
   * Criar novo vendedor
   */
  async createSeller(seller: Omit<Seller, 'id' | 'criado_em' | 'atualizado_em'>): Promise<Seller> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SELLERS)
        .insert([seller])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      throw error;
    }
  },

  /**
   * Atualizar vendedor
   */
  async updateSeller(id: string, seller: Partial<Seller>): Promise<Seller> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SELLERS)
        .update({ ...seller, atualizado_em: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      throw error;
    }
  },

  /**
   * Deletar vendedor
   */
  async deleteSeller(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.SELLERS)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      throw error;
    }
  },

  /**
   * Ativar/Desativar vendedor
   */
  async toggleSellerStatus(id: string, ativo: boolean): Promise<Seller> {
    return this.updateSeller(id, { ativo });
  },
};
