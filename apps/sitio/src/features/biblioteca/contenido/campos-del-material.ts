import { z } from "zod";
import { esSrcDeFoto } from "@/lib/contenido/fotos";
import { esDoi, normalizarDoi } from "@/lib/metadatos/doi";
import { TOPES } from "./modelo";

// Los campos de un material, uno por uno, con sus topes y sus errores en
// llano (SPEC §5 de `work/biblioteca/`). Cada constructor recibe `publicar`:
// `true` exige lo que el sitio necesita; `false` deja todo vacío, que es lo
// que puede tener un borrador. `material.ts` los junta en los dos esquemas.

export const SIN_SALTOS = /^[^\r\n]*$/;

/** Una línea, con su tope; vacía solo en un borrador. */
export function linea(maximo: number, publicar: boolean, falta = "Este texto no puede quedar vacío.") {
  const texto = z.string().trim().max(maximo, `Como mucho ${maximo} caracteres.`).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.");
  return publicar ? texto.min(1, falta) : texto;
}

/** Un texto que no se exige: vacío es «no tiene». */
export function opcional(maximo: number) {
  return z.string().trim().max(maximo, `Como mucho ${maximo} caracteres.`);
}

/** Uno de una lista cerrada; en un borrador, también «todavía no se eligió». */
export function deLaLista<T extends readonly [string, ...string[]]>(lista: T, publicar: boolean, falta: string) {
  const opciones = z.enum(lista, { error: falta });
  return publicar ? opciones : z.union([opciones, z.literal("")], { error: falta });
}

// El año y, si se sabe, el mes: la precisión que da la fuente (DECISIONS, E).
const FECHA = /^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/;

export function fechaDe(publicar: boolean) {
  return z
    .string()
    .trim()
    .refine((f) => !publicar || f !== "", "Falta la fecha: al menos el año.")
    .refine((f) => f === "" || FECHA.test(f), "La fecha de un material va con el año y, si se sabe, el mes.");
}

// Un link de afuera (la revista, la editorial, doi.org) o un archivo propio
// del sitio (`/biblioteca/…pdf`). `http:` también: hay una revista que no
// tiene otro. Lo que no sea eso —`javascript:`, `//otro.sitio`— no pasa.
function esUrlDelMaterial(url: string): boolean {
  if (/^\/(?!\/)\S*$/.test(url)) return true;
  if (!/^https?:\/\//i.test(url)) return false;
  return URL.canParse(url);
}

export function urlDe(publicar: boolean) {
  return opcional(TOPES.url)
    .refine((u) => !publicar || u !== "", "Falta adónde lleva: el link de la revista, de la editorial o del DOI.")
    .refine((u) => u === "" || esUrlDelMaterial(u), "El link empieza con https:// (o es un archivo del sitio, que empieza con /).");
}

/** El DOI se guarda normalizado (`10.1590/abc`): se puede pegar con su link o con «doi:». */
export const doi = z
  .string()
  .trim()
  .transform((t) => (t === "" ? "" : (normalizarDoi(t) ?? t)))
  .refine((t) => t === "" || esDoi(t), "Ese DOI no parece un DOI: empieza con «10.» y tiene una barra.");

/** La portada propia; sin ella (`null`), el sitio muestra la tipográfica generada. */
export function portadaDe(publicar: boolean) {
  return z
    .object({
      src: z
        .string()
        .trim()
        .refine((s) => !publicar || s !== "", "Falta la foto de la portada.")
        .refine((s) => s === "" || esSrcDeFoto(s), "La portada tiene que estar en el sitio o en el Blob del sitio."),
      alt: linea(TOPES.alt, publicar),
      foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
    })
    .nullable();
}

export function autoriaDe(publicar: boolean) {
  return z.object({
    nombre: linea(TOPES.autor, publicar, "Falta el nombre de quien firma."),
    // El id de su perfil del Equipo (la fk de `autorias`): que exista lo
    // chequea `datos/` al guardar y al publicar (work/equipo/SPEC.md §4.2).
    persona: z.uuid({ error: "Esa persona no está en el Equipo." }).nullable(),
  });
}
