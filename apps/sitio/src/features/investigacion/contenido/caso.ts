import { z } from "zod";
import { esValido, LARGO_MAXIMO } from "@ed/db/slug";
import { RUTAS_INTERNAS } from "@/config/nav";
import { esSrcDeFoto } from "@/lib/contenido/fotos";
import { ESTADOS, SLUGS_RESERVADOS, SUJECIONES, TOPES } from "./modelo-de-casos";

// Qué es un caso de investigación (`work/casos-aliados-fotos/SPEC.md` §4),
// en dos esquemas con los mismos campos y los mismos topes, como una novedad
// (ADR-0014): `esquemaCaso` es lo que el sitio necesita, completo, y se
// valida al publicar y otra vez al leer; `esquemaBorradorDeCaso` deja los
// textos vacíos, porque un borrador puede estar a medias. El id y el número
// no están acá: son fijos (modelo-de-casos.ts).

const SIN_SALTOS = /^[^\r\n]*$/;

function texto(maximo: number, publicar: boolean, { unaLinea }: { unaLinea: boolean }) {
  let t = z.string().trim().max(maximo, `Como mucho ${maximo} caracteres.`);
  if (unaLinea) t = t.regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.");
  return publicar ? t.min(1, "Este texto no puede quedar vacío.") : t;
}

const linea = (maximo: number, publicar: boolean) => texto(maximo, publicar, { unaLinea: true });
const parrafo = (maximo: number, publicar: boolean) => texto(maximo, publicar, { unaLinea: false });

function slugDe(publicar: boolean) {
  return z
    .string()
    .trim()
    .max(LARGO_MAXIMO, `Como mucho ${LARGO_MAXIMO} caracteres.`)
    .refine((s) => !publicar || s !== "", "Falta la URL.")
    .refine((s) => s === "" || esValido(s), "La URL va en minúsculas y sin acentos ni espacios: letras, números y guiones.")
    .refine((s) => !SLUGS_RESERVADOS.includes(s), "Ese es el nombre de una sección de Investigación: elegí otra.");
}

/** La lámina: una foto de Fotos, cómo está sujeta y su rótulo. En un borrador, la foto puede faltar. */
function laminaDe(publicar: boolean) {
  return z.object({
    foto: z.object({
      src: z
        .string()
        .trim()
        .refine((s) => !publicar || s !== "", "Falta la lámina.")
        .refine((s) => s === "" || esSrcDeFoto(s), "La lámina tiene que ser una foto de Fotos."),
      alt: linea(TOPES.alt, publicar),
      foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
    }),
    sujecion: z.enum(SUJECIONES.map((s) => s.valor), { error: "Elegí cómo está sujeta." }),
    rotulo: linea(TOPES.rotuloDeLamina, publicar),
  });
}

/** Una evidencia: el título va en mayúsculas, como el rótulo de un archivo (el sitio lo pasa a oración en las notas). */
function evidenciaDe(publicar: boolean) {
  return z.object({
    titulo: linea(TOPES.tituloDeEvidencia, publicar).refine((t) => t === t.toLocaleUpperCase("es"), "Va en mayúsculas, como el rótulo de un archivo."),
    descripcion: linea(TOPES.descripcionDeEvidencia, publicar),
    movible: z.boolean(),
  });
}

function produccionDe(publicar: boolean) {
  return z.object({
    titulo: linea(TOPES.tituloDeProduccion, publicar),
    href: z.enum(RUTAS_INTERNAS, { error: "Elegí a qué página lleva." }),
  });
}

function esquemaDe(publicar: boolean) {
  return z.object({
    slug: slugDe(publicar),
    pregunta: linea(TOPES.pregunta, publicar),
    eje: linea(TOPES.eje, publicar),
    indicio: linea(TOPES.indicio, publicar),
    periodo: linea(TOPES.periodo, publicar),
    ambito: linea(TOPES.ambito, publicar),
    estado: z.enum(ESTADOS.map((e) => e.valor), { error: "Elegí el estado." }),
    contexto: parrafo(TOPES.contexto, publicar),
    preguntaInvestigacion: parrafo(TOPES.preguntaInvestigacion, publicar),
    lamina: laminaDe(publicar),
    evidencias: z
      .array(evidenciaDe(publicar))
      .max(TOPES.evidencias, `Como mucho ${TOPES.evidencias} evidencias.`)
      .refine((e) => !publicar || e.length > 0, "El expediente necesita al menos una evidencia."),
    analisis: parrafo(TOPES.analisis, publicar),
    aprendizaje: linea(TOPES.aprendizaje, publicar),
    queCambio: parrafo(TOPES.queCambio, publicar),
    produccionRelacionada: z
      .array(produccionDe(publicar))
      .max(TOPES.producciones, `Como mucho ${TOPES.producciones}.`)
      .refine((p) => new Set(p.map((x) => x.titulo)).size === p.length, "Dos producciones no pueden tener el mismo título."),
    // Prende las marcas DEMO y la aclaración al pie del expediente.
    esDemo: z.boolean(),
    aclaracion: parrafo(TOPES.aclaracion, false),
  });
}

/** Lo que el sitio necesita, completo: se valida al publicar y al leer. */
export const esquemaCaso = esquemaDe(true);

/** Lo mismo, pero los textos pueden estar vacíos: se valida al guardar un borrador. */
export const esquemaBorradorDeCaso = esquemaDe(false);

export type Caso = z.output<typeof esquemaCaso>;
export type BorradorDeCaso = z.output<typeof esquemaBorradorDeCaso>;
