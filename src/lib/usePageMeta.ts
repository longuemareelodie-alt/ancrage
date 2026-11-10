import { useEffect } from "react";

const SITE = "https://digitalmamanlibre.com";

type PageMeta = { title: string; description: string; path: string; jsonLd?: object };

function upsert(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  const created = !el;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  const previous = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return () => {
    if (created) el!.remove();
    else if (previous !== null) el!.setAttribute(attr, previous);
  };
}

const meta = (key: "name" | "property", k: string) => () => {
  const m = document.createElement("meta");
  m.setAttribute(key, k);
  return m;
};

/**
 * Titre, description, canonical et og:* propres à une page publique.
 * Lu par Google (qui exécute le JavaScript) ; restauré quand on quitte la page.
 */
export function usePageMeta({ title, description, path, jsonLd }: PageMeta) {
  useEffect(() => {
    const url = `${SITE}${path}`;
    const prevTitle = document.title;
    document.title = title;
    const undo = [
      upsert('meta[name="description"]', meta("name", "description"), "content", description),
      upsert('meta[property="og:title"]', meta("property", "og:title"), "content", title),
      upsert('meta[property="og:description"]', meta("property", "og:description"), "content", description),
      upsert('meta[property="og:url"]', meta("property", "og:url"), "content", url),
      upsert('meta[name="twitter:title"]', meta("name", "twitter:title"), "content", title),
      upsert('meta[name="twitter:description"]', meta("name", "twitter:description"), "content", description),
      upsert(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement("link");
          l.setAttribute("rel", "canonical");
          return l;
        },
        "href",
        url,
      ),
    ];
    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => {
      document.title = prevTitle;
      undo.forEach((u) => u());
      script?.remove();
    };
  }, [title, description, path, jsonLd]);
}
