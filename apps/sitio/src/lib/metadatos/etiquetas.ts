import { conRaya, enLimpio, type AutorDeAfuera, type DatosDeAfuera } from "./datos";
import { normalizarDoi } from "./doi";

// Lo que dice una página de sí misma, en sus `<meta>`: las etiquetas
// `citation_*` (Highwire, las que ponen las revistas para Google Scholar),
// la tercera fuente, y Open Graph, la cuarta. Un lector chico de `<meta>`, sin
// parser de HTML: solo se leen atributos. Sin ED.

const META = /<meta\b[^>]*>/gi;
const ATRIBUTO = /([^\s=/>"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

/** Las etiquetas `<meta>` de una página: su nombre (`name` o `property`, en minúsculas) y sus valores, en orden. */
export function etiquetasDe(html: string): Map<string, string[]> {
  const etiquetas = new Map<string, string[]>();
  for (const [tag] of html.matchAll(META)) {
    const atributos = new Map<string, string>();
    for (const m of tag.matchAll(ATRIBUTO)) atributos.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? "");
    const nombre = (atributos.get("name") ?? atributos.get("property"))?.toLowerCase();
    const valor = enLimpio(atributos.get("content") ?? "");
    if (nombre && valor) etiquetas.set(nombre, [...(etiquetas.get(nombre) ?? []), valor]);
  }
  return etiquetas;
}

/** «2026/01/01», «08/2022», «2022-08-01» o «2022» → «2026-01», «2022-08», «2022»; `undefined` si no hay un año. */
export function fechaDeEtiqueta(texto: string | undefined): string | undefined {
  if (!texto) return undefined;
  const conMes = (anio: string, mes: string) => (Number(mes) >= 1 && Number(mes) <= 12 ? `${anio}-${mes.padStart(2, "0")}` : anio);
  const anioYMes = /^(\d{4})[-/](\d{1,2})\b/.exec(texto);
  if (anioYMes) return conMes(anioYMes[1], anioYMes[2]);
  const mesYAnio = /^(\d{1,2})[-/](\d{4})$/.exec(texto);
  if (mesYAnio) return conMes(mesYAnio[2], mesYAnio[1]);
  return /\b(\d{4})\b/.exec(texto)?.[1];
}

/** «Briceño Solís, Eduardo Carlos» (como las escribe SciELO) o «Eduardo Carlos Briceño Solís». */
function autorDeEtiqueta(texto: string): AutorDeAfuera {
  const [apellidos, nombres] = texto.split(",").map((p) => p.trim());
  return nombres ? { nombre: `${nombres} ${apellidos}`, apellidos, nombres } : { nombre: texto };
}

/** El tipo que se deduce de las etiquetas, dicho como Crossref. */
function tipoDeEtiquetas(e: Map<string, string[]>): string | undefined {
  if (e.has("citation_journal_title")) return "journal-article";
  if (e.has("citation_conference_title")) return "proceedings-article";
  if (e.has("citation_dissertation_institution")) return "dissertation";
  if (e.has("citation_inbook_title") || e.has("citation_book_title")) return "book-chapter";
  return e.has("citation_isbn") ? "book" : undefined;
}

/** Lo que dicen las `citation_*` de una página, o `null` si no tiene título. */
export function leerCitation(e: Map<string, string[]>): DatosDeAfuera | null {
  const uno = (nombre: string) => e.get(nombre)?.[0];
  const titulo = uno("citation_title");
  if (!titulo) return null;
  const autores = [...new Set(e.get("citation_author") ?? [])].map(autorDeEtiqueta);
  const [desde, hasta] = [uno("citation_firstpage"), uno("citation_lastpage")];
  const paginas = desde && hasta && /^\d+$/.test(desde) && /^\d+$/.test(hasta) && desde !== hasta ? conRaya(`${desde}-${hasta}`) : undefined;
  return {
    titulo,
    autores: autores.length ? autores : undefined,
    fecha: fechaDeEtiqueta(uno("citation_publication_date") ?? uno("citation_date") ?? uno("citation_online_date")),
    revista: uno("citation_journal_title") ?? uno("citation_conference_title") ?? uno("citation_inbook_title") ?? uno("citation_book_title"),
    editorial: uno("citation_publisher") ?? uno("citation_dissertation_institution"),
    volumen: uno("citation_volume"),
    numero: uno("citation_issue"),
    paginas,
    doi: normalizarDoi(uno("citation_doi") ?? "") ?? undefined,
    resumen: uno("citation_abstract"),
    tipo: tipoDeEtiquetas(e),
  };
}

/** Lo que dice el Open Graph de una página, o `null` si no tiene título. */
export function leerOpenGraph(e: Map<string, string[]>): DatosDeAfuera | null {
  const titulo = e.get("og:title")?.[0];
  if (!titulo) return null;
  return { titulo, resumen: e.get("og:description")?.[0], sitio: e.get("og:site_name")?.[0], url: e.get("og:url")?.[0], tipo: e.get("og:type")?.[0] };
}
