// Rodape compartilhado pelas paginas publicas do site.
import React from "react";
import { Instagram, MapPin, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { whatsappService } from "@/services/whatsappService";
import { asset } from "@/lib/asset";

export const Footer: React.FC = () => {
  const handleContact = async () => {
    try {
      const sent = await whatsappService.sendToStore(
        "Olá! Gostaria de entrar em contato com a JR Veículos.",
      );
      if (!sent) {
        toast.error("Nenhum vendedor cadastrado para receber mensagens.");
      }
    } catch (error) {
      toast.error("Não foi possível verificar os vendedores.");
      console.error(error);
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-dark-800 bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-transparent via-primary-900/20 to-primary-700/35 blur-2xl" />
      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-6 py-10 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <img
            src={asset("images/136ba5b6-9343-462e-bd70-daef33a77d8c.png")}
            alt="JR Veículos"
            className="h-10 w-auto"
          />
          <button
            type="button"
            onClick={handleContact}
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-dark-900 transition-colors hover:bg-dark-100 sm:inline-flex"
          >
            CONTATO
          </button>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Cheque nossas <span className="text-primary-500">redes!</span>
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/jrveiculos_salto/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram da JR Veículos"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-800 transition-colors hover:bg-primary-600"
              >
                <Instagram size={18} className="text-white" />
              </a>
              <button
                type="button"
                onClick={handleContact}
                aria-label="Falar com um vendedor pelo WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-800 transition-colors hover:bg-primary-600"
              >
                <MessageCircle size={18} className="text-white" />
              </button>
            </div>
          </div>

          <a
            href="https://www.google.com/maps?cid=15321261055603584940"
            target="_blank"
            rel="noreferrer"
            className="flex max-w-sm items-start gap-3 text-sm uppercase tracking-[0.1em] text-dark-300 transition-colors hover:text-white md:text-base"
          >
            <MapPin className="mt-0.5 shrink-0 text-primary-500" size={20} />
            <span>
              EDUARDO BERTONI - CENTRO
              <br />
              Salto do Itararé - PR, 84945-000
            </span>
          </a>

          <p className="max-w-sm text-left text-sm uppercase tracking-[0.1em] text-dark-300 md:text-right md:text-base">
            Não se trata de <span className="text-primary-500">vender</span> mas
            sim de realizar <span className="text-primary-500">sonhos</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
