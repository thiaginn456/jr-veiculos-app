// Pagina administrativa que lista, filtra e gerencia os veiculos cadastrados.
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronLeft } from "lucide-react";
import { carService } from "@/services/carService";
import { Vehicle } from "@/types";
import toast from "react-hot-toast";

export const AdminCars: React.FC = () => {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setIsLoading(true);
      const data = await carService.getAllCars();
      setCars(data);
    } catch (error) {
      toast.error("Erro ao carregar carros");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este carro?")) return;

    try {
      setDeletingId(id);
      await carService.deleteCar(id);
      setCars(cars.filter((car) => car.id !== id));
      toast.success("Carro excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar carro");
      console.error(error);
    } finally {
      setDeletingId(null);
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
              Gerenciar Carros
            </h1>
          </div>
          <Link
            to="/admin/carros/novo"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-poppins"
          >
            <Plus size={18} />
            Novo Carro
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-dark-300 font-poppins">Carregando carros...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-300 font-poppins mb-4">
              Nenhum carro cadastrado
            </p>
            <Link
              to="/admin/carros/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-poppins"
            >
              <Plus size={18} />
              Adicionar Primeiro Carro
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-4 text-dark-300 font-semibold font-poppins">
                    Carro
                  </th>
                  <th className="text-left py-4 px-4 text-dark-300 font-semibold font-poppins">
                    Ano
                  </th>
                  <th className="text-left py-4 px-4 text-dark-300 font-semibold font-poppins">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-dark-300 font-semibold font-poppins">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr
                    key={car.id}
                    className="border-b border-dark-700 hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-semibold font-poppins">
                          {car.marca} {car.modelo}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white font-poppins">
                      {car.ano}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold font-poppins ${
                          car.status === "disponivel"
                            ? "bg-green-500/20 text-green-400"
                            : car.status === "reservado"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : car.status === "oculto"
                                ? "bg-dark-600/40 text-dark-300"
                                : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {car.status === "disponivel"
                          ? "Disponível"
                          : car.status === "reservado"
                            ? "Reservado"
                            : car.status === "oculto"
                              ? "Oculto"
                              : "Vendido"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/carros/${car.id}/editar`}
                          aria-label={`Editar ${car.marca} ${car.modelo}`}
                          className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-primary-500"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(car.id)}
                          disabled={deletingId === car.id}
                          aria-label={`Excluir ${car.marca} ${car.modelo}`}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
