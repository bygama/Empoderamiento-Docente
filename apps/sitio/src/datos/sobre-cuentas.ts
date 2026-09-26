import { SIN_PERMISO, queSePuede, type LoQueSePuede, type Rol } from "@ed/auth";
import type { auth } from "./auth";
import { base } from "./cliente";
import { cuentaParaActuar } from "./consultas/cuentas";
import { esquemaDelId } from "./esquemas";

/**
 * Lo que comparten las acciones de Cuentas (`datos/acciones/cuentas.ts`,
 * `estado-de-cuentas.ts`, `invitaciones.ts`, `direccion.ts`). No es un
 * archivo de acciones: nada de acá lo puede llamar el navegador.
 */

export type Sesion = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
export type Resultado = { ok: boolean; detalle: string };

export const SIN_SESION: Resultado = { ok: false, detalle: "Hay que entrar al admin para hacer eso." };
export const NO_PUEDE: Resultado = { ok: false, detalle: SIN_PERMISO };

type Cuenta = NonNullable<Awaited<ReturnType<typeof cuentaParaActuar>>>;
export type Objetivo = Cuenta & { rol: Rol; se: LoQueSePuede };

/**
 * La cuenta sobre la que se actúa y lo que quien pide puede hacerle
 * (`queSePuede`, la misma regla que usa la pantalla). Si no existe, o esa
 * acción no se puede, contesta en llano en vez de hacer.
 */
export async function sobreLaCuenta(
  sesion: Sesion,
  idDeCuenta: unknown,
  accion: keyof LoQueSePuede,
  hacer: (cuenta: Objetivo) => Promise<Resultado>,
): Promise<Resultado> {
  const id = esquemaDelId.safeParse(idDeCuenta);
  const cuenta = id.success ? await cuentaParaActuar(id.data) : null;
  if (!cuenta?.rol) return { ok: false, detalle: "Esa cuenta ya no existe." };
  const se = queSePuede(sesion.user.rol, { rol: cuenta.rol, estado: cuenta.estado, esLaPropia: cuenta.id === sesion.user.id });
  if (!se[accion]) return NO_PUEDE;
  return hacer({ ...cuenta, rol: cuenta.rol, se });
}

/** Un error que no se esperaba: al log, y en llano para quien lo pidió. */
export function fallo(accion: string, error: unknown): Resultado {
  console.error(`${accion}:`, error);
  return { ok: false, detalle: "No se pudo; probá de nuevo en un rato." };
}

/** Cierra las sesiones de una cuenta; con `salvo`, todas menos esa (la de quien lo pide, si es la suya). */
export async function cerrarSesiones(idDeCuenta: string, salvo?: string): Promise<void> {
  await base.session.deleteMany({ where: { userId: idDeCuenta, ...(salvo ? { id: { not: salvo } } : {}) } });
}

/**
 * Lo que better-auth le guarda a una cuenta en `verification` y no cuelga de
 * ella por clave foránea: los enlaces para elegir la contraseña, el paso
 * pendiente del código, el dispositivo recordado. Reenviar una invitación
 * los borra para que el enlace viejo deje de servir.
 */
export async function borrarEnlaces(idDeCuenta: string): Promise<void> {
  await base.verification.deleteMany({ where: { value: idDeCuenta } });
}

/** El código con que Prisma dice que una clave foránea no dejó hacer algo. */
function esDeClaveForanea(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2003";
}

/**
 * Borra una cuenta si nunca hizo nada. **No lo pregunta antes:** lo decide la
 * clave foránea de `actividad`, con `RESTRICT` (una cuenta que hizo algo no se
 * borra, se suspende, y su nombre queda en la historia).
 */
export async function borrarSiNuncaHizoNada(idDeCuenta: string): Promise<"borrada" | "tiene-historia"> {
  try {
    await base.user.delete({ where: { id: idDeCuenta } });
  } catch (error) {
    if (esDeClaveForanea(error)) return "tiene-historia";
    throw error;
  }
  await borrarEnlaces(idDeCuenta);
  return "borrada";
}
