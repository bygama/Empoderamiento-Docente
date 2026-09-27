import type { Frases } from "./comun";

// `sobre` dice qué, cuando hace falta.
export const DE_LOS_AJUSTES = {
  "cambio-los-datos-del-sitio": ({ quien }) => `${quien} cambió los datos del sitio`,
  "agrego-una-redireccion": ({ quien, sobre }) => `${quien} agregó ${sobre ? `la redirección ${sobre}` : "una redirección"}`,
  "borro-una-redireccion": ({ quien, sobre }) => `${quien} borró ${sobre ? `la redirección ${sobre}` : "una redirección"}`,
  "cambio-quien-recibe-un-aviso": ({ quien, sobre }) => `${quien} cambió quién recibe los avisos${sobre ? ` de ${sobre}` : ""}`,
  "cambio-los-plazos-de-guarda": ({ quien, sobre }) => `${quien} cambió los plazos de privacidad${sobre ? `: ${sobre}` : ""}`,
} satisfies Frases;
