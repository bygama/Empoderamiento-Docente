import type { AreaDeQueHacemos, AreasDeQueHacemos } from "@/features/que-hacemos/contenido/areas";
import type { ComoTrabajamosDeQueHacemos } from "@/features/que-hacemos/contenido/como-trabajamos";

// Lo que Inicio toma de Qué hacemos, que es la dueña de lo compartido (SPEC §2
// de work/paginas-que-hacemos-y-quienes-somos/): solo lo que Inicio muestra,
// así al navegador de `/` no viaja lo que no se dibuja. Solo tipos de Qué
// hacemos: este módulo no trae Zod.

/** Una carta del abanico de Inicio: el título, la frase y el detalle de un área. */
export type AreaDeInicio = Pick<AreaDeQueHacemos, "titulo" | "frase" | "detalle">;

/** Las siete áreas de Qué hacemos, como las muestra Inicio. */
export function areasDeInicio({ areas }: AreasDeQueHacemos): AreaDeInicio[] {
  return areas.map(({ titulo, frase, detalle }) => ({ titulo, frase, detalle }));
}

/**
 * La frase en verde de cada paso de Inicio: la idea del verbo de Qué hacemos
 * en el mismo lugar. Inicio tiene un paso menos —«Transformar» es solo de
 * allá—, así que toma las primeras que necesita.
 */
export function ideasDelMetodo({ pasos }: ComoTrabajamosDeQueHacemos, cuantas: number): string[] {
  return pasos.slice(0, cuantas).map((paso) => paso.idea);
}
