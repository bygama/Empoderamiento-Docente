import type { ErrorDeCampo } from "@/lib/contenido/errores";
import { haceCuanto } from "@/lib/contenido/tiempo";

// El aviso de choque (SPEC §5 de `work/paginas-inicio/`): cada escritura del
// borrador —guardar, publicar, descartar, restaurar— trae el `borradorEn` que
// vio la pantalla, y si otra persona guardó desde entonces no pisa: contesta
// quién y cuándo, y el editor ofrece recargar. Sin fusión ni bloqueo.

/**
 * Una escritura que no se hizo. `choque` dice que fue por otra persona, y que
 * recargar lo resuelve; `errores`, qué campos no pasan, cada uno con su camino.
 */
export type Fallo = { ok: false; detalle: string; choque?: true; errores?: ErrorDeCampo[] };

type FilaVista = { borradorEn: Date | null; borradorPor: string | null } | null;

/** ¿La pantalla vio el borrador que hay ahora? `null` es «no había borrador». */
export function vioLaFila(fila: FilaVista, borradorEnVisto: string | null): boolean {
  return (fila?.borradorEn?.toISOString() ?? null) === borradorEnVisto;
}

/**
 * El choque en llano, con la fila como está ahora: quién guardó y cuándo, o
 * que ya no hay borrador. `abriste` es lo que se abrió: «la página», «la
 * novedad».
 */
export function choqueCon(fila: FilaVista, abriste = "la página"): Fallo {
  const detalle = fila?.borradorEn
    ? `${fila.borradorPor ?? "Alguien"} guardó este borrador ${haceCuanto(fila.borradorEn)}. Recargá para ver sus cambios antes de seguir.`
    : `Este borrador se publicó o se descartó desde que abriste ${abriste}. Recargá para seguir.`;
  return { ok: false, detalle, choque: true };
}
