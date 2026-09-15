// Painel inicial da area administrativa com indicadores e atalhos de gestao.
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Users, LogOut, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks";
import { carService } from "@/services/carService";
import { sellerService } from "@/services/sellerService";
import { Vehicle, Seller } from "@/types";
import toast from "react-hot-toast";

export const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [carsData, sellersData] = await Promise.all([
        carService.getAllCars(),
        sellerService.getAllSellers(),
      ]);
      setCars(carsData);
      setSellers(sellersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      const message =
        "Não foi possível carregar os dados. Verifique se as tabelas do banco de dados já foram criadas no Supabase.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white font-montserrat">
            JR VEÍCULOS - Admin
          </h1>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg border border-dark-600 px-4 py-2 text-dark-200 transition-colors hover:border-dark-400 hover:text-white font-poppins"
            >
              <ExternalLink size={18} />
              Voltar para o site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 font-poppins"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-dark-300 font-poppins">Carregando...</p>
          </div>
        ) : (
          <>
            {loadError && (
              <div className="mb-8 flex items-start gap-3 rounded-lg border border-red-600/50 bg-red-950/40 p-4">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <p className="text-sm text-red-300 font-poppins">{loadError}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-400 font-poppins text-sm">
                      Total de Carros
                    </p>
                    <p className="text-4xl font-bold text-white font-montserrat">
                      {cars.length}
                    </p>
                  </div>
                  <Car size={48} className="text-primary-600 opacity-20" />
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-400 font-poppins text-sm">
                      Total de Vendedores
                    </p>
                    <p className="text-4xl font-bold text-white font-montserrat">
                      {sellers.length}
                    </p>
                  </div>
                  <Users size={48} className="text-primary-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/admin/carros"
                className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-600 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-600/20 rounded-lg group-hover:bg-primary-600/30 transition-colors">
                    <Car size={32} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-montserrat">
                      Gerenciar Carros
                    </h3>
                    <p className="text-dark-400 font-poppins text-sm">
                      Adicionar, editar ou excluir carros
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/vendedores"
                className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-600 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-600/20 rounded-lg group-hover:bg-primary-600/30 transition-colors">
                    <Users size={32} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-montserrat">
                      Gerenciar Vendedores
                    </h3>
                    <p className="text-dark-400 font-poppins text-sm">
                      Adicionar, editar ou excluir vendedores
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
