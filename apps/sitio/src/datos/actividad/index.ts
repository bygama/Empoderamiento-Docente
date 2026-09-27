import { z } from "zod";
import { puede, type Capacidad } from "@ed/auth";
import { base } from "../cliente";
import { DEL_ACCESO } from "./acceso";
import { DE_LOS_AJUSTES } from "./ajustes";
import { DE_LOS_ALIADOS } from "./aliados";
import { DE_LA_BIBLIOTECA } from "./biblioteca";
import { DE_LOS_CASOS } from "./casos";
import { DE_LAS_CUENTAS } from "./cuentas";
import { DEL_EQUIPO } from "./equipo";
import { DE_LAS_FOTOS } from "./fotos";
import { DE_LOS_MENSAJES } from "./mensajes";
import { DE_LAS_METRICAS } from "./metricas";
import { DE_MI_CUENTA } from "./mi-cuenta";
import { DE_LAS_NOVEDADES } from "./novedades";
import { DE_LAS_PAGINAS } from "./paginas";
import { porTipo, tiposDe, type Reglas } from "./regla";

// La actividad del admin: quién hizo qué, sobre qué y cuándo (tabla
// `actividad`). **La única puerta para escribirla.** No es una Server Action
// ni vive en `datos/acciones/`, a propósito: el navegador podría llamarla y
// anotar lo que quisiera. La llaman las acciones, después de hacer lo suyo, y
// los ganchos de la sesión (`datos/auth.ts`).

/**
 * Lo que se registra, cerrado: cada módulo suma sus tipos en su archivo, con
 * quién los ve y si van al Inicio (`regla.ts`), y una línea acá, en el orden
 * de la lista. Un tipo nuevo no compila hasta decir las dos cosas.
 */
const REGLAS = {
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
} satisfies Reglas;

export type TipoDeActividad = keyof typeof REGLAS;

export const TIPOS_DE_ACTIVIDAD: readonly TipoDeActividad[] = tiposDe(REGLAS);

/** Qué hay que poder para ver cada tipo, en el Inicio y en Cuentas › Actividad. */
export const QUIEN_VE: Readonly<Record<TipoDeActividad, Capacidad>> = porTipo(REGLAS, (r) => r.quienVe);
/** Si el tipo va a la actividad reciente del Inicio. */
export const VA_AL_INICIO: Readonly<Record<TipoDeActividad, boolean>> = porTipo(REGLAS, (r) => r.vaAlInicio);

/** Los tipos que ese rol puede ver, en el orden de la lista. Un rol que no es de los tres no ve ninguno. */
export function tiposQueVe(rol: unknown): TipoDeActividad[] {
  return TIPOS_DE_ACTIVIDAD.filter((tipo) => puede(rol, QUIEN_VE[tipo]));
}

/** Los que ese rol ve en el Inicio: los que puede ver y van al Inicio. */
export function tiposDelInicio(rol: unknown): TipoDeActividad[] {
  return tiposQueVe(rol).filter((tipo) => VA_AL_INICIO[tipo]);
}

export function esTipoDeActividad(valor: string): valor is TipoDeActividad {
  return (TIPOS_DE_ACTIVIDAD as readonly string[]).includes(valor);
}

const esquema = z.object({
  tipo: z.enum(TIPOS_DE_ACTIVIDAD),
  /** El id de la cuenta que lo hizo. */
  quien: z.string().min(1),
  /** Sobre qué, en llano y como es ahora: «Inicio», «Ana Pérez». */
  sobre: z.string().trim().min(1).max(200).optional(),
  /** El id o el slug de eso, para linkearlo. */
  sobreId: z.string().min(1).max(200).optional(),
});

export type Actividad = z.input<typeof esquema>;

/**
 * Anota algo hecho en el admin. **Nunca frena lo que se registra**: si no es
 * válido o la base no contesta, queda en el log y la acción sigue. Perder una
 * fila de la historia es malo; no poder salir del admin porque la tabla no
 * contestó, peor.
 */
export async function registrarActividad(actividad: Actividad): Promise<void> {
  const valida = esquema.safeParse(actividad);
  if (!valida.success) {
    console.error("registrarActividad: no se registró, no es válida:", z.prettifyError(valida.error));
    return;
  }
  const { tipo, quien, sobre, sobreId } = valida.data;
  try {
    await base.actividad.create({ data: { tipo, cuentaId: quien, sobre, sobreId } });
  } catch (e) {
    console.error(`registrarActividad: la base no guardó «${tipo}»:`, e instanceof Error ? e.message : e);
  }
}
