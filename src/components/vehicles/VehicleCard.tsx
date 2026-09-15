// Card publico de veiculo: apresenta o estoque sem exibir valores.
import React from "react";
import { Link } from "react-router-dom";
import { Car, Calendar } from "lucide-react";
import { Vehicle } from "@/types";
import { whatsappService } from "@/services/whatsappService";
import { vehiclePath } from "@/lib/slug";
import toast from "react-hot-toast";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const image = vehicle.imagens?.[0];

  const handleNegociar = async () => {
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

  return (
    <article className="overflow-hidden rounded-lg bg-primary-900">
      <Link
        to={vehiclePath(vehicle)}
        className="flex aspect-[4/3] items-center justify-center bg-white"
      >
        {image ? (
          <img
            src={image}
            alt={`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-bold uppercase tracking-wide text-dark-900">
            Imagem do carro
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link to={vehiclePath(vehicle)} className="block">
          <h3 className="truncate text-base font-bold uppercase text-white">
            {vehicle.marca} {vehicle.modelo}
          </h3>
          <p className="truncate text-xs uppercase text-dark-300">
            {vehicle.versao || vehicle.categoria || "—"}
          </p>
        </Link>

        <div className="mt-3 space-y-1.5 text-xs text-dark-200">
          <div className="flex items-center gap-2">
            <Car size={14} />
            <span className="uppercase">
              {vehicle.km.toLocaleString("pt-BR")} km rodados
            </span>
          </div>
          <div className="flex items-center gap-2 uppercase">
            <Calendar size={14} />
            {vehicle.ano}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNegociar}
          className="mt-4 w-full rounded-md bg-primary-950 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
        >
          Negociar
        </button>
      </div>
    </article>
  );
};
