import type { TipoDeActividad } from "@/datos/actividad";

/** Las partes del admin del filtro «Módulo» de Cuentas › Actividad. */
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

/** Adónde lleva lo que se tocó, y el texto del link. */
export type Pantalla = { href: string; que: string };

/** Lo que todavía existe, para no llevar a la ficha de algo que se borró. */
export type Existentes = { cuentas: ReadonlySet<string>; materiales: ReadonlySet<string>; perfiles: ReadonlySet<string> };

/**
 * Cómo se lee un tipo en Cuentas › Actividad: de qué parte del admin es y, si
 * lo que se tocó tiene pantalla, adónde lleva (`sobreId` es su id o su slug).
 */
export type Lectura = { modulo: ModuloDeActividad; pantalla?: (sobreId: string, existen: Existentes) => Pantalla | null };

/** Las lecturas de un módulo, una por cada tipo que suma. */
export type Lecturas = Partial<Record<TipoDeActividad, Lectura>>;
