import type { TipoDeActividad } from "@/datos/actividad";

/**
 * De qué parte del admin es cada tipo de actividad: el filtro «Módulo» de
 * Cuentas › Actividad. Un tipo nuevo sin su módulo acá no compila.
 */

export const MODULOS_DE_ACTIVIDAD = { acceso: "Acceso", "mi-cuenta": "Mi cuenta", cuentas: "Cuentas" } as const;
export type ModuloDeActividad = keyof typeof MODULOS_DE_ACTIVIDAD;

const MODULO_DE: Record<TipoDeActividad, ModuloDeActividad> = {
  entro: "acceso",
  salio: "acceso",
  "cambio-su-contrasena": "mi-cuenta",
  "cambio-su-nombre": "mi-cuenta",
  "activo-el-segundo-factor": "mi-cuenta",
  "desactivo-el-segundo-factor": "mi-cuenta",
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
};

export function moduloDe(tipo: TipoDeActividad): ModuloDeActividad {
  return MODULO_DE[tipo];
}

export function esModuloDeActividad(valor: string): valor is ModuloDeActividad {
  return Object.hasOwn(MODULOS_DE_ACTIVIDAD, valor);
}

/** Lo que cancela o borra una cuenta deja sin pantalla adonde llevar. */
const SIN_PANTALLA: readonly TipoDeActividad[] = ["cancelo-la-invitacion", "borro-una-cuenta"];

/** Adónde lleva lo que se tocó, si tiene pantalla: lo de Cuentas, a esa cuenta. */
export function pantallaDe(tipo: TipoDeActividad, sobreId: string | null): string | null {
  if (!sobreId || moduloDe(tipo) !== "cuentas" || SIN_PANTALLA.includes(tipo)) return null;
  return `/admin/cuentas/${sobreId}`;
}
