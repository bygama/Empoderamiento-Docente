import { fragmentos, parrafos } from "@/lib/contenido/resaltado";
import type { FillSeg } from "./ScrollFillText";

/**
 * El cuerpo como se edita en el admin —un párrafo por renglón, lo resaltado
 * entre dobles asteriscos— pasado a los párrafos de segmentos que
 * `ScrollFillText` rellena. Un fragmento que es solo espacio se saltea:
 * partido en palabras daría un span vacío.
 */
export function segmentosDe(cuerpo: string): FillSeg[][] {
  return parrafos(cuerpo).map((parrafo) =>
    fragmentos(parrafo)
      .filter((f) => f.texto.trim() !== "")
      .map((f) => ({ t: f.texto, accent: f.resaltado })),
  );
}
