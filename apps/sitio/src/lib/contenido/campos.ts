import { z } from "zod";
import { esSrcDeFoto } from "./fotos";

// Los tipos de campo con los que se escribe el esquema de una sección
// (SPEC §4.2). Sin dominio de ED. Cada campo valida y, aparte, deja en un
// registro de Zod lo que el admin necesita para dibujarlo: etiqueta, largo
// máximo, ayuda. El registro va por instancia, por eso cada llamada crea un
// esquema nuevo: dos campos nunca comparten metadata.

type Comun = { etiqueta?: string; ayuda?: string };

export type MetaDeCampo =
  | ({ tipo: "textoCorto"; maximo: number } & Comun)
  | ({ tipo: "parrafo"; maximo: number } & Comun)
  | ({ tipo: "foto" } & Comun)
  | ({ tipo: "rutaInterna" } & Comun)
  | ({ tipo: "listaFija"; cantidad: number; etiquetaDelItem?: string } & Comun)
  | ({ tipo: "grupo" } & Comun);

const registro = z.registry<MetaDeCampo>();

/** Lo que el admin sabe de un campo, o `undefined` si el esquema no salió de acá. */
export function metaDe(esquema: z.ZodType): MetaDeCampo | undefined {
  return registro.get(esquema);
}

const SIN_SALTOS = /^[^\r\n]*$/;

/** Una línea, sin saltos. El admin muestra el contador y la ayuda. */
export function textoCorto({ maximo, ...resto }: { maximo: number } & Comun) {
  return z
    .string()
    .trim()
    .min(1, "Este texto no puede quedar vacío.")
    .max(maximo, `Como mucho ${maximo} caracteres.`)
    .regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.")
    .register(registro, { tipo: "textoCorto", maximo, ...resto });
}

/** Varias líneas. */
export function parrafo({ maximo, ...resto }: { maximo: number } & Comun) {
  return z
    .string()
    .trim()
    .min(1, "Este texto no puede quedar vacío.")
    .max(maximo, `Como mucho ${maximo} caracteres.`)
    .register(registro, { tipo: "parrafo", maximo, ...resto });
}

/**
 * Una foto: de dónde sale (`/fotos/…` de `public/`, `/api/fotos/<id>` o el
 * Blob del sitio: nada más, ver fotos.ts), su texto alternativo —obligatorio—
 * y el punto de foco en 0..1. `alt` y `foco` van con cada uso y no con el
 * archivo: la misma foto en dos marcos puede pedir otro alt y otro recorte
 * (DECISIONS, 1).
 */
export function foto(opciones: Comun = {}) {
  return z
    .object({
      src: z.string().trim().min(1, "Falta la foto.").refine(esSrcDeFoto, "La foto tiene que estar en /fotos/, en /api/fotos/ o en el Blob del sitio."),
      alt: z.string().trim().min(1, "El texto alternativo es obligatorio.").max(200, "Como mucho 200 caracteres."),
      foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
    })
    .register(registro, { tipo: "foto", ...opciones });
}

/** Una de las rutas del sitio. La lista cerrada la trae quien llama (`config/nav.ts`): acá no se sabe de ED. */
export function rutaInterna(rutas: readonly string[], opciones: Comun = {}) {
  return z.enum(rutas).register(registro, { tipo: "rutaInterna", ...opciones });
}

/** Exactamente `cantidad` ítems: la cantidad es parte de la escena, no del contenido. */
export function listaFija<T extends z.ZodType>(cantidad: number, item: T, opciones: Comun & { etiquetaDelItem?: string } = {}) {
  return z
    .array(item)
    .length(cantidad, `Son ${cantidad} ítems, ni más ni menos.`)
    .register(registro, { tipo: "listaFija", cantidad, ...opciones });
}

/** Un grupo de campos con nombre propio (un botón: texto + ruta). */
export function grupo<T extends z.ZodRawShape>(forma: T, opciones: Comun = {}) {
  return z.object(forma).register(registro, { tipo: "grupo", ...opciones });
}
