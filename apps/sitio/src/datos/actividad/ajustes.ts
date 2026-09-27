import type { Reglas } from "./regla";

// Ajustes (work/ajustes/): una redirección con «/viejo → /nuevo» en `sobre`;
// un aviso, con su nombre («CV»); los plazos, con lo que cambió. Lo ve quien
// usa Ajustes.
export const DE_LOS_AJUSTES = {
  "cambio-los-datos-del-sitio": { quienVe: "usarAjustes", vaAlInicio: true },
  "agrego-una-redireccion": { quienVe: "usarAjustes", vaAlInicio: true },
  "borro-una-redireccion": { quienVe: "usarAjustes", vaAlInicio: true },
  "cambio-quien-recibe-un-aviso": { quienVe: "usarAjustes", vaAlInicio: true },
  "cambio-los-plazos-de-guarda": { quienVe: "usarAjustes", vaAlInicio: true },
} as const satisfies Reglas;
