import type { Tono } from "@ed/kit-admin";

// Lo que dice Google de cada página (el `coverageState` de la API de
// inspección), en castellano. Google lo manda en inglés y sin lista cerrada:
// lo que no está acá se muestra tal cual, que es mejor que no decir nada.

const EN_CASTELLANO: Record<string, string> = {
  "Submitted and indexed": "Está en el índice; llegó por el sitemap.",
  "Indexed, not submitted in sitemap": "Está en el índice, aunque no llegó por el sitemap.",
  "Crawled - currently not indexed": "Google la visitó, pero todavía no la sumó al índice.",
  "Discovered - currently not indexed": "Google sabe que existe, pero todavía no la visitó.",
  "URL is unknown to Google": "Google todavía no la conoce.",
  "Excluded by 'noindex' tag": "Afuera: la página pide no estar en buscadores.",
  "Page with redirect": "Afuera: la página redirige a otra.",
  "Not found (404)": "Afuera: Google recibió un 404.",
  "Duplicate without user-selected canonical": "Afuera: Google la ve igual a otra y eligió esa.",
  "Duplicate, Google chose different canonical than user": "Afuera: Google eligió otra versión de la página.",
  "Alternate page with proper canonical tag": "Afuera: es una versión de otra página, como corresponde.",
  "Blocked by robots.txt": "Afuera: robots.txt no deja que Google la lea.",
  "Server error (5xx)": "Afuera: el servidor le dio un error a Google.",
};

export function coberturaEnCastellano(cobertura: string): string {
  return EN_CASTELLANO[cobertura] ?? cobertura;
}

/** La insignia de una página según el veredicto de Google: en el índice, afuera, o sin revisar todavía. */
export function insigniaDeIndexacion(veredicto: string | null): { tono: Tono; texto: string } {
  if (!veredicto) return { tono: "apagado", texto: "Sin revisar" };
  return veredicto === "PASS" ? { tono: "normal", texto: "En Google" } : { tono: "fuerte", texto: "Fuera de Google" };
}
