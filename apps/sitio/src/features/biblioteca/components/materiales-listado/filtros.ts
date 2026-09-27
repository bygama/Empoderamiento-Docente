import { TIPOS } from "@/features/biblioteca/contenido/modelo";

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

/** Escribe (o borra) `?tipo=` sin tocar el historial ni el hash. */
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
}
