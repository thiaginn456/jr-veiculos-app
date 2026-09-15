// Tela de autenticacao usada para acessar a area administrativa.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import toast from "react-hot-toast";

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/admin");
    } catch (error) {
      toast.error("Email ou senha incorretos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-800 rounded-lg p-8 border border-dark-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-montserrat mb-2">
            JR VEÍCULOS
          </h1>
          <p className="text-dark-400 font-poppins">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 transition-colors font-poppins"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 transition-colors font-poppins"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-semibold rounded-lg transition-colors font-poppins mt-6"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-dark-400 text-sm mt-6 font-poppins">
          Use uma conta administrativa cadastrada no Supabase.
        </p>
      </div>
    </div>
  );
};
