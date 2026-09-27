import type { TipoDeActividad } from "@/datos/actividad";
import { DEL_ACCESO } from "./acceso";
import { DE_LOS_AJUSTES } from "./ajustes";
import { DE_LOS_ALIADOS } from "./aliados";
import { DE_LA_BIBLIOTECA } from "./biblioteca";
import { DE_LOS_CASOS } from "./casos";
import type { EventoParaLeer, Frase } from "./comun";
import { DE_LAS_CUENTAS } from "./cuentas";
import { DEL_EQUIPO } from "./equipo";
import { DE_LAS_FOTOS } from "./fotos";
import { DE_LOS_MENSAJES } from "./mensajes";
import { DE_LAS_METRICAS } from "./metricas";
import { DE_MI_CUENTA } from "./mi-cuenta";
import { DE_LAS_NOVEDADES } from "./novedades";
import { DE_LAS_PAGINAS } from "./paginas";

export type { EventoParaLeer } from "./comun";

// Cada módulo trae sus frases en su archivo, y una línea acá. Es un Record
// para que un tipo nuevo no compile hasta tener su frase.
const FRASES: Record<TipoDeActividad, Frase> = {
  ...DEL_ACCESO,
  ...DE_MI_CUENTA,
  ...DE_LAS_PAGINAS,
  ...DE_LOS_MENSAJES,
  ...DE_LAS_CUENTAS,
  ...DE_LAS_NOVEDADES,
  ...DE_LOS_AJUSTES,
  ...DE_LA_BIBLIOTECA,
  ...DE_LOS_CASOS,
  ...DE_LOS_ALIADOS,
  ...DE_LAS_FOTOS,
  ...DE_LAS_METRICAS,
  ...DEL_EQUIPO,
};

/**
 * Cómo se lee un evento de la actividad: «Raquel Ayala entró». La usan el
 * Inicio y Cuentas › Actividad, así se lee igual en los dos lados.
 */
export function fraseDe(evento: EventoParaLeer): string {
  return FRASES[evento.tipo](evento);
}
