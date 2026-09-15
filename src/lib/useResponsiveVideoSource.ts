// O <source media="..."> só é avaliado quando o vídeo carrega pela primeira
// vez — se a pessoa girar o celular ou redimensionar a janela depois disso,
// o navegador não troca de vídeo sozinho. Este hook força a troca
// manualmente sempre que a tela cruza o breakpoint mobile.
import { useEffect, RefObject } from "react";

export function useResponsiveVideoSource(
  videoRef: RefObject<HTMLVideoElement>,
  mobileSrc: string,
  desktopSrc: string,
  breakpoint = "(max-width: 767px)",
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mql = window.matchMedia(breakpoint);

    const applySource = (wantMobile: boolean) => {
      const wantedSrc = wantMobile ? mobileSrc : desktopSrc;
      if (video.currentSrc.endsWith(wantedSrc)) return;
      const time = video.currentTime;
      const wasSeeking = time > 0;
      video.src = wantedSrc;
      video.load();
      if (wasSeeking) {
        video.addEventListener(
          "loadedmetadata",
          () => {
            video.currentTime = time;
          },
          { once: true },
        );
      }
    };

    const handleBreakpointChange = (e: MediaQueryListEvent) =>
      applySource(e.matches);

    mql.addEventListener("change", handleBreakpointChange);
    return () => mql.removeEventListener("change", handleBreakpointChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileSrc, desktopSrc, breakpoint]);
}
