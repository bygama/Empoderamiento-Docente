import type { Metadata } from "next";
import { siteConfig } from "./site";

// Lo que la metadata de todas las páginas comparte. Vive acá y no en el layout
// porque un archivo de rutas de Next solo exporta lo que Next lee, y esto lo
// usan también el SEO de cada página y su valor inicial.

/** El título del sitio: el de Inicio hoy, y el de toda página que no dé el suyo. */
export const TITULO_DEL_SITIO = "Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas";

/**
 * Lo común de Open Graph. Una página que da su propio \`openGraph\` reemplaza
 * el del layout entero (Next no los mezcla), así que lo repite desde acá.
 */
export const OPEN_GRAPH_COMUN = { type: "website", locale: "es_ES", siteName: siteConfig.name } satisfies Metadata["openGraph"];
