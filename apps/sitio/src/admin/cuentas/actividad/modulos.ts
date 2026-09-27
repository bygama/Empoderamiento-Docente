import type { TipoDeActividad } from "@/datos/actividad";

/**
 * De qué parte del admin es cada tipo de actividad: el filtro «Módulo» de
 * Cuentas › Actividad. Un tipo nuevo sin su módulo acá no compila.
 */

export const MODULOS_DE_ACTIVIDAD = {
  acceso: "Acceso",
  "mi-cuenta": "Mi cuenta",
  cuentas: "Cuentas",
  contenido: "Contenido",
  novedades: "Novedades",
  biblioteca: "Biblioteca",
  mensajes: "Mensajes",
  metricas: "Métricas",
  ajustes: "Ajustes",
} as const;
export type ModuloDeActividad = keyof typeof MODULOS_DE_ACTIVIDAD;

const MODULO_DE: Record<TipoDeActividad, ModuloDeActividad> = {
  entro: "acceso",
  salio: "acceso",
  "cambio-su-contrasena": "mi-cuenta",
  "cambio-su-nombre": "mi-cuenta",
  "activo-el-segundo-factor": "mi-cuenta",
  "desactivo-el-segundo-factor": "mi-cuenta",
  "publico-una-pagina": "contenido",
  "descarto-un-borrador": "contenido",
  "restauro-una-version": "contenido",
  "publico-un-caso": "contenido",
  "descarto-cambios-de-un-caso": "contenido",
  "autorizo-un-aliado": "contenido",
  "quito-la-autorizacion-de-un-aliado": "contenido",
  "publico-un-aliado": "contenido",
  "despublico-un-aliado": "contenido",
  "borro-un-aliado": "contenido",
  "subio-una-foto": "contenido",
  "reemplazo-una-foto": "contenido",
  "borro-una-foto": "contenido",
  "publico-una-novedad": "novedades",
  "despublico-una-novedad": "novedades",
  "descarto-cambios-de-una-novedad": "novedades",
  "borro-una-novedad": "novedades",
  "agrego-un-material": "biblioteca",
  "publico-un-material": "biblioteca",
  "oculto-un-material": "biblioteca",
  "descarto-cambios-de-un-material": "biblioteca",
  "borro-un-material": "biblioteca",
  "publico-un-perfil": "contenido",
  "despublico-un-perfil": "contenido",
  "descarto-cambios-de-un-perfil": "contenido",
  "borro-un-perfil": "contenido",
  "movio-un-perfil": "contenido",
  "tomo-un-mensaje": "mensajes",
  "cerro-un-mensaje": "mensajes",
  "marco-un-mensaje-como-spam": "mensajes",
  "borro-un-mensaje": "mensajes",
  "borro-un-cv": "mensajes",
  invito: "cuentas",
  "reenvio-la-invitacion": "cuentas",
  "cancelo-la-invitacion": "cuentas",
  "cambio-el-rol": "cuentas",
  "cambio-el-correo": "cuentas",
  suspendio: "cuentas",
  reactivo: "cuentas",
  "borro-una-cuenta": "cuentas",
  "paso-la-direccion": "cuentas",
  "cerro-las-sesiones": "cuentas",
  "cambio-los-datos-del-sitio": "ajustes",
  "agrego-una-redireccion": "ajustes",
  "borro-una-redireccion": "ajustes",
  "cambio-quien-recibe-un-aviso": "ajustes",
  "cambio-los-plazos-de-guarda": "ajustes",
  "creo-un-enlace": "metricas",
  "borro-un-enlace": "metricas",
  "agrego-una-marca": "metricas",
  "borro-una-marca": "metricas",
};

export function moduloDe(tipo: TipoDeActividad): ModuloDeActividad {
  return MODULO_DE[tipo];
}

export function esModuloDeActividad(valor: string): valor is ModuloDeActividad {
  return Object.hasOwn(MODULOS_DE_ACTIVIDAD, valor);
}

/** Lo que cancela o borra una cuenta deja sin pantalla adonde llevar. */
const SIN_PANTALLA: readonly TipoDeActividad[] = ["cancelo-la-invitacion", "borro-una-cuenta"];

/** Los de un caso, que tampoco se borran: son siempre cuatro. */
const DE_UN_CASO: readonly TipoDeActividad[] = ["publico-un-caso", "descarto-cambios-de-un-caso"];

/** Los de una página. Los de un perfil del Equipo, que se borra, llevan a su ficha si existe; los demás de Contenido son de un aliado o de una foto, que se borran. */
const DE_UNA_PAGINA: readonly TipoDeActividad[] = ["publico-una-pagina", "descarto-un-borrador", "restauro-una-version"];
const DE_UN_PERFIL: readonly TipoDeActividad[] = ["publico-un-perfil", "despublico-un-perfil", "descarto-cambios-de-un-perfil", "movio-un-perfil"];

/**
 * Adónde lleva lo que se tocó, si todavía tiene pantalla: lo de Cuentas, a
 * esa cuenta si existe; lo de una página o un caso, a su editor (no se
 * borran); lo de un material o de un perfil, a su ficha si existe. Un
 * mensaje no: pudo haberse borrado, a mano o por la retención; una novedad,
 * un aliado o una foto tampoco, porque también se borran.
 */
export function pantallaDe(
  { tipo, sobreId }: { tipo: TipoDeActividad; sobreId: string | null },
  cuentasQueExisten: ReadonlySet<string>,
  materialesQueExisten: ReadonlySet<string> = new Set(),
  perfilesQueExisten: ReadonlySet<string> = new Set(),
): { href: string; que: string } | null {
  if (!sobreId || SIN_PANTALLA.includes(tipo)) return null;
  const modulo = moduloDe(tipo);
  if (modulo === "cuentas" && cuentasQueExisten.has(sobreId)) return { href: `/admin/cuentas/${sobreId}`, que: "Ver la cuenta" };
  if (DE_UNA_PAGINA.includes(tipo)) return { href: `/admin/contenido/paginas/${sobreId}`, que: "Ver la página" };
  if (DE_UN_CASO.includes(tipo)) return { href: `/admin/contenido/casos/${sobreId}`, que: "Ver el caso" };
  if (DE_UN_PERFIL.includes(tipo) && perfilesQueExisten.has(sobreId)) return { href: `/admin/contenido/equipo/${sobreId}`, que: "Ver el perfil" };
  if (modulo === "biblioteca" && materialesQueExisten.has(sobreId)) return { href: `/admin/biblioteca/${sobreId}`, que: "Ver el material" };
  return null;
}
