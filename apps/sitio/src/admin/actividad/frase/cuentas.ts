import type { Frases } from "./comun";

/** La otra cuenta, por el nombre que tenía cuando se tocó; sin él, «alguien». */
const persona = (sobre: string | null | undefined) => sobre ?? "alguien";

// `sobre` es la otra persona, como se llamaba entonces.
export const DE_LAS_CUENTAS = {
  invito: ({ quien, sobre }) => `${quien} invitó a ${persona(sobre)}`,
  "reenvio-la-invitacion": ({ quien, sobre }) => `${quien} le reenvió la invitación a ${persona(sobre)}`,
  "cancelo-la-invitacion": ({ quien, sobre }) => `${quien} canceló la invitación de ${persona(sobre)}`,
  "cambio-el-rol": ({ quien, sobre }) => `${quien} cambió el rol de ${persona(sobre)}`,
  "cambio-el-correo": ({ quien, sobre }) => `${quien} cambió el correo de ${persona(sobre)}`,
  suspendio: ({ quien, sobre }) => `${quien} suspendió a ${persona(sobre)}`,
  reactivo: ({ quien, sobre }) => `${quien} reactivó a ${persona(sobre)}`,
  "borro-una-cuenta": ({ quien, sobre }) => `${quien} borró la cuenta de ${persona(sobre)}`,
  "paso-la-direccion": ({ quien, sobre }) => `${quien} le pasó la dirección a ${persona(sobre)}`,
  "cerro-las-sesiones": ({ quien, sobre }) => `${quien} cerró las sesiones de ${persona(sobre)}`,
} satisfies Frases;
