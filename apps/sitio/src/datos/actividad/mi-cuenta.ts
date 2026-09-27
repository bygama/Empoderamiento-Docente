import type { Reglas } from "./regla";

// Lo que alguien cambia de su propia cuenta, en Mi cuenta. Es de las cuentas:
// lo ve quien usa Cuentas, y no va al Inicio.
export const DE_MI_CUENTA = {
  "cambio-su-contrasena": { quienVe: "usarCuentas", vaAlInicio: false },
  "cambio-su-nombre": { quienVe: "usarCuentas", vaAlInicio: false },
  "activo-el-segundo-factor": { quienVe: "usarCuentas", vaAlInicio: false },
  "desactivo-el-segundo-factor": { quienVe: "usarCuentas", vaAlInicio: false },
} as const satisfies Reglas;
