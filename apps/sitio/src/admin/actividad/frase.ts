import type { TipoDeActividad } from "@/datos/actividad";

/** Un evento de la tabla `actividad`, con el nombre de quien lo hizo ya puesto. */
export type EventoParaLeer = { tipo: TipoDeActividad; quien: string; sobre?: string | null };

/** El nombre de la página, que las acciones anotan en `sobre`; sin él, «una página». */
const pagina = (sobre: string | null | undefined) => sobre ?? "una página";

/**
 * Un mensaje de Contacto por su tema, que es lo único que se anota de él
 * («sobre Investigación»); sin tema, «de Contacto».
 */
const mensaje = (sobre: string | null | undefined) => (sobre && sobre !== "Contacto" ? `un mensaje sobre ${sobre}` : "un mensaje de Contacto");

// Un verbo en pasado sobre quien lo hizo, como lo diría una persona. Es un
// Record para que un tipo nuevo no compile hasta tener su frase.
const FRASES: Record<TipoDeActividad, (evento: EventoParaLeer) => string> = {
  entro: ({ quien }) => `${quien} entró`,
  salio: ({ quien }) => `${quien} salió`,
  "cambio-su-contrasena": ({ quien }) => `${quien} cambió su contraseña`,
  "cambio-su-nombre": ({ quien }) => `${quien} cambió su nombre`,
  "publico-una-pagina": ({ quien, sobre }) => `${quien} publicó ${pagina(sobre)}`,
  "descarto-un-borrador": ({ quien, sobre }) => `${quien} descartó el borrador de ${pagina(sobre)}`,
  "restauro-una-version": ({ quien, sobre }) => `${quien} restauró una versión de ${pagina(sobre)}`,
  "tomo-un-mensaje": ({ quien, sobre }) => `${quien} tomó ${mensaje(sobre)}`,
  "cerro-un-mensaje": ({ quien, sobre }) => `${quien} cerró ${mensaje(sobre)}`,
  // Lo que se borra o es spam no repite su tema: de eso, solo que pasó.
  "marco-un-mensaje-como-spam": ({ quien }) => `${quien} marcó un mensaje como spam`,
  "borro-un-mensaje": ({ quien }) => `${quien} borró un mensaje de Contacto`,
  "borro-un-cv": ({ quien }) => `${quien} borró un CV`,
};

/**
 * Cómo se lee un evento de la actividad: «Raquel Ayala entró». La usan el
 * Inicio y Cuentas › Actividad, así se lee igual en los dos lados.
 */
export function fraseDe(evento: EventoParaLeer): string {
  return FRASES[evento.tipo](evento);
}
