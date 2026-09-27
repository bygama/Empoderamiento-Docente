import { conRaya, enLimpio, type AutorDeAfuera, type DatosDeAfuera } from "./datos";
import { normalizarDoi } from "./doi";

// Lo que dice OpenAlex de una publicación (`api.openalex.org/works/doi:…`): la
// segunda fuente, para los DOI que no están en Crossref (los de DataCite, por
// ejemplo). No separa apellidos, y el resumen viene como índice invertido.
// Sin ED.

type Objeto = Record<string, unknown>;

const esObjeto = (v: unknown): v is Objeto => typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown): string | undefined => (typeof v === "string" && enLimpio(v) ? enLimpio(v) : undefined);

/** El resumen armado desde su índice invertido: `{ palabra: [posiciones] }` → el texto en orden. */
export function resumenDesdeIndice(indice: unknown): string | undefined {
  if (!esObjeto(indice)) return undefined;
  const palabras: string[] = [];
  for (const [palabra, posiciones] of Object.entries(indice)) {
    if (!Array.isArray(posiciones)) continue;
    for (const p of posiciones) if (typeof p === "number" && p >= 0 && p < 5000) palabras[p] = palabra;
  }
  const armado = palabras.filter(Boolean).join(" ");
  return armado ? enLimpio(armado) : undefined;
}

function autoresDe(v: unknown): AutorDeAfuera[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const autores = v.filter(esObjeto).flatMap((a): AutorDeAfuera[] => {
    const nombre = texto(a.raw_author_name) ?? (esObjeto(a.author) ? texto(a.author.display_name) : undefined);
    return nombre ? [{ nombre }] : [];
  });
  return autores.length ? autores : undefined;
}

/** Lo que dice OpenAlex, o `null` si la respuesta no es una publicación. */
export function leerOpenAlex(respuesta: unknown): DatosDeAfuera | null {
  if (!esObjeto(respuesta)) return null;
  const titulo = texto(respuesta.title) ?? texto(respuesta.display_name);
  if (!titulo) return null;
  const lugar = esObjeto(respuesta.primary_location) ? respuesta.primary_location : {};
  const fuente = esObjeto(lugar.source) ? lugar.source : {};
  const biblio = esObjeto(respuesta.biblio) ? respuesta.biblio : {};
  const [desde, hasta] = [texto(biblio.first_page), texto(biblio.last_page)];
  const doi = typeof respuesta.doi === "string" ? (normalizarDoi(respuesta.doi) ?? undefined) : undefined;
  return {
    titulo,
    autores: autoresDe(respuesta.authorships),
    fecha: texto(respuesta.publication_date) ?? (typeof respuesta.publication_year === "number" ? String(respuesta.publication_year) : undefined),
    revista: texto(fuente.display_name),
    volumen: texto(biblio.volume),
    numero: texto(biblio.issue),
    paginas: desde && hasta && desde !== hasta ? conRaya(`${desde}-${hasta}`) : undefined,
    doi,
    url: texto(lugar.landing_page_url),
    resumen: resumenDesdeIndice(respuesta.abstract_inverted_index),
    tipo: texto(respuesta.type),
  };
}
