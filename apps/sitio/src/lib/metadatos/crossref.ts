import { conRaya, enLimpio, jatsATexto, type AutorDeAfuera, type DatosDeAfuera } from "./datos";
import { normalizarDoi } from "./doi";

// Lo que dice Crossref de una publicación (la respuesta de `api.crossref.org`:
// el `message` de `works/{doi}`, o el primer ítem de `works?filter=isbn:…`).
// Crossref es la primera fuente: separa apellidos y nombres, y trae revista,
// volumen, número y páginas. Sin ED.

type Objeto = Record<string, unknown>;

const esObjeto = (v: unknown): v is Objeto => typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown): string | undefined => (typeof v === "string" && enLimpio(v) ? enLimpio(v) : undefined);
/** El primero de una lista de textos (Crossref pone el título y la revista en listas). */
const primero = (v: unknown) => (Array.isArray(v) ? texto(v[0]) : texto(v));

/** `{ "date-parts": [[2025, 12, 19]] }` → «2025-12-19», con la precisión que traiga. */
function fechaDe(v: unknown): string | undefined {
  if (!esObjeto(v) || !Array.isArray(v["date-parts"]) || !Array.isArray(v["date-parts"][0])) return undefined;
  const [anio, mes, dia] = v["date-parts"][0] as unknown[];
  if (typeof anio !== "number") return undefined;
  const dos = (n: unknown) => (typeof n === "number" ? `-${String(n).padStart(2, "0")}` : "");
  return `${anio}${dos(mes)}${mes ? dos(dia) : ""}`;
}

function autoresDe(v: unknown): AutorDeAfuera[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const autores = v.filter(esObjeto).flatMap((a): AutorDeAfuera[] => {
    const apellidos = texto(a.family);
    const nombres = texto(a.given) ?? "";
    if (apellidos) return [{ nombre: `${nombres} ${apellidos}`.trim(), apellidos, nombres }];
    const nombre = texto(a.name);
    return nombre ? [{ nombre }] : [];
  });
  return autores.length ? autores : undefined;
}

/** Lo que dice Crossref, o `null` si la respuesta no es una publicación. */
export function leerCrossref(respuesta: unknown): DatosDeAfuera | null {
  if (!esObjeto(respuesta)) return null;
  const titulo = primero(respuesta.title);
  if (!titulo) return null;
  const doi = typeof respuesta.DOI === "string" ? (normalizarDoi(respuesta.DOI) ?? undefined) : undefined;
  const pagina = texto(respuesta.page);
  const resumen = typeof respuesta.abstract === "string" ? jatsATexto(respuesta.abstract) : undefined;
  return {
    titulo,
    autores: autoresDe(respuesta.author),
    fecha: fechaDe(respuesta.issued) ?? fechaDe(respuesta.published) ?? fechaDe(respuesta["published-print"]) ?? fechaDe(respuesta["published-online"]),
    revista: primero(respuesta["container-title"]),
    editorial: texto(respuesta.publisher),
    volumen: texto(respuesta.volume),
    numero: texto(respuesta.issue),
    paginas: pagina ? conRaya(pagina) : undefined,
    doi,
    url: texto(respuesta.URL),
    resumen: resumen || undefined,
    tipo: texto(respuesta.type),
  };
}

/** El `message` de una respuesta de Crossref: la publicación, o el primer ítem de una búsqueda. */
export function publicacionDeCrossref(json: unknown): unknown {
  const mensaje = esObjeto(json) ? json.message : undefined;
  if (esObjeto(mensaje) && Array.isArray(mensaje.items)) return mensaje.items[0] ?? null;
  return mensaje ?? null;
}
