import { ROLES, esRol, esUnaSola, puede, type Rol } from "./permisos";

/**
 * Quién puede hacer qué sobre una cuenta, en Cuentas (SPEC de `work/cuentas/`
 * §3). La pantalla lo usa para mostrar solo lo que se puede, y cada acción,
 * para verificarlo otra vez: la regla está escrita una vez.
 *
 * Como en `permisos.ts`, sin comparar contra el string de un rol: pregunta
 * `puede(…)` y `esUnaSola(…)`.
 */

/**
 * Los roles que se dan al invitar o con el selector de rol: todos menos el de
 * a una, que no se asigna, se pasa.
 */
export const ROLES_QUE_SE_ASIGNAN: readonly Rol[] = ROLES.filter((rol) => !esUnaSola(rol));

export function seAsigna(valor: unknown): valor is Rol {
  return esRol(valor) && ROLES_QUE_SE_ASIGNAN.includes(valor);
}

/**
 * Si dar ese rol (al invitar o con el selector de rol) pide otra vez la
 * contraseña de quien lo da: los que manejan las cuentas. Con ellos se
 * invita, se cambian correos y se cierran accesos, así que una sesión ajena
 * sola no alcanza para repartirlos. Cambiar un correo la pide siempre: es lo
 * que recupera una cuenta (ADR-0013).
 */
export function darloPideContrasena(rol: Rol): boolean {
  return puede(rol, "usarCuentas");
}

/** El estado de una cuenta: eligió su contraseña, todavía no, o no puede entrar. */
export type EstadoDeCuenta = "activa" | "pendiente" | "suspendida";

export type CuentaObjetivo = { rol: Rol; estado: EstadoDeCuenta; esLaPropia: boolean };

export type LoQueSePuede = {
  cambiarElRol: boolean;
  cambiarElCorreo: boolean;
  cerrarSusSesiones: boolean;
  suspender: boolean;
  reactivar: boolean;
  /** Solo si nunca hizo nada; eso lo decide la base (la clave foránea de `actividad`). */
  borrar: boolean;
  reenviarLaInvitacion: boolean;
  cancelarLaInvitacion: boolean;
  pasarleLaDireccion: boolean;
};

const NADA: LoQueSePuede = {
  cambiarElRol: false,
  cambiarElCorreo: false,
  cerrarSusSesiones: false,
  suspender: false,
  reactivar: false,
  borrar: false,
  reenviarLaInvitacion: false,
  cancelarLaInvitacion: false,
  pasarleLaDireccion: false,
};

export function queSePuede(quien: unknown, { rol, estado, esLaPropia }: CuentaObjetivo): LoQueSePuede {
  if (!puede(quien, "usarCuentas")) return NADA;
  // La cuenta de quien dirige no se suspende, ni se borra, ni se degrada: se
  // pasa la dirección. Lo único que se le cambia es el correo, y solo ella.
  if (esUnaSola(rol)) return { ...NADA, cambiarElCorreo: puede(quien, "tocarLaCuentaDeQuienDirige") };
  // Sobre la propia, solo el correo: quien se suspende o se baja de rol a sí
  // misma no lo puede deshacer.
  const otra = !esLaPropia;
  const pendiente = estado === "pendiente";
  return {
    cambiarElRol: otra,
    cambiarElCorreo: true,
    cerrarSusSesiones: otra && estado === "activa",
    suspender: otra && estado === "activa",
    reactivar: otra && estado === "suspendida",
    // Una pendiente no se borra: se cancela su invitación, que es lo mismo.
    borrar: otra && !pendiente,
    reenviarLaInvitacion: otra && pendiente,
    cancelarLaInvitacion: otra && pendiente,
    pasarleLaDireccion: otra && estado === "activa" && puede(quien, "pasarLaDireccion"),
  };
}
