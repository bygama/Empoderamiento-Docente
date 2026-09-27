import type { Lectura, Lecturas } from "./comun";

/** Lo que se le hizo a otra cuenta lleva a esa cuenta, si todavía existe. */
const aLaCuenta: Lectura = {
  modulo: "cuentas",
  pantalla: (id, existen) => (existen.cuentas.has(id) ? { href: `/admin/cuentas/${id}`, que: "Ver la cuenta" } : null),
};

/** Lo que cancela o borra una cuenta deja sin pantalla adonde llevar. */
const sinPantalla: Lectura = { modulo: "cuentas" };

export const DE_LAS_CUENTAS = {
  invito: aLaCuenta,
  "reenvio-la-invitacion": aLaCuenta,
  "cancelo-la-invitacion": sinPantalla,
  "cambio-el-rol": aLaCuenta,
  "cambio-el-correo": aLaCuenta,
  suspendio: aLaCuenta,
  reactivo: aLaCuenta,
  "borro-una-cuenta": sinPantalla,
  "paso-la-direccion": aLaCuenta,
  "cerro-las-sesiones": aLaCuenta,
} satisfies Lecturas;
