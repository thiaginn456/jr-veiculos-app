// Formulario administrativo para criar ou editar vendedores.
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { sellerService } from "@/services/sellerService";
import toast from "react-hot-toast";

export const AdminSellerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    ativo: true,
  });

  useEffect(() => {
    if (id) {
      loadSeller();
    }
  }, [id]);

  const loadSeller = async () => {
    try {
      const seller = await sellerService.getSellerById(id!);
      if (seller) {
        setForm({
          nome: seller.nome,
          whatsapp: seller.whatsapp,
          ativo: seller.ativo,
        });
      } else {
        toast.error("Vendedor não encontrado");
        navigate("/admin/vendedores");
      }
    } catch (error) {
      toast.error("Erro ao carregar vendedor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (id) {
        await sellerService.updateSeller(id, form);
        toast.success("Vendedor atualizado com sucesso");
      } else {
        await sellerService.createSeller(form);
        toast.success("Vendedor adicionado com sucesso");
      }
      navigate("/admin/vendedores");
    } catch (error) {
      toast.error("Erro ao salvar vendedor");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-dark-300 font-poppins">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/admin/vendedores"
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white font-montserrat">
            {id ? "Editar Vendedor" : "Novo Vendedor"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-dark-800 rounded-lg p-8 border border-dark-700 space-y-6"
        >
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
              Nome
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="ex: João Silva"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
              required
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
              WhatsApp
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="ex: 11 99999-9999"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-white font-poppins cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                className="w-4 h-4"
              />
              Ativo
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-dark-700">
            <Link
              to="/admin/vendedores"
              className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors font-poppins font-semibold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white rounded-lg transition-colors font-poppins font-semibold"
            >
              {isSaving ? "Salvando..." : id ? "Atualizar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
