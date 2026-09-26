import type { CampoDeFormulario } from "@/lib/formularios/campos";
import { siteConfig } from "./site";

// El formulario de CV del sitio (/sumate-al-equipo) y lo que recibe /api/cv
// (work/mensajes/SPEC.md §5.2). De esta lista salen los controles, el
// esquema que valida el envío y lo que se guarda: cambiarla no toca nada más.

/**
 * Los campos del formulario de CV, en su orden.
 *
 * **PROVISORIA.** Falta que ED confirme qué datos pide a quien quiere sumarse
 * (SPEC del mapa del admin §8: «Qué datos pide el formulario de CV», y el
 * texto de la política de privacidad, con asesoría). Hasta entonces la entrada
 * pública está apagada (`cvAbierto`). Los niveles, sobre todo, son una
 * propuesta: cada país los nombra distinto.
 *
 * `nombre` y `correo` no se sacan: sin ellos no hay a quién responder, y un
 * test lo exige. `nombre`, `correo`, `pais` y `mensaje` van a sus columnas;
 * los demás, en el orden de acá, a `datos`.
 */
export const CAMPOS_DEL_CV = [
  { clave: "nombre", etiqueta: "Nombre y apellido", tipo: "texto", obligatorio: true, largo: 120, autocompletar: "name" },
  { clave: "correo", etiqueta: "Correo", tipo: "correo", obligatorio: true, autocompletar: "email" },
  { clave: "pais", etiqueta: "País", tipo: "opcion", obligatorio: true, opciones: [...siteConfig.paises, "Otro"] },
  {
    clave: "nivel",
    etiqueta: "Nivel en que enseñás",
    tipo: "opcion",
    obligatorio: true,
    opciones: ["Inicial", "Primaria o básica", "Secundaria o media", "Superior o universitaria", "Formación docente", "Otro"],
  },
  { clave: "area", etiqueta: "Área en que enseñás", tipo: "texto", obligatorio: true, largo: 120 },
  { clave: "mensaje", etiqueta: "Contanos algo más", tipo: "parrafo", obligatorio: false, largo: 2000 },
] as const satisfies readonly CampoDeFormulario[];

/** Los campos que van a su propia columna de `mensajes`, y no a `datos`. */
export const COLUMNAS_DEL_CV = ["nombre", "correo", "pais", "mensaje"] as const;

/**
 * El tope del archivo: 4 MB. Vercel corta el cuerpo de una función en 4,5 MB,
 * y el resto es el margen del multipart y de los otros campos.
 */
export const MAXIMO_DEL_CV = 4 * 1024 * 1024;

/** Lo que se le dice a quien manda uno más pesado: lo chequea el navegador antes de mandar, y el servidor igual. */
export const CV_PESA_DE_MAS = "Tu CV pesa más de 4 MB: exportalo de nuevo como PDF, más liviano, y probá otra vez.";

/**
 * Si la entrada pública del CV está encendida: `CV_ABIERTO=si`. Apagada, que
 * es como viene, `/sumate-al-equipo` y `/api/cv` dan 404 y ningún link del
 * sitio lleva ahí.
 */
export function cvAbierto(entorno: Record<string, string | undefined> = process.env): boolean {
  return entorno.CV_ABIERTO === "si";
}
