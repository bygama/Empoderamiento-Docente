import { RUTAS_INTERNAS } from "@/config/nav";
import { grupo, parrafo, rutaInterna, textoCorto } from "@/lib/contenido/campos";
import { RESALTADO_SIN_CERRAR, resaltadoValido } from "@/lib/contenido/resaltado";

// Campos que repiten varias secciones de Inicio. No son tipos nuevos: son los
// de lib/contenido/campos.ts con su etiqueta, su ayuda y, el cuerpo, la regla
// del resaltado (SPEC §2.1).

/** La salida de un bloque hacia la página que lo amplía: el texto del link y adónde lleva. */
export function enlace({ maximo, ayuda }: { maximo: number; ayuda?: string }) {
  return grupo(
    { texto: textoCorto({ maximo, etiqueta: "Texto" }), ruta: rutaInterna(RUTAS_INTERNAS, { etiqueta: "Adónde lleva" }) },
    { etiqueta: "Enlace", ayuda },
  );
}

/**
 * El cuerpo de «¿Quiénes somos?» y «Misión»: un párrafo por renglón, con lo
 * resaltado entre dobles asteriscos. Se rellena palabra por palabra con el
 * scroll, y lo resaltado se enciende en azul.
 */
export function cuerpoConResaltado() {
  return parrafo({
    maximo: 500,
    etiqueta: "Texto",
    ayuda: "Cada renglón es un párrafo. Lo que va entre **dobles asteriscos** se resalta en azul.",
  }).refine((texto) => resaltadoValido(texto), RESALTADO_SIN_CERRAR);
}
