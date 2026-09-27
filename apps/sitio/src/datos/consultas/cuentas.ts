import { esRol, esUnaSola, puede, type EstadoDeCuenta, type Rol } from "@ed/auth";
import { base } from "@/datos/cliente";
import { sesionesAbiertas, type SesionAbierta } from "./mi-cuenta";

/**
 * Las cuentas, para Cuentas (SPEC de work/cuentas §4). **Cada consulta recibe
 * primero el rol de quien mira y, sin `usarCuentas`, no lee nada.** La guarda
 * del layout no alcanza: en el App Router la página se renderiza igual y viaja
 * en el payload aunque el layout no la dibuje. Así, una página nueva que se
 * olvide de chequear tampoco filtra nada.
 */
const PUEDE_VER = "usarCuentas";

/** Una cuenta, como la muestra la lista de Personas (SPEC de work/cuentas §2 y §4.1). */
export type CuentaEnLista = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol | null;
  estado: EstadoDeCuenta;
  /** ISO; solo mientras está pendiente, y `null` si nunca se la invitó. */
  invitacionVence: string | null;
  /** Si esa invitación ya venció: pide reenviarla. */
  invitacionVencida: boolean;
  /** ISO; `null` si nunca entró. */
  ultimoAcceso: string | null;
};

/** Una cuenta, con lo que muestra su pantalla. */
export type FichaDeCuenta = CuentaEnLista & {
  segundoFactor: boolean;
  /** Si hizo algo en el admin: entonces no se borra, se suspende. */
  tieneActividad: boolean;
  sesiones: SesionAbierta[];
};

const SELECCION = {
  id: true,
  name: true,
  email: true,
  rol: true,
  suspendida: true,
  invitacionVence: true,
  // «Pendiente» es no haber elegido nunca una contraseña: sin credencial con contraseña.
  accounts: { where: { providerId: "credential", password: { not: null } }, select: { id: true }, take: 1 },
} as const;

type Fila = { id: string; name: string; email: string; rol: string; suspendida: boolean; invitacionVence: Date | null; accounts: { id: string }[] };

function estadoDe(fila: Fila): EstadoDeCuenta {
  if (fila.suspendida) return "suspendida";
  return fila.accounts.length ? "activa" : "pendiente";
}

/**
 * El último acceso de cada cuenta: lo más nuevo entre su último «entró» y la
 * última actividad de sus sesiones abiertas. Las sesiones solas no alcanzan:
 * se borran al salir y al vencer.
 */
async function ultimosAccesos(ids?: string[]): Promise<Map<string, Date>> {
  const [entradas, sesiones] = await Promise.all([
    base.actividad.groupBy({ by: ["cuentaId"], where: { tipo: "entro", ...(ids ? { cuentaId: { in: ids } } : {}) }, _max: { en: true } }),
    base.session.groupBy({ by: ["userId"], where: { expiresAt: { gt: new Date() }, ...(ids ? { userId: { in: ids } } : {}) }, _max: { updatedAt: true } }),
  ]);
  const accesos = new Map<string, Date>();
  const sumar = (id: string, cuando: Date | null) => {
    const antes = accesos.get(id);
    if (cuando && (!antes || cuando > antes)) accesos.set(id, cuando);
  };
  for (const e of entradas) sumar(e.cuentaId, e._max.en);
  for (const s of sesiones) sumar(s.userId, s._max.updatedAt);
  return accesos;
}

/** Una cuenta sin su último acceso: lo que sale de su fila sola. */
export type DatosDeCuenta = Omit<CuentaEnLista, "ultimoAcceso">;

function datosDe(fila: Fila): DatosDeCuenta {
  const estado = estadoDe(fila);
  const vence = estado === "pendiente" ? fila.invitacionVence : null;
  return {
    id: fila.id,
    nombre: fila.name,
    correo: fila.email,
    rol: esRol(fila.rol) ? fila.rol : null,
    estado,
    invitacionVence: vence?.toISOString() ?? null,
    invitacionVencida: vence !== null && vence < new Date(),
  };
}

function enLista(fila: Fila, accesos: Map<string, Date>): CuentaEnLista {
  return { ...datosDe(fila), ultimoAcceso: accesos.get(fila.id)?.toISOString() ?? null };
}

/** Todas las cuentas: quien dirige primero, después por nombre. Vacía si ese rol no usa Cuentas. */
export async function listarCuentas(rolDeQuienMira: unknown): Promise<CuentaEnLista[]> {
  if (!puede(rolDeQuienMira, PUEDE_VER)) return [];
  const [filas, accesos] = await Promise.all([base.user.findMany({ select: SELECCION }), ultimosAccesos()]);
  const primero = (c: CuentaEnLista) => (c.rol && esUnaSola(c.rol) ? 0 : 1);
  return filas.map((f) => enLista(f, accesos)).sort((a, b) => primero(a) - primero(b) || a.nombre.localeCompare(b.nombre, "es"));
}

/** Lo que una acción necesita saber de la cuenta sobre la que actúa, o `null` si no existe o ese rol no usa Cuentas. */
export async function cuentaParaActuar(rolDeQuienMira: unknown, id: string): Promise<DatosDeCuenta | null> {
  if (!puede(rolDeQuienMira, PUEDE_VER)) return null;
  const fila = await base.user.findUnique({ where: { id }, select: SELECCION });
  return fila && datosDe(fila);
}

/** Una cuenta con su pantalla entera, o `null` si no existe o ese rol no usa Cuentas. */
export async function unaCuenta(rolDeQuienMira: unknown, id: string): Promise<FichaDeCuenta | null> {
  if (!puede(rolDeQuienMira, PUEDE_VER)) return null;
  const fila = await base.user.findUnique({ where: { id }, select: { ...SELECCION, twoFactorEnabled: true } });
  if (!fila) return null;
  const [accesos, actividad, sesiones] = await Promise.all([
    ultimosAccesos([id]),
    base.actividad.findFirst({ where: { cuentaId: id }, select: { id: true } }),
    sesionesAbiertas(id),
  ]);
  return {
    ...enLista(fila, accesos),
    segundoFactor: fila.twoFactorEnabled,
    tieneActividad: actividad !== null,
    sesiones,
  };
}
