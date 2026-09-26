import type { Capacidad } from "@ed/auth";

// Las bandejas de Mensajes y sus estados (work/mensajes/SPEC.md §6): una sola
// lista para las pestañas del admin, los permisos de cada acción, los avisos
// y la retención. Sumar una bandeja es sumarla acá; la base no pide migración
// porque guarda la clave como texto.

export const CLAVES_DE_BANDEJA = ["contacto", "cv"] as const;
export type Bandeja = (typeof CLAVES_DE_BANDEJA)[number];

export type DefinicionDeBandeja = {
  clave: Bandeja;
  nombre: string;
  href: string;
  /** Lo que hay que poder para verla, tomar sus mensajes y recibir su aviso. */
  capacidad: Capacidad;
};

export const BANDEJAS: Record<Bandeja, DefinicionDeBandeja> = {
  contacto: { clave: "contacto", nombre: "Contacto", href: "/admin/mensajes/contacto", capacidad: "verContacto" },
  cv: { clave: "cv", nombre: "CV", href: "/admin/mensajes/cv", capacidad: "verCV" },
};

export function esBandeja(valor: unknown): valor is Bandeja {
  return typeof valor === "string" && (CLAVES_DE_BANDEJA as readonly string[]).includes(valor);
}

export function capacidadDe(bandeja: Bandeja): Capacidad {
  return BANDEJAS[bandeja].capacidad;
}

/** Nuevo es «sin leer»: nadie lo tomó, lo cerró ni lo marcó. Abrir la ficha no lo cambia. */
export const ESTADOS = ["nuevo", "en-curso", "cerrado", "spam"] as const;
export type EstadoDeMensaje = (typeof ESTADOS)[number];

export const ETIQUETA_DEL_ESTADO: Record<EstadoDeMensaje, string> = {
  nuevo: "Nuevo",
  "en-curso": "En curso",
  cerrado: "Cerrado",
  spam: "Spam",
};

export function esEstado(valor: unknown): valor is EstadoDeMensaje {
  return typeof valor === "string" && (ESTADOS as readonly string[]).includes(valor);
}
