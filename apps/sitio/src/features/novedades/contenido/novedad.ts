import { z } from "zod";
import { esValido, LARGO_MAXIMO } from "@ed/db/slug";
import { MATERIALES } from "@/features/biblioteca/data/materiales";
import { esSrcDeFoto } from "@/lib/contenido/fotos";
import { CATEGORIAS, TOPES } from "./modelo";

// Qué es una novedad (SPEC §5.1 de `work/novedades-y-kit/`), en dos esquemas
// con los mismos campos y los mismos topes. `esquemaNovedad` es lo que el
// sitio necesita, completo: se valida al publicar y otra vez al leer.
// `esquemaBorrador` deja todo vacío, porque un borrador puede estar a medias:
// guardar no frena por lo que falta, frena por lo que está mal. Lo que no
// necesita Zod (las categorías, los topes, el orden) vive en modelo.ts.

const SIN_SALTOS = /^[^\r\n]*$/;

/** Una línea, con su tope; vacía solo en un borrador. */
function linea(maximo: number, publicar: boolean) {
  const texto = z.string().trim().max(maximo, `Como mucho ${maximo} caracteres.`).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.");
  return publicar ? texto.min(1, "Este texto no puede quedar vacío.") : texto;
}

// Día, mes o año: la precisión que da la fuente. El mes y el día, con sus ceros.
const FECHA = /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;

/** Que el día exista en ese mes: el 30 de febrero pasa la forma y no es una fecha. */
function existe(fecha: string): boolean {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return !dia || new Date(Date.UTC(anio, mes - 1, dia)).getUTCDate() === dia;
}

function fechaDe(publicar: boolean) {
  return z
    .string()
    .trim()
    .refine((f) => !publicar || f !== "", "Falta la fecha: al menos el año.")
    .refine((f) => f === "" || (FECHA.test(f) && existe(f)), "Esa fecha no existe: el año con sus cuatro cifras, y el mes y el día si se saben.");
}

function slugDe(publicar: boolean) {
  return z
    .string()
    .trim()
    .max(LARGO_MAXIMO, `Como mucho ${LARGO_MAXIMO} caracteres.`)
    .refine((s) => !publicar || s !== "", "Falta la URL.")
    .refine((s) => s === "" || esValido(s), "La URL va en minúsculas y sin acentos ni espacios: letras, números y guiones.");
}

/** Una foto del contenido: el archivo, el alt y el foco. En un borrador, puede no haber archivo todavía. */
function fotoDe(publicar: boolean) {
  return z.object({
    src: z
      .string()
      .trim()
      .refine((s) => !publicar || s !== "", "Falta la foto.")
      .refine((s) => s === "" || esSrcDeFoto(s), "La foto tiene que estar en /fotos/, en /api/fotos/ o en el Blob del sitio."),
    alt: linea(TOPES.alt, publicar),
    foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
  });
}

/** Una sección del cuerpo: un título y sus párrafos, cada uno un renglón del formulario. */
function seccionDe(publicar: boolean) {
  return z.object({
    titulo: linea(TOPES.tituloDeSeccion, publicar),
    parrafos: z
      .array(z.string().trim().min(1))
      .refine((p) => !publicar || p.length > 0, "La sección no tiene texto.")
      .refine((p) => p.join("\n").length <= TOPES.textoDeSeccion, `Como mucho ${TOPES.textoDeSeccion} caracteres por sección.`),
  });
}

const TITULOS_DEL_CATALOGO = MATERIALES.map((m) => m.titulo);

function esquemaDe(publicar: boolean) {
  return z.object({
    slug: slugDe(publicar),
    titulo: linea(TOPES.titulo, publicar),
    bajada: linea(TOPES.bajada, publicar),
    fecha: fechaDe(publicar),
    categoria: z.enum(CATEGORIAS.map((c) => c.clave), { error: "Elegí una categoría de la lista." }),
    imagen: fotoDe(publicar),
    cuerpo: z.array(seccionDe(publicar)).max(TOPES.secciones, `Como mucho ${TOPES.secciones} secciones.`),
    destacada: z.boolean(),
    // El título exacto del material de la Biblioteca que la ficha abre. Texto
    // hasta la lane 8, que lo pasa a una relación (DECISIONS, B).
    publicacion: z.enum(TITULOS_DEL_CATALOGO, { error: "Esa publicación no está en la Biblioteca." }).nullable(),
    imagenParaRedes: fotoDe(publicar).nullable(),
  });
}

/** Lo que el sitio necesita, completo: se valida al publicar y al leer. */
export const esquemaNovedad = esquemaDe(true);

/** Lo mismo, pero todo puede estar vacío: se valida al guardar un borrador. */
export const esquemaBorrador = esquemaDe(false);

export type Novedad = z.output<typeof esquemaNovedad>;
export type BorradorDeNovedad = z.output<typeof esquemaBorrador>;
export type SeccionDelCuerpo = Novedad["cuerpo"][number];

/** Lo que reciben los componentes del sitio: la novedad, con el ancla de cada sección del cuerpo (`anclasDe`). */
export type NovedadDelSitio = Omit<Novedad, "cuerpo"> & { cuerpo: Array<SeccionDelCuerpo & { ancla: string }> };
