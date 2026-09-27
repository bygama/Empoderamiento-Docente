import { citaApa } from "@/features/biblioteca/contenido/cita";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import { TOPES, type Tipo } from "@/features/biblioteca/contenido/modelo";
import type { DatosDeAfuera } from "@/lib/metadatos/datos";
import { linkDelDoi } from "@/lib/metadatos/doi";

// Lo que dijo una fuente de afuera, pasado a los campos de un material (SPEC
// §8 de `work/biblioteca/`). Lo de ED vive acá, y no en `lib/metadatos/`: el
// tipo de la fuente pasado a uno de los siete, la fuente que se lee en «Leer
// en…» y la cita armada con los apellidos exactos cuando la fuente los da.

/** De dónde salió un dato: lo que la ficha dice debajo del campo. */
export type Fuente = "crossref" | "openalex" | "pagina" | "redes";

export type CamposDeAfuera = Partial<Pick<BorradorDeMaterial, "titulo" | "autorias" | "fecha" | "fuente" | "doi" | "url" | "paginas" | "descripcion" | "tipo" | "cita">>;

const TIPOS_DE_LA_FUENTE: Record<string, Tipo> = {
  "journal-article": "Artículos",
  article: "Artículos",
  "book-chapter": "Capítulos de libro",
  "book-section": "Capítulos de libro",
  "book-part": "Capítulos de libro",
  book: "Libros",
  monograph: "Libros",
  "edited-book": "Libros",
  "reference-book": "Libros",
  dissertation: "Tesis",
  "proceedings-article": "Actas de congreso",
  proceedings: "Actas de congreso",
};

/** «157–177» → 21 páginas; lo que no es un rango de números, nada. */
function paginasDe(rango: string | undefined): number | undefined {
  const [desde, hasta] = (rango ?? "").split("–").map(Number);
  const cuantas = hasta - desde + 1;
  return Number.isInteger(cuantas) && cuantas > 0 && cuantas <= TOPES.paginas ? cuantas : undefined;
}

/** Un resumen hasta el tope de la descripción, cortado en una palabra. */
function recortado(texto: string | undefined): string | undefined {
  if (!texto || texto.length <= TOPES.descripcion) return texto;
  return `${texto.slice(0, TOPES.descripcion - 1).replace(/\s+\S*$/, "")}…`;
}

/**
 * Los campos que da una fuente, sin los vacíos. La cita se arma solo si la
 * fuente separa los apellidos o trae el volumen: si no, la generada del sitio
 * dice lo mismo, y es mejor que siga a los datos.
 */
export function camposDe(d: DatosDeAfuera, fuente: Fuente): CamposDeAfuera {
  const autores = d.autores?.map((a) => a.nombre.slice(0, TOPES.autor)).slice(0, TOPES.autores);
  const fecha = d.fecha ? d.fecha.slice(0, 7) : undefined;
  const dondeSeLee = d.revista ?? d.editorial ?? d.sitio;
  const conDetalle = Boolean(d.autores?.some((a) => a.apellidos) || d.volumen);
  const cita =
    conDetalle && d.titulo && fecha
      ? citaApa({ autores: d.autores ?? [], fecha, titulo: d.titulo, fuente: dondeSeLee ?? "", volumen: d.volumen, numero: d.numero, paginas: d.paginas, doi: d.doi ?? "", url: d.url ?? "" })
      : undefined;
  const campos: CamposDeAfuera = {
    titulo: d.titulo?.slice(0, TOPES.titulo),
    autorias: autores?.length ? autores.map((nombre) => ({ nombre, persona: null })) : undefined,
    fecha,
    fuente: dondeSeLee?.slice(0, TOPES.fuente),
    doi: d.doi,
    url: d.doi ? linkDelDoi(d.doi) : d.url,
    paginas: paginasDe(d.paginas),
    descripcion: recortado(d.resumen),
    tipo: d.tipo && fuente !== "redes" ? TIPOS_DE_LA_FUENTE[d.tipo] : undefined,
    cita: cita && cita.length <= TOPES.cita ? cita : undefined,
  };
  return Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined && v !== "")) as CamposDeAfuera;
}

/**
 * Junta las fuentes en orden: cada campo queda con la primera que lo dio, y
 * dice cuál fue. Las siguientes solo llenan lo que falta.
 */
export function juntar(lecturas: ReadonlyArray<{ fuente: Fuente; campos: CamposDeAfuera }>): { datos: CamposDeAfuera; origen: Partial<Record<keyof CamposDeAfuera, Fuente>> } {
  const datos: CamposDeAfuera = {};
  const origen: Partial<Record<keyof CamposDeAfuera, Fuente>> = {};
  for (const { fuente, campos } of lecturas) {
    for (const [campo, valor] of Object.entries(campos) as Array<[keyof CamposDeAfuera, unknown]>) {
      if (campo in datos) continue;
      Object.assign(datos, { [campo]: valor });
      origen[campo] = fuente;
    }
  }
  return { datos, origen };
}
