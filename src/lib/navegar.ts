import { ScrollTrigger } from "gsap/ScrollTrigger";
import { irArriba, irASeccion } from "@/lib/indice";

/**
 * Ir a un DESTINO del sitio (`/pagina#seccion`, `/pagina?filtro=x#seccion`)
 * desde el navbar. Dos situaciones:
 *
 * - MISMA PÁGINA: no hay navegación. Se actualiza la URL (replaceState, sin
 *   entrada en el historial), se avisa a quien lea la query (EVENTO_URL,
 *   p. ej. el catálogo de Biblioteca con `?tipo=`) y se DESLIZA hasta la
 *   sección (irASeccion).
 * - OTRA PÁGINA: navega Next (Link con scroll={false}, para que no haga su
 *   propio salto al hash antes de tiempo) y, ya montada la página nueva,
 *   AterrizajePorLink lee el hash y llama a `aterrizarEn`.
 *
 * ATERRIZAR en medio de estas páginas es llegar dentro de escenas pinneadas
 * por ScrollTrigger. Recién montadas, sus pins todavía no midieron (algunas
 * los crean un frame después de pasar a "live"), así que la posición de la
 * sección cambia apenas después de montar. Por eso: se esperan dos frames,
 * se recalculan los triggers (ScrollTrigger.refresh) y recién ahí se corta;
 * irASeccion además vuelve a medir y corrige a los 400 y 1200 ms.
 */
export const EVENTO_URL = "ed:url";

export function partirDestino(href: string) {
  const u = new URL(href, "http://ed.local");
  return {
    pathname: u.pathname,
    search: u.search,
    hash: decodeURIComponent(u.hash.replace(/^#/, "")),
  };
}

/** Un ítem del submenú "está ahí" si su hash es la sección activa y, si
 *  lleva query, esa query coincide con la de la URL actual. */
export function coincideDestino(
  href: string,
  seccionActiva: string | null,
  search: string,
): boolean {
  const d = partirDestino(href);
  if (d.hash !== seccionActiva) return false;
  if (!d.search) return true;
  const quiere = new URLSearchParams(d.search);
  const hay = new URLSearchParams(search);
  for (const [k, v] of quiere) if (hay.get(k) !== v) return false;
  return true;
}

/** Misma página: URL + aviso + corte a la sección. */
export function irEnPagina(href: string) {
  const d = partirDestino(href);
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${d.search}${d.hash ? `#${d.hash}` : ""}`,
  );
  window.dispatchEvent(new Event(EVENTO_URL));
  if (d.hash) irASeccion(d.hash);
}

/**
 * onClick para un botón/link de la MISMA página que apunta a `#id` (los CTA
 * de los heros): reemplaza al ancla nativa para poder actualizar la URL sin
 * dejar entrada en el historial, y desliza como el navbar.
 * Con modificadores (nueva pestaña) no interviene.
 */
export function alClicIrA(id: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}#${id}`,
    );
    irASeccion(id);
  };
}

/**
 * onClick del RÓTULO de una página en el navbar. Si ya estás en esa página,
 * un Link a la misma ruta no hace nada visible: te quedás donde estabas. Acá
 * pasa a ser el atajo para volver arriba —scrolleaste dos secciones y querés
 * el principio— deslizando, y de paso saca el hash, que si no seguiría
 * apuntando a una sección que ya no estás mirando. Desde otra página no
 * interviene: navega Next como siempre.
 */
export function alClicSubirEnPagina(enPagina: boolean) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enPagina) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    irArriba();
  };
}

/** Página recién montada: refresca los pins y CORTA a la sección del hash.
 *  Corte y no deslizamiento: la persona acaba de llegar desde otra página,
 *  no pidió un viaje desde el tope de una página que nunca vio. */
export function aterrizarEn(id: string): () => void {
  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(() => {
      if (!document.getElementById(id)) return;
      ScrollTrigger.refresh();
      irASeccion(id, { corte: true });
    });
  });
  return () => cancelAnimationFrame(raf);
}
