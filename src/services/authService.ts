// Servico responsavel pelas operacoes de login, logout e sessao administrativa.
import { supabase } from '@/config/supabase';

export const authService = {
  /**
   * Login com email e senha
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  /**
   * Obter usuário atual
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  },

  /**
   * Obter sessão atual
   */
  async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
  },

  /**
   * Registrar listener de mudança de autenticação
   */
  onAuthStateChange(callback: (isAuthenticated: boolean) => void) {
    return supabase.auth.onAuthStateChange((event) => {
      callback(event === 'SIGNED_IN');
    });
  },

  /**
   * Redefinir senha
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  },
};
