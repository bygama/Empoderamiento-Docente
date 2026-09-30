import { headers } from "next/headers";
import { SIN_PERMISO, queSePuede, type LoQueSePuede, type Rol } from "@ed/auth";
import { confirmarContrasena } from "@ed/auth/servidor";
import { auth, borrarEnlaces } from "./auth";
import { almacenDeBloqueos } from "./bloqueos-de-acceso";
import { base } from "./cliente";
import { cuentaParaActuar } from "./consultas/cuentas";
import { esquemaDelId } from "./esquemas";

/**
 * Lo que comparten las acciones de Cuentas (`datos/acciones/cuentas.ts`,
 * `estado-de-cuentas.ts`, `invitaciones.ts`, `direccion.ts`). No es un
 * archivo de acciones: nada de acá lo puede llamar el navegador.
 */

/** Lo que dura una invitación (SPEC de work/cuentas §4.2). */
export const HORAS_DE_LA_INVITACION = 72;

export type Sesion = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
/** `campo`: qué campo rechazó, para que el formulario lo marque (`aria-invalid`). */
export type Resultado = { ok: boolean; detalle: string; campo?: "contrasena" };

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
  const cuenta = id.success ? await cuentaParaActuar(sesion.user.rol, id.data) : null;
  if (!cuenta?.rol) return { ok: false, detalle: "Esa cuenta ya no existe." };
  const se = queSePuede(sesion.user.rol, { rol: cuenta.rol, estado: cuenta.estado, esLaPropia: cuenta.id === sesion.user.id });
  if (!se[accion]) return NO_PUEDE;
  return hacer({ ...cuenta, rol: cuenta.rol, se });
}

/**
 * Pide otra vez la contraseña de quien actúa antes de algo que reparte o
 * recupera acceso: cambiar un correo, dar un rol que maneja las cuentas
 * (`darloPideContrasena`) o pasar la dirección. Una sesión robada sola no
 * alcanza para eso. Cada fallo cuenta en el bloqueo por cuenta como un
 * intento de entrar (`confirmarContrasena`, ADR-0010). Contesta `null` si
 * está bien, o el rechazo en llano.
 */
export async function pedirTuContrasena(sesion: Sesion, contrasena: unknown): Promise<Resultado | null> {
  if (typeof contrasena !== "string" || !contrasena) return { ok: false, campo: "contrasena", detalle: "Escribí tu contraseña para confirmar." };
  const confirmacion = await confirmarContrasena(auth, { headers: await headers(), correo: sesion.user.email, contrasena, bloqueos: almacenDeBloqueos });
  if (confirmacion === "frenada") return { ok: false, campo: "contrasena", detalle: "Probaste demasiadas veces. Esperá unos minutos y volvé a intentar." };
  if (confirmacion === "mal") return { ok: false, campo: "contrasena", detalle: "Esa no es tu contraseña." };
  return null;
}

/** Un error que no se esperaba: al log, y en llano para quien lo pidió. */
export function fallo(accion: string, error: unknown): Resultado {
  console.error(`${accion}:`, error);
  return { ok: false, detalle: "No se pudo; probá de nuevo en un rato." };
}

/**
 * Le cierra el acceso a una cuenta: sus sesiones —con `salvo`, todas menos
 * esa (la de quien lo pide, si es la suya)— y todo lo que abre una sin
 * contraseña: los enlaces para elegirla y los dispositivos recordados del
 * segundo factor (`borrarEnlaces`). Cerrar solo las sesiones dejaba a quien
 * tuviera un enlace pendiente o un dispositivo recordado a un paso de volver.
 */
export async function cerrarElAcceso(idDeCuenta: string, salvo?: string): Promise<void> {
  await base.session.deleteMany({ where: { userId: idDeCuenta, ...(salvo ? { id: { not: salvo } } : {}) } });
  await borrarEnlaces(idDeCuenta);
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
