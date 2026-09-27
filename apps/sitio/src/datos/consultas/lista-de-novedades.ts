import type { Novedad as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { etiquetaDeCategoria } from "@/features/novedades/contenido/modelo";
import { compararFechas } from "@/features/novedades/contenido/fechas";
import { comoDocumento } from "@/lib/contenido/documento";
import { publicadoDe } from "./novedades";

// Lo que lee la lista de Novedades del admin (SPEC §6.1 de
// `work/novedades-y-kit/`): Publicadas o Borradores, con el buscador. Son
// decenas de filas: se leen todas y se filtran acá, sin índice.

export type PestanaDeNovedades = "publicadas" | "borradores";

/** Borrador: nunca se publicó. Despublicada: estuvo en el sitio. Con cambios: está en el sitio y tiene un borrador. */
export type EstadoDeNovedad = "borrador" | "despublicada" | "publicada" | "con-cambios";

export type FilaDeLaLista = {
  id: string;
  /** El de lo que se edita (el borrador, o lo publicado); vacío si todavía no tiene. */
  titulo: string;
  categoria: string;
  fecha: string;
  estado: EstadoDeNovedad;
  /** La destacada que está en el sitio. */
  destacada: boolean;
  /** Lo último que le pasó: quién, cuándo y qué. */
  ultimo: { que: "guardo" | "publico" | "creo"; quien: string | null; en: string };
};

const texto = (v: unknown) => (typeof v === "string" ? v : "");

/** «Educación» y «educacion» son lo mismo para quien busca. */
const normalizar = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Si el título tiene lo buscado (ya normalizado). Aparte: react-doctor lee el `includes` de un texto como el de una lista. */
function tieneLoBuscado(titulo: string, buscado: string): boolean {
  return normalizar(titulo).includes(buscado);
}

function estadoDe(f: Fila): EstadoDeNovedad {
  if (f.publicada) return f.borrador ? "con-cambios" : "publicada";
  return f.publicadaEn ? "despublicada" : "borrador";
}

function ultimoDe(f: Fila): FilaDeLaLista["ultimo"] {
  if (f.borradorEn) return { que: "guardo", quien: f.borradorPor, en: f.borradorEn.toISOString() };
  if (f.publicadaEn) return { que: "publico", quien: f.publicadaPor, en: f.publicadaEn.toISOString() };
  return { que: "creo", quien: f.creadaPor, en: f.creadaEn.toISOString() };
}

/** Las filas de una pestaña, las que tienen lo buscado en el título, de la más nueva a la más vieja. Pura: se prueba sin base. */
export function filasDeLaLista(filas: readonly Fila[], pestana: PestanaDeNovedades, q?: string): FilaDeLaLista[] {
  const buscado = q ? normalizar(q) : "";
  return filas
    .filter((f) => f.publicada === (pestana === "publicadas"))
    .map((f) => {
      const d = comoDocumento(f.borrador ?? publicadoDe(f));
      return {
        id: f.id,
        titulo: texto(d.titulo).trim(),
        categoria: etiquetaDeCategoria(texto(d.categoria)),
        fecha: texto(d.fecha),
        estado: estadoDe(f),
        destacada: f.publicada && f.destacada,
        ultimo: ultimoDe(f),
      };
    })
    .filter((f) => !buscado || tieneLoBuscado(f.titulo, buscado))
    .sort((a, b) => compararFechas(a.fecha, b.fecha) || b.ultimo.en.localeCompare(a.ultimo.en));
}

/** La lista de una pestaña y si hay alguna novedad en todo el módulo (para decir «Todavía no hay novedades»). */
export async function listaDeNovedades(pestana: PestanaDeNovedades, q?: string): Promise<{ filas: FilaDeLaLista[]; hayNovedades: boolean }> {
  const filas = await base.novedad.findMany();
  return { filas: filasDeLaLista(filas, pestana, q), hayNovedades: filas.length > 0 };
}
