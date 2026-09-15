// Servico de persistencia para as operacoes administrativas de veiculos.
import { supabase, BUCKETS, TABLES } from '@/config/supabase';
import { Vehicle } from '@/types';

export const carService = {
  /**
   * Obter todos os carros
   */
  async getAllCars(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.VEHICLES)
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar carros:', error);
      throw error;
    }
  },

  /**
   * Obter um carro por ID
   */
  async getCarById(id: string): Promise<Vehicle | null> {
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
      console.error('Erro ao buscar carro:', error);
      throw error;
    }
  },

  /**
   * Criar novo carro
   */
  async createCar(car: Omit<Vehicle, 'id' | 'criado_em' | 'atualizado_em'>): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from(TABLES.VEHICLES)
        .insert([car])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar carro:', error);
      throw error;
    }
  },

  /**
   * Atualizar carro
   */
  async updateCar(id: string, car: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from(TABLES.VEHICLES)
        .update({ ...car, atualizado_em: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar carro:', error);
      throw error;
    }
  },

  /**
   * Deletar carro
   */
  async deleteCar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.VEHICLES)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar carro:', error);
      throw error;
    }
  },

  /**
   * Upload de imagem para Supabase Storage
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(BUCKETS.VEHICLE_IMAGES)
        .upload(`public/${fileName}`, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from(BUCKETS.VEHICLE_IMAGES)
        .getPublicUrl(`public/${fileName}`);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error);
      throw error;
    }
  },
};
