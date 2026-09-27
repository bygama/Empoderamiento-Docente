import type { TipoDeActividad } from "@/datos/actividad";
import { DEL_ACCESO } from "./acceso";
import { DE_LOS_AJUSTES } from "./ajustes";
import { DE_LOS_ALIADOS } from "./aliados";
import { DE_LA_BIBLIOTECA } from "./biblioteca";
import { DE_LOS_CASOS } from "./casos";
import { MODULOS_DE_ACTIVIDAD, type Lectura, type ModuloDeActividad, type Pantalla } from "./comun";
import { DE_LAS_CUENTAS } from "./cuentas";
import { DEL_EQUIPO } from "./equipo";
import { DE_LAS_FOTOS } from "./fotos";
import { DE_LOS_MENSAJES } from "./mensajes";
import { DE_LAS_METRICAS } from "./metricas";
import { DE_MI_CUENTA } from "./mi-cuenta";
import { DE_LAS_NOVEDADES } from "./novedades";
import { DE_LAS_PAGINAS } from "./paginas";

export { MODULOS_DE_ACTIVIDAD, type ModuloDeActividad } from "./comun";

/**
 * De qué parte del admin es cada tipo de actividad (el filtro «Módulo» de
 * Cuentas › Actividad) y adónde lleva. Cada módulo trae los suyos en su
 * archivo, y una línea acá: un tipo nuevo sin su lectura no compila.
 */
const LECTURAS: Record<TipoDeActividad, Lectura> = {
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

export function moduloDe(tipo: TipoDeActividad): ModuloDeActividad {
  return LECTURAS[tipo].modulo;
}

export function esModuloDeActividad(valor: string): valor is ModuloDeActividad {
  return Object.hasOwn(MODULOS_DE_ACTIVIDAD, valor);
}

/**
 * Adónde lleva lo que se tocó, si todavía tiene pantalla: lo de Cuentas, a
 * esa cuenta si existe; lo de una página o un caso, a su editor (no se
 * borran); lo de un material o de un perfil, a su ficha si existe. Un
 * mensaje no: pudo haberse borrado, a mano o por la retención; una novedad,
 * un aliado o una foto tampoco, porque también se borran.
 */
export function pantallaDe(
  { tipo, sobreId }: { tipo: TipoDeActividad; sobreId: string | null },
  cuentasQueExisten: ReadonlySet<string>,
  materialesQueExisten: ReadonlySet<string> = new Set(),
  perfilesQueExisten: ReadonlySet<string> = new Set(),
): Pantalla | null {
  const { pantalla } = LECTURAS[tipo];
  if (!sobreId || !pantalla) return null;
  return pantalla(sobreId, { cuentas: cuentasQueExisten, materiales: materialesQueExisten, perfiles: perfilesQueExisten });
}
