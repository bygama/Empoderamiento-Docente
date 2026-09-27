import type { AreaDeQueHacemos, AreasDeQueHacemos } from "@/features/que-hacemos/contenido/areas";

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
