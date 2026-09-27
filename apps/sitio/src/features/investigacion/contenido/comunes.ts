import { textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";

// Campos que repiten varias secciones de Investigación. No son tipos nuevos:
// es un `textoCorto` con la regla del resaltado (SPEC §1 de
// work/paginas-investigacion-y-resto/), como el detalle de las áreas de Inicio.

/**
 * Un texto de una línea con exactamente una parte resaltada, entre dobles
 * asteriscos. Cada sección dice en su ayuda cómo se ve lo resaltado: el
 * marcador de los títulos, el garabato de las preguntas, el subrayado de la
 * lámina.
 */
export function unaResaltada({ maximo, etiqueta, ayuda }: { maximo: number; etiqueta: string; ayuda: string }) {
  return textoCorto({ maximo, etiqueta, ayuda }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1));
}
