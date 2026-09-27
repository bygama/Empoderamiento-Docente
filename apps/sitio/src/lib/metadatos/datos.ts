// Lo que dicen las fuentes de afuera de una publicación (Crossref, OpenAlex,
// las etiquetas de una página), todo en una forma: la que llenan los lectores
// y lee quien agrega un material (SPEC §8 de `work/biblioteca/`). Sin ED: nada
// de «tipo de material», solo lo que la fuente dijo. Y cómo se limpia un texto
// que llega de afuera.

/** Quien firma: el nombre entero y, si la fuente los separa, apellidos y nombres. */
export type AutorDeAfuera = { nombre: string; apellidos?: string; nombres?: string };

export type DatosDeAfuera = {
  titulo?: string;
  autores?: AutorDeAfuera[];
  /** `AAAA`, `AAAA-MM` o `AAAA-MM-DD`: la precisión que dio la fuente. */
  fecha?: string;
  /** La revista, o el libro de un capítulo. */
  revista?: string;
  editorial?: string;
  /** El nombre del sitio, cuando no hay otra cosa (Open Graph). */
  sitio?: string;
  volumen?: string;
  numero?: string;
  /** «157–177», con la raya del rango. */
  paginas?: string;
  doi?: string;
  url?: string;
  resumen?: string;
  /** El tipo como lo dice la fuente: `journal-article`, `article`, `book-chapter`… */
  tipo?: string;
};

const NOMBRADAS: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  laquo: "«",
  raquo: "»",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  iexcl: "¡",
  iquest: "¿",
};
const ACENTOS: Record<string, string> = { acute: "́", grave: "̀", uml: "̈", tilde: "̃", circ: "̂", cedil: "̧" };

/** `&eacute;`, `&#233;` y `&#xE9;` → «é». Las nombradas que no conoce quedan como vinieron. */
export function decodificarEntidades(texto: string): string {
  return texto.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entera, cuerpo: string) => {
    if (cuerpo[0] === "#") {
      const codigo = cuerpo[1].toLowerCase() === "x" ? parseInt(cuerpo.slice(2), 16) : parseInt(cuerpo.slice(1), 10);
      return codigo > 0 && codigo <= 0x10ffff ? String.fromCodePoint(codigo) : entera;
    }
    if (NOMBRADAS[cuerpo]) return NOMBRADAS[cuerpo];
    const acento = /^([a-z])(acute|grave|uml|tilde|circ|cedil)$/i.exec(cuerpo);
    return acento ? `${acento[1]}${ACENTOS[acento[2]]}`.normalize("NFC") : entera;
  });
}

/** Un texto de afuera, en limpio: sin etiquetas, con las entidades resueltas, los espacios de a uno y ninguno antes de un signo. */
export function enLimpio(texto: string): string {
  return decodificarEntidades(texto.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:!?)])/g, "$1")
    .trim();
}

/** El resumen en JATS de Crossref, en texto: sin su título («Resumen», «Abstract»), ni cuando viene pegado al texto, ni etiquetas. */
export function jatsATexto(jats: string): string {
  return enLimpio(jats.replace(/<jats:title>[\s\S]*?<\/jats:title>/gi, " ")).replace(/^(?:resumen|abstract|resumo)\b[:.]?\s*/i, "");
}

/** Un rango de páginas con la raya: «157-177» → «157–177». */
export const conRaya = (paginas: string) => paginas.replace(/\s*[-‐‑–—]\s*/g, "–");
