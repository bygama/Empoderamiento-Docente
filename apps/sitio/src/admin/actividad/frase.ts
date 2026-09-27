import type { TipoDeActividad } from "@/datos/actividad";

/** Un evento de la tabla `actividad`, con el nombre de quien lo hizo ya puesto. */
export type EventoParaLeer = { tipo: TipoDeActividad; quien: string; sobre?: string | null };

/** El nombre de la página, que las acciones anotan en `sobre`; sin él, «una página». */
const pagina = (sobre: string | null | undefined) => sobre ?? "una página";

/** Una novedad por su título, como era en ese momento; sin él, «una novedad». */
const novedad = (sobre: string | null | undefined) => (sobre ? `«${sobre}»` : "una novedad");

/**
 * Un mensaje de Contacto por su tema, que es lo único que se anota de él
 * («sobre Investigación»); sin tema, «de Contacto».
 */
const mensaje = (sobre: string | null | undefined) => (sobre && sobre !== "Contacto" ? `un mensaje sobre ${sobre}` : "un mensaje de Contacto");

/** La otra cuenta, por el nombre que tenía cuando se tocó; sin él, «alguien». */
const persona = (sobre: string | null | undefined) => sobre ?? "alguien";

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
  "activo-el-segundo-factor": ({ quien }) => `${quien} activó su segundo factor`,
  "desactivo-el-segundo-factor": ({ quien }) => `${quien} desactivó su segundo factor`,
  // Cuentas: `sobre` es la otra persona, como se llamaba entonces.
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
  "publico-una-novedad": ({ quien, sobre }) => `${quien} publicó la novedad ${novedad(sobre)}`,
  "despublico-una-novedad": ({ quien, sobre }) => `${quien} despublicó la novedad ${novedad(sobre)}`,
  "descarto-cambios-de-una-novedad": ({ quien, sobre }) => `${quien} descartó los cambios de la novedad ${novedad(sobre)}`,
  "borro-una-novedad": ({ quien, sobre }) => `${quien} borró la novedad ${novedad(sobre)}`,
};

/**
 * Cómo se lee un evento de la actividad: «Raquel Ayala entró». La usan el
 * Inicio y Cuentas › Actividad, así se lee igual en los dos lados.
 */
export function fraseDe(evento: EventoParaLeer): string {
  return FRASES[evento.tipo](evento);
}
