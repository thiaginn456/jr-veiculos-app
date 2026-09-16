// Formulario administrativo para criar ou editar os dados de um veiculo.
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Loader, Plus, Star, X } from "lucide-react";
import { carService } from "@/services/carService";
import { Vehicle } from "@/types";
import { describeSupabaseError } from "@/lib/supabaseError";
import toast from "react-hot-toast";

type CarFormState = Omit<Vehicle, "id" | "criado_em" | "atualizado_em">;

const emptyForm: CarFormState = {
  marca: "",
  modelo: "",
  versao: "",
  ano: new Date().getFullYear(),
  km: 0,
  combustivel: "gasolina",
  cambio: "automatico",
  cor: "",
  categoria: "sedan",
  preco: 0,
  preco_promocional: undefined,
  descricao: "",
  final_placa: "",
  imagens: [],
  opcionais: [],
  status: "disponivel",
  destaque: false,
  aceita_troca: false,
  financia: true,
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const AdminCarForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<CarFormState>(emptyForm);

  useEffect(() => {
    if (id) {
      loadCar();
    }
  }, [id]);

  const loadCar = async () => {
    try {
      const car = await carService.getCarById(id!);
      if (car) {
        const {
          id: _id,
          criado_em: _criado_em,
          atualizado_em: _atualizado_em,
          ...rest
        } = car;
        setForm(rest);
      } else {
        toast.error("Carro não encontrado");
        navigate("/admin/carros");
      }
    } catch (error) {
      toast.error("Erro ao carregar carro");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => carService.uploadImage(file)),
      );
      setForm((prev) => ({ ...prev, imagens: [...prev.imagens, ...urls] }));
    } catch (error) {
      toast.error(describeSupabaseError(error, "Erro ao enviar foto(s)"), {
        duration: 8000,
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImagem = (url: string) => {
    setForm((prev) => ({
      ...prev,
      imagens: prev.imagens.filter((imagem) => imagem !== url),
    }));
  };

  // A "foto de capa" é sempre a primeira do array — é ela que aparece no
  // estoque da home, nos cards e como primeira foto na página do veículo.
  // Definir uma capa nova só reordena o array, trazendo a foto escolhida
  // para o início.
  const handleSetCapa = (url: string) => {
    setForm((prev) => ({
      ...prev,
      imagens: [url, ...prev.imagens.filter((imagem) => imagem !== url)],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.marca.trim() ||
      !form.modelo.trim() ||
      !form.versao.trim() ||
      !form.cor.trim() ||
      !form.descricao.trim() ||
      !form.final_placa.trim() ||
      form.imagens.length === 0
    ) {
      toast.error(
        "Preencha todas as informações e adicione pelo menos uma foto.",
      );
      return;
    }

    if (
      !Number.isInteger(form.ano) ||
      form.ano < 1900 ||
      form.ano > new Date().getFullYear() + 1 ||
      !Number.isInteger(form.km) ||
      form.km < 0 ||
      !/^\d$/.test(form.final_placa)
    ) {
      toast.error("Confira os campos numéricos antes de salvar.");
      return;
    }

    setIsSaving(true);

    try {
      if (id) {
        await carService.updateCar(id, form);
        toast.success("Carro atualizado com sucesso");
      } else {
        await carService.createCar(form);
        toast.success("Carro adicionado com sucesso");
      }
      navigate("/admin/carros");
    } catch (error) {
      toast.error(describeSupabaseError(error, "Erro ao salvar carro"), {
        duration: 8000,
      });
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
            to="/admin/carros"
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white font-montserrat">
            {id ? "Editar Carro" : "Novo Carro"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-dark-800 rounded-lg p-8 border border-dark-700 space-y-6"
        >
          {/* Fotos */}
          <div>
            <h2 className="text-xl font-bold text-white font-montserrat mb-4">
              Fotos
            </h2>
            <p className="mb-3 text-xs text-dark-400 font-poppins">
              A foto de capa é a que aparece no estoque e nos cards do site.
              Passe o mouse numa outra foto e clique na estrela pra trocar.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {form.imagens.map((url, index) => {
                const isCapa = index === 0;
                return (
                  <div
                    key={url}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-lg border bg-dark-700 ${
                      isCapa ? "border-primary-600" : "border-dark-600"
                    }`}
                  >
                    <img
                      src={url}
                      alt="Foto do veículo"
                      className="h-full w-full object-cover"
                    />
                    {isCapa ? (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Star size={10} className="fill-white" />
                        Capa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCapa(url)}
                        className="absolute left-2 top-2 rounded-full bg-dark-950/80 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-primary-600"
                        aria-label="Definir como foto de capa"
                        title="Definir como foto de capa"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImagem(url)}
                      className="absolute right-2 top-2 rounded-full bg-dark-950/80 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                      aria-label="Remover foto"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}

              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-dark-600 text-dark-400 transition-colors hover:border-primary-600 hover:text-primary-400">
                {isUploading ? (
                  <Loader size={22} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={22} />
                    <span className="text-xs font-poppins">Adicionar foto</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    handleUploadFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {/* Informações Básicas */}
          <div>
            <h2 className="text-xl font-bold text-white font-montserrat mb-4">
              Informações Básicas
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Marca
                </label>
                <input
                  type="text"
                  value={form.marca}
                  onChange={(e) => setForm({ ...form, marca: e.target.value })}
                  placeholder="ex: Volkswagen"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Modelo
                </label>
                <input
                  type="text"
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  placeholder="ex: T-Cross"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Versão
                </label>
                <input
                  type="text"
                  value={form.versao}
                  onChange={(e) => setForm({ ...form, versao: e.target.value })}
                  placeholder="ex: Highline"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Cor
                </label>
                <input
                  type="text"
                  value={form.cor}
                  onChange={(e) => setForm({ ...form, cor: e.target.value })}
                  placeholder="ex: Branco"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Ano
                </label>
                <input
                  type="number"
                  value={form.ano}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ano: Number(onlyDigits(e.target.value)),
                    })
                  }
                  inputMode="numeric"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-600 font-poppins"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  KM
                </label>
                <input
                  type="number"
                  value={form.km}
                  onChange={(e) =>
                    setForm({ ...form, km: Number(onlyDigits(e.target.value)) })
                  }
                  inputMode="numeric"
                  min="0"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-600 font-poppins"
                  required
                />
              </div>
            </div>
          </div>

          {/* Detalhes Técnicos */}
          <div>
            <h2 className="text-xl font-bold text-white font-montserrat mb-4">
              Detalhes Técnicos
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Combustível
                </label>
                <select
                  value={form.combustivel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      combustivel: e.target.value as Vehicle["combustivel"],
                    })
                  }
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-600 font-poppins"
                >
                  <option value="gasolina">Gasolina</option>
                  <option value="diesel">Diesel</option>
                  <option value="etanol">Etanol</option>
                  <option value="flex">Flex</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="eletrico">Elétrico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Câmbio
                </label>
                <select
                  value={form.cambio}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cambio: e.target.value as Vehicle["cambio"],
                    })
                  }
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-600 font-poppins"
                >
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
                  Categoria
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-600 font-poppins"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="picape">Picape</option>
                  <option value="van">Van</option>
                  <option value="ret">Ret</option>
                </select>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descreva o carro..."
              rows={4}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins resize-none"
              required
            />
          </div>

          {/* Final da Placa */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 font-poppins">
              Final da Placa
            </label>
            <input
              type="text"
              value={form.final_placa}
              onChange={(e) =>
                setForm({ ...form, final_placa: onlyDigits(e.target.value) })
              }
              placeholder="ex: 1"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]{1}"
              required
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-600 font-poppins"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-dark-700">
            <Link
              to="/admin/carros"
              className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors font-poppins font-semibold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving || isUploading}
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
