import type { Reglas } from "./regla";

// Cuentas (work/cuentas/): lo que se le hace a otra cuenta. `sobre` es el
// nombre de la otra persona, como era; `sobreId`, su cuenta. Lo ve quien usa
// Cuentas, y va al Inicio.
export const DE_LAS_CUENTAS = {
  invito: { quienVe: "usarCuentas", vaAlInicio: true },
  "reenvio-la-invitacion": { quienVe: "usarCuentas", vaAlInicio: true },
  "cancelo-la-invitacion": { quienVe: "usarCuentas", vaAlInicio: true },
  "cambio-el-rol": { quienVe: "usarCuentas", vaAlInicio: true },
  "cambio-el-correo": { quienVe: "usarCuentas", vaAlInicio: true },
  suspendio: { quienVe: "usarCuentas", vaAlInicio: true },
  reactivo: { quienVe: "usarCuentas", vaAlInicio: true },
  "borro-una-cuenta": { quienVe: "usarCuentas", vaAlInicio: true },
  "paso-la-direccion": { quienVe: "usarCuentas", vaAlInicio: true },
  "cerro-las-sesiones": { quienVe: "usarCuentas", vaAlInicio: true },
} as const satisfies Reglas;
