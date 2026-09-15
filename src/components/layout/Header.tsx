// Cabecalho compartilhado com navegacao publica e controles da sessao.
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { whatsappService } from "@/services/whatsappService";
import { asset } from "@/lib/asset";

export const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasVideoFinished, setHasVideoFinished] = useState(false);

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

  useEffect(() => {
    const handleVideoProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ completed: boolean }>;
      setHasVideoFinished(customEvent.detail.completed);
    };

    window.addEventListener("hero-video-progress", handleVideoProgress);
    return () =>
      window.removeEventListener("hero-video-progress", handleVideoProgress);
  }, []);

  const navItems = [
    { label: "INÍCIO", href: "/" },
    { label: "ESTOQUE", href: "/estoque" },
    { label: "ENTRE EM CONTATO", href: "/#contato" },
  ];

  // Só a home tem vídeo no topo pedindo um header transparente no início;
  // nas outras páginas (sem vídeo por trás) o header precisa nascer com
  // fundo sólido, senão o texto fica ilegível em cima do conteúdo da página.
  const isHome = location.pathname === "/";
  const showSolidBackground = !isHome || hasVideoFinished;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
        showSolidBackground
          ? "border-b border-white/10 bg-black/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1800px] px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={asset("images/136ba5b6-9343-462e-bd70-daef33a77d8c.png")}
              alt="JR Veículos"
              className="h-10 w-auto"
            />
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-primary-500"
                    : "text-dark-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleContact}
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-dark-900 transition-colors hover:bg-dark-100 sm:inline-flex"
            >
              CONTATO
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden text-dark-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden mb-4 space-y-1 rounded-lg border border-white/10 bg-black/95 p-2 backdrop-blur-md"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
