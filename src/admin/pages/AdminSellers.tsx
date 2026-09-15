// Pagina administrativa que lista e gerencia os vendedores cadastrados.
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronLeft } from "lucide-react";
import { sellerService } from "@/services/sellerService";
import { Seller } from "@/types";
import toast from "react-hot-toast";

export const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setIsLoading(true);
      const data = await sellerService.getAllSellers();
      setSellers(data);
    } catch (error) {
      toast.error("Erro ao carregar vendedores");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este vendedor?"))
      return;

    try {
      setDeletingId(id);
      await sellerService.deleteSeller(id);
      setSellers(sellers.filter((seller) => seller.id !== id));
      toast.success("Vendedor excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar vendedor");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAtivo = async (seller: Seller) => {
    try {
      setTogglingId(seller.id);
      const updated = await sellerService.toggleSellerStatus(
        seller.id,
        !seller.ativo,
      );
      setSellers((prev) =>
        prev.map((item) => (item.id === seller.id ? updated : item)),
      );
    } catch (error) {
      toast.error("Erro ao atualizar status do vendedor");
      console.error(error);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white font-montserrat">
              Gerenciar Vendedores
            </h1>
          </div>
          <Link
            to="/admin/vendedores/novo"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-poppins"
          >
            <Plus size={18} />
            Novo Vendedor
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-dark-300 font-poppins">
              Carregando vendedores...
            </p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-300 font-poppins mb-4">
              Nenhum vendedor cadastrado
            </p>
            <Link
              to="/admin/vendedores/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-poppins"
            >
              <Plus size={18} />
              Adicionar Primeiro Vendedor
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-600 transition-colors"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white font-montserrat">
                    {seller.nome}
                  </h3>
                  <p className="text-dark-400 font-poppins text-sm break-all">
                    {seller.whatsapp}
                  </p>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => handleToggleAtivo(seller)}
                    disabled={togglingId === seller.id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold font-poppins transition-colors disabled:opacity-50 ${
                      seller.ativo
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                    title="Clique para alternar o status"
                  >
                    {togglingId === seller.id
                      ? "Atualizando..."
                      : seller.ativo
                        ? "Ativo"
                        : "Inativo"}
                  </button>
                </div>

                <div className="flex gap-2 pt-4 border-t border-dark-700">
                  <Link
                    to={`/admin/vendedores/${seller.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-dark-700 rounded-lg transition-colors text-primary-500 font-poppins text-sm"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(seller.id)}
                    disabled={deletingId === seller.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500 font-poppins text-sm disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
