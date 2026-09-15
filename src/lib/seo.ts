// Gerenciamento simples de SEO por página (title, meta tags, canonical e
// JSON-LD), sem depender de nenhuma biblioteca externa. Como o site é uma
// SPA renderizada no navegador, essas tags começam com um valor padrão no
// index.html e são atualizadas aqui a cada troca de rota.
import { useEffect } from "react";

const RAW_SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  window.location.origin;
export const SITE_URL = RAW_SITE_URL.replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`;

interface SeoOptions {
  title: string;
  description: string;
  /** Caminho a partir da raiz, ex: "/estoque" ou "/veiculo/algo-id" */
  path: string;
  image?: string;
  /** Um ou mais blocos JSON-LD para injetar enquanto a página estiver montada */
  jsonLd?: object | object[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export function useSeo({ title, description, path, image, jsonLd }: SeoOptions) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);

    const url = `${SITE_URL}${path}`;
    const ogImage = image || DEFAULT_OG_IMAGE;

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    upsertCanonical(url);

    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const block of blocks) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(block);
        script.setAttribute("data-page-jsonld", "true");
        document.head.appendChild(script);
        scripts.push(script);
      }
    }

    return () => {
      scripts.forEach((script) => script.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, JSON.stringify(jsonLd)]);
}
