// Pagina inicial publica com hero animada, destaques e apresentacao da empresa.
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useVehicles } from "@/hooks";
import { whatsappService } from "@/services/whatsappService";
import { useSeo } from "@/lib/seo";
import { vehiclePath } from "@/lib/slug";
import { asset } from "@/lib/asset";
import { useResponsiveVideoSource } from "@/lib/useResponsiveVideoSource";
import toast from "react-hot-toast";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Home: React.FC = () => {
  const { vehicles, isLoading } = useVehicles({ ordem: "recentes" });

  useSeo({
    title: "JR Veículos | Carros Seminovos em Salto do Itararé - PR",
    description:
      "JR Veículos: concessionária de carros seminovos em Salto do Itararé - PR. Confira nosso estoque atualizado, negocie direto pelo WhatsApp e simule seu financiamento.",
    path: "/",
  });
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const carTitleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const storeVideoRef = useRef<HTMLVideoElement>(null);
  const storeSectionRef = useRef<HTMLElement>(null);
  const stockSectionRef = useRef<HTMLDivElement>(null);
  const stockWrapRef = useRef<HTMLDivElement>(null);
  const stockRailRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  useResponsiveVideoSource(
    videoRef,
    asset("videos/White_SUV_rotating_with_smoke_mobile-scrub.mp4"),
    asset("videos/White_SUV_rotating_with_smoke_20260910123033-scrub.mp4"),
  );

  // Vídeo da loja: versão mobile bem mais leve (resolução e fps menores) —
  // fazer scroll-scrub num vídeo grande travava a rolagem no celular, já
  // que cada seek precisa decodificar um frame inteiro.
  useResponsiveVideoSource(
    storeVideoRef,
    asset("videos/loja-conheca-scrub-mobile.mp4"),
    asset("videos/loja-conheca-scrub.mp4"),
  );

  useEffect(() => {
    const heroEl = heroRef.current;
    const titleEl = titleRef.current;
    const video = videoRef.current;
    if (!heroEl || !titleEl) return;

    let scrollTrigger: ScrollTrigger | undefined;
    let onSeeked: (() => void) | undefined;
    let videoCompleted = false;

    const updateHeaderBackground = (completed: boolean) => {
      if (videoCompleted === completed) return;
      videoCompleted = completed;
      window.dispatchEvent(
        new CustomEvent("hero-video-progress", {
          detail: { completed },
        }),
      );
    };

    // No celular, prender a seção e ficar decodificando um frame do vídeo a
    // cada pixel rolado é pesado demais e trava a rolagem — mesmo com o
    // vídeo mais leve. Em telas pequenas o vídeo só toca normal, em loop, e
    // o cabeçalho reage apenas quando a hero sai da tela.
    if (video && window.matchMedia("(max-width: 767px)").matches) {
      video.loop = true;
      const tryPlay = () => {
        video.play().catch(() => {});
      };
      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.addEventListener("loadeddata", tryPlay, { once: true });
      }

      scrollTrigger = ScrollTrigger.create({
        trigger: heroEl,
        start: "bottom top",
        onEnter: () => updateHeaderBackground(true),
        onLeaveBack: () => updateHeaderBackground(false),
      });

      return () => {
        video.removeEventListener("loadeddata", tryPlay);
        scrollTrigger?.kill();
        updateHeaderBackground(false);
      };
    }

    // Seekar um vídeo comprimido é caro: se pedirmos vários seeks antes do
    // anterior terminar, o navegador enfileira/derruba pedidos e o vídeo
    // trava. Por isso guardamos só o alvo mais recente e só disparamos o
    // próximo seek quando o atual já tiver terminado ("seeked").
    let targetTime: number | null = null;
    let seeking = false;

    const seekTo = (time: number) => {
      if (!video) return;
      if (seeking) {
        targetTime = time;
        return;
      }
      if (Math.abs(video.currentTime - time) < 0.03) return;
      seeking = true;
      video.currentTime = time;
    };

    onSeeked = () => {
      seeking = false;
      if (targetTime !== null) {
        const next = targetTime;
        targetTime = null;
        seekTo(next);
      }
    };

    video?.addEventListener("seeked", onSeeked);

    // O pin e o "end" (+=90%) não dependem do vídeo estar carregado — só a
    // busca de frame (seekTo) precisa esperar o vídeo ficar pronto, e isso
    // já é tratado pelo "if (video.duration)" abaixo. Por isso o
    // ScrollTrigger é criado imediatamente, sem esperar "loadedmetadata".
    // Adiar a criação do pin fazia o espaçador (que reserva o espaço de
    // rolagem da seção) aparecer só depois que o vídeo carregasse — ao
    // voltar pra home vindo de outra página (o vídeo já tinha saído do
    // cache do navegador e precisa recarregar), isso inseria uma faixa
    // grande no meio da página um instante depois do primeiro render,
    // empurrando o conteúdo e fazendo a rolagem "pular"/travar.
    scrollTrigger = ScrollTrigger.create({
      trigger: heroEl,
      start: "top top",
      end: "+=90%",
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const fadeProgress = Math.min(self.progress / 0.25, 1);
        gsap.set(carTitleRef.current, {
          opacity: 1 - fadeProgress * 0.6,
        });
        updateHeaderBackground(self.progress >= 0.999);
        if (video && video.duration) {
          seekTo(self.progress * video.duration);
        }
      },
    });

    return () => {
      if (video && onSeeked) {
        video.removeEventListener("seeked", onSeeked);
      }
      scrollTrigger?.kill();
      updateHeaderBackground(false);
    };
  }, []);

  useEffect(() => {
    const section = storeSectionRef.current;
    const video = storeVideoRef.current;
    if (!section || !video) return;

    // Mesma lógica da hero: no celular o scroll-scrub trava mesmo com o
    // vídeo mais leve, então aqui ele só toca em loop enquanto a seção
    // estiver visível, sem prender a rolagem.
    if (window.matchMedia("(max-width: 767px)").matches) {
      video.loop = true;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.25 },
      );
      observer.observe(section);
      return () => observer.disconnect();
    }

    let scrollTrigger: ScrollTrigger | undefined;
    let targetTime: number | null = null;
    let seeking = false;

    const seekTo = (time: number) => {
      if (seeking) {
        targetTime = time;
        return;
      }
      if (Math.abs(video.currentTime - time) < 0.03) return;
      seeking = true;
      video.currentTime = time;
    };

    const onSeeked = () => {
      seeking = false;
      if (targetTime !== null) {
        const nextTime = targetTime;
        targetTime = null;
        seekTo(nextTime);
      }
    };

    video.addEventListener("seeked", onSeeked);

    // O "end" usa section.offsetHeight (CSS, sempre disponível) — não
    // precisa esperar o vídeo carregar pra criar o pin. Esperar
    // "loadedmetadata" (como era antes) fazia o espaçador da seção surgir
    // de repente um instante depois do primeiro render sempre que o vídeo
    // não estava no cache do navegador — por exemplo ao voltar pra home
    // vindo de outra página. Essa inserção tardia empurra o conteúdo que
    // já estava na tela e o navegador ajusta a rolagem pra compensar
    // (scroll anchoring), o que parecia o vídeo "aparecer antes da hora e
    // travar". Criar o pin já de cara evita esse pulo.
    //
    // "+=100%" sem qualificador soma 100% da altura da JANELA, não da
    // seção — com a seção "achatada" (bem mais baixa que a tela) isso
    // reservava um espaço de scroll bem maior que o vídeo, deixando-o
    // "preso" na tela por um trecho enorme antes de liberar a rolagem.
    // Usar a própria altura da seção mantém o pin proporcional ao que
    // aparece na tela.
    scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${section.offsetHeight}`,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (video.duration) {
          seekTo(self.progress * video.duration);
        }
      },
    });

    return () => {
      video.removeEventListener("seeked", onSeeked);
      scrollTrigger?.kill();
    };
  }, []);

  useEffect(() => {
    const sectionEl = stockSectionRef.current;
    const wrapEl = stockWrapRef.current;
    const railEl = stockRailRef.current;
    if (!sectionEl || !wrapEl || !railEl || vehicles.length === 0) return;

    const getDistance = () =>
      Math.max(0, railEl.scrollWidth - wrapEl.clientWidth);

    wrapEl.scrollLeft = 0;
    // Anima o scrollLeft nativo (em vez de um transform) para que o rail
    // também aceite arrastar direto com o dedo/mouse sem brigar com a
    // rolagem ligada à página.
    // scrub:true (sem número) trava o rail exatamente na posição da rolagem,
    // sem suavização/atraso. Com um número (ex: 0.5) o rail continua se
    // ajustando por um instante depois que a pessoa já parou de rolar — se
    // ela clicasse bem nessa hora, o carro "andava" embaixo do clique e o
    // link não abria, parecendo que o carrossel não respondia a cliques.
    const animation = gsap.to(wrapEl, {
      scrollLeft: () => getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: sectionEl,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    window.addEventListener("load", refresh);
    refresh();

    return () => {
      window.removeEventListener("load", refresh);
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [vehicles, isLoading]);

  const scrollStockRail = (direction: 1 | -1) => {
    const wrap = stockWrapRef.current;
    const rail = stockRailRef.current;
    const firstTile = rail?.firstElementChild as HTMLElement | null;
    if (!wrap || !rail || !firstTile) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap || "0") || 0;
    const step = firstTile.getBoundingClientRect().width + gap;
    const maxDistance = Math.max(0, rail.scrollWidth - wrap.clientWidth);
    const targetLeft = Math.max(
      0,
      Math.min(maxDistance, wrap.scrollLeft + direction * step),
    );

    gsap.to(wrap, {
      scrollLeft: targetLeft,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
    });
  };

  // Permite arrastar o carrossel do estoque diretamente com o mouse. No touch
  // deixamos o navegador cuidar do scroll nativamente (overflow-x): capturar
  // o toque aqui também atrapalhava o gesto nativo e travava a rolagem no
  // celular.
  //
  // IMPORTANTE: só chamamos setPointerCapture depois de confirmar que é um
  // arrasto de verdade (o mouse se moveu), nunca no pointerdown. Capturar
  // o pointer imediatamente faz o navegador entregar o "click" pro próprio
  // wrap em vez do link do carro (o alvo do click passa a ser quem tem a
  // captura, não o que está visualmente embaixo do cursor) — isso fazia um
  // clique normal, sem arrastar nada, simplesmente não abrir o carro.
  const handleStockPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = stockWrapRef.current;
    if (
      !wrap ||
      e.pointerType !== "mouse" ||
      (e.target as HTMLElement).closest("button")
    )
      return;
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: wrap.scrollLeft,
      moved: false,
    };
  };

  const handleStockPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = stockWrapRef.current;
    const state = dragStateRef.current;
    if (!wrap || !state.active) return;
    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 5) {
      if (!state.moved) wrap.setPointerCapture(e.pointerId);
      state.moved = true;
    }
    if (state.moved) {
      wrap.scrollLeft = state.startScrollLeft - delta;
    }
  };

  const handleStockPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = stockWrapRef.current;
    if (wrap && wrap.hasPointerCapture(e.pointerId)) {
      wrap.releasePointerCapture(e.pointerId);
    }
    dragStateRef.current.active = false;
  };

  // Depois de um arraste, evita que o clique solto em cima de um card navegue
  // sem querer para a página do veículo.
  const handleStockClickCapture = (e: React.MouseEvent) => {
    if (dragStateRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragStateRef.current.moved = false;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex h-screen items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Em telas de celular usamos o vídeo gravado em pé (retrato), que
              enquadra melhor o carro do que o vídeo widescreen do desktop. */}
          <source
            media="(max-width: 767px)"
            src={asset("videos/White_SUV_rotating_with_smoke_mobile-scrub.mp4")}
            type="video/mp4"
          />
          <source
            src={asset(
              "videos/White_SUV_rotating_with_smoke_20260910123033-scrub.mp4",
            )}
            type="video/mp4"
          />
        </video>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div ref={titleRef}>
            <p className="text-lg font-poppins tracking-[0.08em] text-dark-200 sm:text-2xl sm:tracking-[0.12em] md:text-4xl md:tracking-[0.26em]">
              <span className="text-primary-500">NÃO</span> SE TRATA DE VENDER
            </p>
            <h1
              ref={carTitleRef}
              className="mt-[clamp(1.5rem,6vh,3.5rem)] mb-[clamp(1.5rem,6vh,3.5rem)] text-6xl leading-none tracking-[0.02em] text-white/80 font-black font-montserrat sm:mt-[clamp(2rem,8vh,5rem)] sm:mb-[clamp(2rem,8vh,5rem)] sm:text-7xl sm:leading-[0.95] sm:tracking-[0.05em] md:mt-[clamp(3rem,11vw,11rem)] md:mb-[clamp(3rem,11vw,11rem)] md:text-[clamp(4rem,18vw,16rem)] md:leading-[0.85] md:tracking-[0.12em]"
            >
              CARROS
            </h1>
            <p className="text-lg font-poppins tracking-[0.08em] text-dark-200 sm:text-2xl sm:tracking-[0.12em] md:text-4xl md:tracking-[0.26em]">
              MAS SIM DE REALIZAR{" "}
              <span className="text-primary-500">SONHOS</span>
            </p>
          </div>
        </div>

        {/* Esmaece o vídeo no preto em vez de cortar a seção seguinte de repente. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black" />
      </section>

      {/* Vitrine de estoque: ocupa a tela toda e vira carrossel horizontal
          conforme a página rola, quando há veículos cadastrados no admin. */}
      <section
        ref={stockSectionRef}
        id="estoque"
        className="stock-showcase relative flex h-[76vh] min-h-[520px] flex-col justify-center overflow-hidden py-10 md:py-14"
      >
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xl font-semibold uppercase tracking-[0.12em] text-white md:text-3xl">
                Encontre o carro perfeito para{" "}
                <span className="text-primary-500">você</span>
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-dark-300">
                Confira os veículos disponíveis no estoque
              </p>
            </div>
            <Link
              to="/estoque"
              className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-dark-900 transition hover:bg-primary-500 hover:text-white"
            >
              Estoque
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="stock-rail-outer relative mt-10 h-[40vh] min-h-[280px] flex-none md:mt-14">
            <div className="stock-rail-wrap h-full w-full overflow-hidden">
              <div className="stock-rail flex h-full w-max min-w-full gap-1">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="stock-tile w-[75vw] shrink-0 animate-pulse bg-dark-700 sm:w-[420px] md:w-[480px] lg:w-[540px]"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="stock-rail-outer relative mt-10 h-[40vh] min-h-[280px] flex-none md:mt-14">
            <div
              ref={stockWrapRef}
              className="stock-rail-wrap h-full w-full cursor-grab select-none overflow-x-auto overflow-y-hidden active:cursor-grabbing"
              onPointerDown={handleStockPointerDown}
              onPointerMove={handleStockPointerMove}
              onPointerUp={handleStockPointerEnd}
              onPointerCancel={handleStockPointerEnd}
              onClickCapture={handleStockClickCapture}
            >
              <div
                ref={stockRailRef}
                className="stock-rail flex h-full w-max min-w-full gap-1"
              >
                {vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    to={vehiclePath(vehicle)}
                    className="stock-tile group relative flex w-[75vw] shrink-0 items-center justify-center overflow-hidden bg-white sm:w-[420px] md:w-[480px] lg:w-[540px]"
                    draggable={false}
                  >
                    {vehicle.imagens?.[0] ? (
                      <img
                        src={vehicle.imagens[0]}
                        alt={`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-sm font-bold uppercase tracking-wide text-dark-900">
                        Imagem do carro
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-12 text-sm font-semibold uppercase tracking-[0.1em] text-white opacity-0 transition group-hover:opacity-100">
                      {vehicle.marca} {vehicle.modelo}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {vehicles.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollStockRail(-1)}
                  aria-label="Ver carro anterior"
                  className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollStockRail(1)}
                  aria-label="Ver próximo carro"
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="relative z-10 mx-auto mt-10 flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-2 px-4 text-center sm:px-6 md:mt-14 lg:px-8">
            <p className="text-lg font-semibold text-white">
              Estoque em atualização
            </p>
            <p className="text-dark-400">
              Novos veículos aparecem aqui assim que forem cadastrados.
            </p>
          </div>
        )}
      </section>

      {/* Valores da empresa */}
      <section
        id="sobre"
        className="relative flex min-h-screen items-center bg-black py-20"
      >
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-primary-700 opacity-20 blur-[120px]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:gap-16 lg:px-8">
          <img
            src={asset("images/136ba5b6-9343-462e-bd70-daef33a77d8c.png")}
            alt="JR Veículos"
            className="w-40 shrink-0 md:w-56"
          />
          <div className="hidden self-stretch border-l border-dark-600 md:block" />
          <p className="text-center text-xl leading-relaxed tracking-wide text-dark-200 md:text-2xl">
            Nós da empresa JR Veículos não queremos apenas{" "}
            <span className="text-primary-500">vender</span>, mas sim realizar
            seus <span className="text-primary-500">sonhos</span>.
            Comprometimento, excelência, inovação e comunicação é o que define
            nosso <span className="text-primary-500">valor ético</span>.
          </p>
        </div>
      </section>

      {/* Video da loja controlado pela rolagem: a seção ocupa a tela toda
          durante o pin só para centralizar o vídeo achatado no meio dela. */}
      <section
        ref={storeSectionRef}
        className="relative flex h-screen items-center justify-center overflow-hidden bg-black"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 pb-12 pt-10 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white md:text-base">
            Conheça nossa loja!
          </h2>
        </div>
        <video
          ref={storeVideoRef}
          muted
          playsInline
          preload="metadata"
          className="h-[45vh] min-h-[320px] w-full object-cover md:h-[55vh]"
          aria-label="Interior da loja JR Veículos"
        >
          <source
            media="(max-width: 767px)"
            src={asset("videos/loja-conheca-scrub-mobile.mp4")}
            type="video/mp4"
          />
          <source
            src={asset("videos/loja-conheca-scrub.mp4")}
            type="video/mp4"
          />
        </video>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" />
      </section>

      {/* Contato */}
      <section id="contato" className="relative overflow-hidden pb-64 pt-64">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-black text-white md:text-left md:text-4xl">
            Entre em <span className="text-primary-500">contato</span> conosco!
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const message = `Novo contato do site JR Veículos:\n\nNome: ${nome}\nWhatsApp: ${whatsapp}\n\nMensagem:\n${mensagem}`;
              try {
                const sent = await whatsappService.sendToStore(message);
                if (!sent) {
                  toast.error(
                    "Nenhum vendedor cadastrado para receber mensagens.",
                  );
                  return;
                }
                toast.success("Mensagem preparada para envio.");
              } catch (error) {
                toast.error("Não foi possível verificar os vendedores.");
                console.error(error);
              }
            }}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-dark-300">
                  Nome:
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full rounded-md border border-dark-700 bg-dark-800 px-4 py-3 text-white placeholder-dark-500 transition-colors focus:border-primary-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-dark-300">
                  WhatsApp:
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="w-full rounded-md border border-dark-700 bg-dark-800 px-4 py-3 text-white placeholder-dark-500 transition-colors focus:border-primary-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-dark-300">
                Mensagem:
              </label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
                rows={5}
                className="w-full rounded-md border border-dark-700 bg-dark-800 px-4 py-3 text-white placeholder-dark-500 transition-colors focus:border-primary-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-10 py-3 font-bold uppercase tracking-[0.1em] text-white transition hover:bg-primary-500"
            >
              Enviar!
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
