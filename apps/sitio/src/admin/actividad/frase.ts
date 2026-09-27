import type { TipoDeActividad } from "@/datos/actividad";

/** Un evento de la tabla `actividad`, con el nombre de quien lo hizo ya puesto. */
export type EventoParaLeer = { tipo: TipoDeActividad; quien: string; sobre?: string | null };

/** El nombre de la página, que las acciones anotan en `sobre`; sin él, «una página». */
const pagina = (sobre: string | null | undefined) => sobre ?? "una página";

/** Una novedad por su título, como era en ese momento; sin él, «una novedad». */
const novedad = (sobre: string | null | undefined) => (sobre ? `«${sobre}»` : "una novedad");

/** Un material por su título, como era en ese momento; sin él, «un material». */
const material = (sobre: string | null | undefined) => (sobre ? `«${sobre}»` : "un material");

/**
 * Un mensaje de Contacto por su tema, que es lo único que se anota de él
 * («sobre Investigación»); sin tema, «de Contacto».
 */
const mensaje = (sobre: string | null | undefined) => (sobre && sobre !== "Contacto" ? `un mensaje sobre ${sobre}` : "un mensaje de Contacto");

/** La otra cuenta, por el nombre que tenía cuando se tocó; sin él, «alguien». */
const persona = (sobre: string | null | undefined) => sobre ?? "alguien";

/** Un caso, que se anota como se llama en la lista («Caso 01»): «el caso 01». */
const caso = (sobre: string | null | undefined) => (sobre ? `el ${sobre.charAt(0).toLowerCase()}${sobre.slice(1)}` : "un caso");

/** Un aliado por su nombre: lo que se publica y se autoriza es su logo. */
const aliado = (sobre: string | null | undefined) => (sobre ? `el logo de ${sobre}` : "un logo de aliado");

/** Una foto por su texto alternativo, como era en ese momento. */
const foto = (sobre: string | null | undefined) => (sobre ? `la foto «${sobre}»` : "una foto");

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
  // Ajustes: `sobre` dice qué, cuando hace falta.
  "cambio-los-datos-del-sitio": ({ quien }) => `${quien} cambió los datos del sitio`,
  "agrego-una-redireccion": ({ quien, sobre }) => `${quien} agregó ${sobre ? `la redirección ${sobre}` : "una redirección"}`,
  "borro-una-redireccion": ({ quien, sobre }) => `${quien} borró ${sobre ? `la redirección ${sobre}` : "una redirección"}`,
  "cambio-quien-recibe-un-aviso": ({ quien, sobre }) => `${quien} cambió quién recibe los avisos${sobre ? ` de ${sobre}` : ""}`,
  "cambio-los-plazos-de-guarda": ({ quien, sobre }) => `${quien} cambió los plazos de privacidad${sobre ? `: ${sobre}` : ""}`,
  "agrego-un-material": ({ quien, sobre }) => `${quien} agregó el material ${material(sobre)}`,
  "publico-un-material": ({ quien, sobre }) => `${quien} publicó el material ${material(sobre)}`,
  "oculto-un-material": ({ quien, sobre }) => `${quien} ocultó el material ${material(sobre)}`,
  "descarto-cambios-de-un-material": ({ quien, sobre }) => `${quien} descartó los cambios del material ${material(sobre)}`,
  "borro-un-material": ({ quien, sobre }) => `${quien} borró el material ${material(sobre)}`,
  "publico-un-caso": ({ quien, sobre }) => `${quien} publicó ${caso(sobre)}`,
  "descarto-cambios-de-un-caso": ({ quien, sobre }) => `${quien} descartó los cambios de ${caso(sobre)}`,
  "autorizo-un-aliado": ({ quien, sobre }) => `${quien} autorizó ${aliado(sobre)}`,
  "quito-la-autorizacion-de-un-aliado": ({ quien, sobre }) => `${quien} le quitó la autorización a ${aliado(sobre)}`,
  "publico-un-aliado": ({ quien, sobre }) => `${quien} publicó ${aliado(sobre)}`,
  "despublico-un-aliado": ({ quien, sobre }) => `${quien} despublicó ${aliado(sobre)}`,
  "borro-un-aliado": ({ quien, sobre }) => `${quien} borró ${aliado(sobre)}`,
  "subio-una-foto": ({ quien, sobre }) => `${quien} subió ${foto(sobre)}`,
  "reemplazo-una-foto": ({ quien, sobre }) => `${quien} reemplazó el archivo de ${foto(sobre)}`,
  "borro-una-foto": ({ quien, sobre }) => `${quien} borró ${foto(sobre)}`,
};

/**
 * Cómo se lee un evento de la actividad: «Raquel Ayala entró». La usan el
 * Inicio y Cuentas › Actividad, así se lee igual en los dos lados.
 */
export function fraseDe(evento: EventoParaLeer): string {
  return FRASES[evento.tipo](evento);
}
