import type { Reglas } from "./regla";

// Entrar y salir del admin: los anotan los ganchos de la sesión
// (`datos/auth.ts`). Son de las cuentas, así que los ve quien usa Cuentas, y
// no van al Inicio.
export const DEL_ACCESO = {
  entro: { quienVe: "usarCuentas", vaAlInicio: false },
  salio: { quienVe: "usarCuentas", vaAlInicio: false },
} as const satisfies Reglas;
