import type { Capacidad } from "@ed/auth";
import { BANDEJAS } from "./mensajes";

// Los avisos por correo que puede recibir una cuenta (tabla `avisos`, la
// columna `aviso`), en un registro (work/ajustes/SPEC.md §6). Mi cuenta ›
// Avisos los muestra desde la persona y Ajustes › Avisos desde las cuentas:
// las dos pantallas se dibujan de acá. Hay uno por bandeja de Mensajes, con
// su misma clave, y el resumen semanal de Métricas (work/metricas-completas/
// SPEC.md §8), que llegó como una entrada más y aparece en las dos sin
// tocarlas.

export const CLAVES_DE_AVISO = ["contacto", "cv", "resumen-semanal"] as const;
export type ClaveDeAviso = (typeof CLAVES_DE_AVISO)[number];

export type DefinicionDeAviso = {
  /** Cómo se nombra en Ajustes › Avisos: el título de su apartado. */
  nombre: string;
  /** Qué trae cada correo, para «Mandame un correo con cada …» y «Reciben un correo con cada …». */
  cada: string;
  /** Lo que hay que poder para recibirlo: el mismo permiso que para ver lo que avisa. */
  capacidad: Capacidad;
  /**
   * Cómo viene una cuenta que nunca lo tocó (sin fila en `avisos`). Los de
   * una bandeja vienen prendidos: un mensaje que nadie ve se pierde. El
   * resumen semanal viene apagado: lo recibe quien lo pide.
   */
  deFabrica: boolean;
};

export const AVISOS: Record<ClaveDeAviso, DefinicionDeAviso> = {
  contacto: { nombre: BANDEJAS.contacto.nombre, cada: "mensaje nuevo de Contacto", capacidad: BANDEJAS.contacto.capacidad, deFabrica: true },
  cv: { nombre: BANDEJAS.cv.nombre, cada: "CV nuevo", capacidad: BANDEJAS.cv.capacidad, deFabrica: true },
  "resumen-semanal": { nombre: "Resumen semanal", cada: "resumen semanal de las métricas, los lunes", capacidad: "verMetricas", deFabrica: false },
};

export function esAviso(valor: unknown): valor is ClaveDeAviso {
  return typeof valor === "string" && (CLAVES_DE_AVISO as readonly string[]).includes(valor);
}
