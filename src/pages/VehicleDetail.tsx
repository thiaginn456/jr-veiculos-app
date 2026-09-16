// Pagina publica de detalhe de um veiculo: fotos, dados e ficha de financiamento.
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
import { financingService } from "@/services/financingService";
import { whatsappService } from "@/services/whatsappService";
import { Vehicle, Financing } from "@/types";
import toast from "react-hot-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useSeo, SITE_URL } from "@/lib/seo";
import { extractVehicleId, vehiclePath } from "@/lib/slug";
import { asset } from "@/lib/asset";

const combustivelLabels: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diesel",
  etanol: "Etanol",
  flex: "Flex",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
};

type FinancingFormState = Omit<Financing, "id" | "criado_em" | "veiculo_id">;

const emptyFinancingForm: FinancingFormState = {
  nome: "",
  whatsapp: "",
  sexo: "masculino",
  estado_civil: "solteiro",
  cpf: "",
  rg: "",
};

const inputClass =
  "w-full rounded-md bg-dark-100 px-4 py-3 text-dark-900 placeholder-dark-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600";

export const VehicleDetail: React.FC = () => {
  const { id: rawParam } = useParams();
  // A URL aceita tanto o id puro quanto o formato amigável
  // "marca-modelo-ano-id" — o id de verdade é sempre o UUID no final.
  const id = rawParam ? extractVehicleId(rawParam) : null;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState<FinancingFormState>(emptyFinancingForm);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setVehicle(null);
      return;
    }
    setIsLoading(true);
    setPhotoIndex(0);
    vehicleService
      .getVehicleById(id)
      .then(setVehicle)
      .catch(() => setVehicle(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleNegociar = async () => {
    if (!vehicle) return;
    const message = whatsappService.generateVehicleInterestMessage(vehicle, "");
    try {
      const sent = await whatsappService.sendToStore(message);
      if (!sent) {
        toast.error("Nenhum vendedor cadastrado para receber mensagens.");
      }
    } catch (error) {
      toast.error("Não foi possível verificar os vendedores.");
      console.error(error);
    }
  };

  const handleFinancingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setIsSending(true);
    try {
      if (!(await whatsappService.hasRegisteredSellers())) {
        toast.error("Nenhum vendedor cadastrado para receber mensagens.");
        return;
      }
      await financingService.createFinancingRequest({
        ...form,
        veiculo_id: vehicle.id,
      });
      whatsappService.sendToStore(
        whatsappService.generateFinancingMessage(form, vehicle),
      );
      toast.success("Ficha enviada! Nossa equipe vai entrar em contato.");
      setForm(emptyFinancingForm);
    } catch (error) {
      toast.error("Erro ao enviar ficha de financiamento");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const vehicleTitle = vehicle
    ? `${vehicle.marca} ${vehicle.modelo}${vehicle.versao ? ` ${vehicle.versao}` : ""} ${vehicle.ano} | JR Veículos`
    : "Veículo | JR Veículos";
  const vehicleDescription = vehicle
    ? `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}, ${vehicle.km.toLocaleString("pt-BR")} km, ${
        combustivelLabels[vehicle.combustivel] || vehicle.combustivel
      }. Confira fotos, preço e negocie direto com a JR Veículos em Salto do Itararé - PR.`
    : "Confira este veículo disponível na JR Veículos.";
  const vehiclePagePath = vehicle ? vehiclePath(vehicle) : "/estoque";

  useSeo({
    title: vehicleTitle,
    description: vehicleDescription,
    path: vehiclePagePath,
    image: vehicle?.imagens?.[0],
    jsonLd: vehicle
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Vehicle",
            name: `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`,
            brand: vehicle.marca,
            model: vehicle.modelo,
            vehicleModelDate: String(vehicle.ano),
            mileageFromOdometer: {
              "@type": "QuantitativeValue",
              value: vehicle.km,
              unitCode: "KMT",
            },
            fuelType: combustivelLabels[vehicle.combustivel] || vehicle.combustivel,
            vehicleTransmission: vehicle.cambio,
            color: vehicle.cor || undefined,
            image: vehicle.imagens?.[0],
            offers: {
              "@type": "Offer",
              price: vehicle.preco,
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}${vehiclePagePath}`,
              seller: {
                "@type": "AutomotiveBusiness",
                name: "JR Veículos",
              },
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
              {
                "@type": "ListItem",
                position: 2,
                name: "Estoque",
                item: `${SITE_URL}/estoque`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `${vehicle.marca} ${vehicle.modelo}`,
                item: `${SITE_URL}${vehiclePagePath}`,
              },
            ],
          },
        ]
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-16">
        <p className="text-dark-300 font-poppins">Carregando...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black pt-16 text-center">
        <p className="text-lg font-semibold text-white">
          Veículo não encontrado
        </p>
        <Link
          to="/estoque"
          className="font-bold text-primary-500 hover:text-white"
        >
          Ver estoque completo
        </Link>
      </div>
    );
  }

  const fotos =
    vehicle.imagens.length > 0
      ? vehicle.imagens
      : [asset("images/unnamed_2.jpg")];

  const goToPhoto = (direction: 1 | -1) => {
    setPhotoIndex((prev) => (prev + direction + fotos.length) % fotos.length);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Galeria de fotos */}
      <div className="relative h-[280px] bg-black pt-14 md:h-[400px]">
        <img
          src={fotos[photoIndex]}
          alt={`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano} - foto ${photoIndex + 1} de ${fotos.length}`}
          className="h-full w-full object-contain"
        />

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToPhoto(-1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goToPhoto(1)}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {fotos.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPhotoIndex(index)}
                  aria-label={`Ir para a foto ${index + 1}`}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    index === photoIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dados do veículo + ficha de financiamento */}
      <div className="vehicle-detail-glow relative overflow-hidden px-4 py-12 md:py-16">
        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Estoque", href: "/estoque" },
              { label: `${vehicle.marca} ${vehicle.modelo}` },
            ]}
          />
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-16">
          {/* Informações e negociação */}
          <div>
            <h1 className="text-3xl font-black uppercase text-white md:text-4xl">
              {vehicle.marca}{" "}
              <span className="text-primary-500">{vehicle.modelo}</span>
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.15em] text-dark-300">
              {vehicle.versao ||
                `${vehicle.ano} • ${vehicle.km.toLocaleString("pt-BR")} km`}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 md:gap-x-8 md:gap-y-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  Ano
                </p>
                <p className="text-sm uppercase text-dark-400">{vehicle.ano}</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  Combustível
                </p>
                <p className="text-sm uppercase text-dark-400">
                  {combustivelLabels[vehicle.combustivel] ||
                    vehicle.combustivel}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  KM
                </p>
                <p className="text-sm uppercase text-dark-400">
                  {vehicle.km.toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  Cor
                </p>
                <p className="text-sm uppercase text-dark-400">
                  {vehicle.cor || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  Placa final
                </p>
                <p className="text-sm uppercase text-dark-400">
                  {vehicle.final_placa || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  Categoria
                </p>
                <p className="text-sm uppercase text-dark-400">
                  {vehicle.categoria || "—"}
                </p>
              </div>
            </div>

            {vehicle.opcionais.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {vehicle.opcionais.map((opcional) => (
                  <span
                    key={opcional}
                    className="rounded-full bg-dark-800 px-3 py-1 text-xs uppercase tracking-wide text-dark-300"
                  >
                    {opcional}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleNegociar}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-primary-900 py-3.5 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-primary-800"
            >
              <MessageCircle size={20} />
              Negociar
            </button>
          </div>

          {/* Ficha de financiamento */}
          <div>
            <h2 className="text-xl font-bold uppercase text-white md:text-2xl">
              Precisa <span className="text-primary-500">financiar?</span>
            </h2>
            <p className="mt-1 uppercase text-white">
              Aprove sua ficha de{" "}
              <span className="text-primary-500">financiamento</span> conosco!
            </p>

            <form onSubmit={handleFinancingSubmit} className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm uppercase tracking-wide text-white">
                  Nome:
                </label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm uppercase tracking-wide text-white">
                  WhatsApp:
                </label>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm uppercase tracking-wide text-white">
                  Sexo:
                </label>
                <select
                  value={form.sexo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sexo: e.target.value as Financing["sexo"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm uppercase tracking-wide text-white">
                  Estado civil:
                </label>
                <select
                  value={form.estado_civil}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estado_civil: e.target.value as Financing["estado_civil"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_estavel">União estável</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm uppercase tracking-wide text-white">
                  CPF:
                </label>
                <input
                  type="text"
                  required
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm uppercase tracking-wide text-white">
                  RG:
                </label>
                <input
                  type="text"
                  required
                  value={form.rg}
                  onChange={(e) => setForm({ ...form, rg: e.target.value })}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full rounded-md bg-primary-900 py-3.5 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-primary-800 disabled:opacity-60"
              >
                {isSending ? "Enviando..." : "Enviar!"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
