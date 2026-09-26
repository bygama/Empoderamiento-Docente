import type { TipoDeActividad } from "@/datos/actividad";

/** Un evento de la tabla `actividad`, con el nombre de quien lo hizo ya puesto. */
export type EventoParaLeer = { tipo: TipoDeActividad; quien: string; sobre?: string | null };

// Un verbo en pasado sobre quien lo hizo, como lo diría una persona. Es un
// Record para que un tipo nuevo no compile hasta tener su frase.
const FRASES: Record<TipoDeActividad, (evento: EventoParaLeer) => string> = {
  entro: ({ quien }) => `${quien} entró`,
  salio: ({ quien }) => `${quien} salió`,
  "cambio-su-contrasena": ({ quien }) => `${quien} cambió su contraseña`,
  "cambio-su-nombre": ({ quien }) => `${quien} cambió su nombre`,
};

/**
 * Cómo se lee un evento de la actividad: «Raquel Ayala entró». La usan el
 * Inicio y Cuentas › Actividad, así se lee igual en los dos lados.
 */
export function fraseDe(evento: EventoParaLeer): string {
  return FRASES[evento.tipo](evento);
}
