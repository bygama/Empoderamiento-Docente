import { DE_LOS_ALIADOS } from "./aliados";
import { DE_LA_BIBLIOTECA } from "./biblioteca";
import { DE_LAS_FOTOS } from "./fotos";
import { DE_LOS_MENSAJES } from "./mensajes";
import { DE_LAS_METRICAS } from "./metricas";
import { DE_LAS_NOVEDADES } from "./novedades";
import { DE_LAS_PAGINAS } from "./paginas";
import type { Pendiente, Pendientes } from "./pendiente";

export { URGENCIAS, type LoPendiente, type Pendiente, type Urgencia } from "./pendiente";

/**
 * Las filas que existen. Un módulo que llega suma su archivo, con sus filas y
 * su urgencia, y una línea acá. A igual urgencia manda este orden.
 */
const REGISTRO = {
  ...DE_LOS_MENSAJES,
  ...DE_LAS_PAGINAS,
  ...DE_LAS_NOVEDADES,
  ...DE_LA_BIBLIOTECA,
  ...DE_LAS_FOTOS,
  ...DE_LOS_ALIADOS,
  ...DE_LAS_METRICAS,
} satisfies Pendientes;

export type ClaveDePendiente = keyof typeof REGISTRO;

export const PENDIENTES: Record<ClaveDePendiente, Pendiente> = REGISTRO;

// Object.keys devuelve string[]: el `as` recupera las claves del registro, que son exactamente esas.
export const CLAVES_DE_PENDIENTES: readonly ClaveDePendiente[] = Object.keys(REGISTRO) as ClaveDePendiente[];
