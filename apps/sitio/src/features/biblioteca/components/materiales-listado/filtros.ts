import { TIPOS } from "@/features/biblioteca/contenido/modelo";
import { getLenis } from "@/lib/lenis";
import { EVENTO_URL } from "@/lib/navegar";

// El estado de los filtros del catálogo y su ida y vuelta con la URL.

export type Filtros = {
  tipo: string | null;
  publico: string | null;
  anio: number | null;
};

export const SIN_FILTROS: Filtros = { tipo: null, publico: null, anio: null };

/** Búsqueda tolerante a tildes y mayúsculas ("evaluacion" matchea "Evaluación"). */
export const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Si un texto tiene lo buscado (`q`, ya normalizado). Aparte: react-doctor lee el `includes` de un texto como el de una lista. */
export function coincide(texto: string, q: string): boolean {
  return normalizar(texto).includes(q);
}

/** `?tipo=` de la URL, si es un tipo real del catálogo. */
export function tipoDeUrl(): string | null {
  const t = new URLSearchParams(window.location.search).get("tipo");
  return t && (TIPOS as readonly string[]).includes(t) ? t : null;
}

/**
 * Escribe (o borra) `?tipo=` sin tocar el historial ni el hash, y avisa
 * (EVENTO_URL): el tipo se elige desde tres lugares —el riel del hero, los
 * filtros del catálogo y el submenú del navbar— y cada uno marca el suyo
 * leyendo la URL.
 */
export function escribirTipoEnUrl(tipo: string | null) {
  const qs = new URLSearchParams(window.location.search);
  if (tipo) qs.set("tipo", tipo);
  else qs.delete("tipo");
  const q = qs.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`,
  );
  window.dispatchEvent(new Event(EVENTO_URL));
}

/** Avisar cuando cambia `?tipo=` (por EVENTO_URL o por el historial); devuelve cómo dejar de escuchar. */
export function alCambiarTipo(avisar: () => void): () => void {
  window.addEventListener(EVENTO_URL, avisar);
  window.addEventListener("popstate", avisar);
  return () => {
    window.removeEventListener(EVENTO_URL, avisar);
    window.removeEventListener("popstate", avisar);
  };
}

/**
 * Bajar del hero al catálogo. Por Lenis y no con el `scrollIntoView` nativo:
 * si lo buscado achica el listado, la página cambia de alto a mitad del viaje
 * y el deslizamiento nativo se corta en el lugar. El 96 espeja el
 * `scroll-mt-24` de la sección (el header fijo), que Lenis no lee.
 */
export function bajarAlCatalogo() {
  const el = document.getElementById("materiales");
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - 96);
  else el.scrollIntoView();
}

// El buscador del hero no tiene el estado de la búsqueda (vive en el
// listado): le pasa el texto con un evento de la ventana.
const EVENTO_BUSCAR = "ed:biblioteca-buscar";

/** El hero pide buscar `texto` en el catálogo. */
export function pedirBusqueda(texto: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENTO_BUSCAR, { detail: texto }));
}

/** El listado escucha lo que pide el hero; devuelve cómo dejar de escuchar. */
export function alPedirBusqueda(buscar: (texto: string) => void): () => void {
  const oir = (e: Event) => buscar((e as CustomEvent<string>).detail);
  window.addEventListener(EVENTO_BUSCAR, oir);
  return () => window.removeEventListener(EVENTO_BUSCAR, oir);
}
