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
  mensajes: "Mensajes",
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
  "publico-una-novedad": "novedades",
  "despublico-una-novedad": "novedades",
  "descarto-cambios-de-una-novedad": "novedades",
  "borro-una-novedad": "novedades",
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
};

export function moduloDe(tipo: TipoDeActividad): ModuloDeActividad {
  return MODULO_DE[tipo];
}

export function esModuloDeActividad(valor: string): valor is ModuloDeActividad {
  return Object.hasOwn(MODULOS_DE_ACTIVIDAD, valor);
}

/** Lo que cancela o borra una cuenta deja sin pantalla adonde llevar. */
const SIN_PANTALLA: readonly TipoDeActividad[] = ["cancelo-la-invitacion", "borro-una-cuenta"];

/**
 * Adónde lleva lo que se tocó, si todavía tiene pantalla: lo de Cuentas, a
 * esa cuenta si existe; lo de una página, a su editor (las páginas no se
 * borran). Un mensaje no: pudo haberse borrado, a mano o por la retención; una
 * novedad tampoco, porque también se borra.
 */
export function pantallaDe(
  { tipo, sobreId }: { tipo: TipoDeActividad; sobreId: string | null },
  cuentasQueExisten: ReadonlySet<string>,
): { href: string; que: string } | null {
  if (!sobreId || SIN_PANTALLA.includes(tipo)) return null;
  const modulo = moduloDe(tipo);
  if (modulo === "cuentas" && cuentasQueExisten.has(sobreId)) return { href: `/admin/cuentas/${sobreId}`, que: "Ver la cuenta" };
  if (modulo === "contenido") return { href: `/admin/contenido/paginas/${sobreId}`, que: "Ver la página" };
  return null;
}
