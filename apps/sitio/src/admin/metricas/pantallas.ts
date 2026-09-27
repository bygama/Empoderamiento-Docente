// Las cinco pantallas de Métricas (SPEC padre §5.7), en el orden de sus
// pestañas. Una sola lista para las pestañas y el detalle del encabezado de
// cada pantalla: así una pestaña y su pantalla no pueden decir cosas distintas.

export const METRICAS = {
  nombre: "Métricas",
  para: "Todo dato gratis y legal, sin cookies. Nunca se identifica a una persona ni a una institución.",
};

export type PantallaDeMetricas = {
  clave: "resumen" | "busquedas" | "origen" | "acciones" | "enlaces";
  nombre: string;
  href: string;
  /** Qué es, en una línea: el detalle del encabezado de su pantalla. */
  que: string;
};

export const PANTALLAS_DE_METRICAS: readonly PantallaDeMetricas[] = [
  { clave: "resumen", nombre: "Resumen", href: "/admin/metricas", que: "Cuánta gente entra al sitio, contra el período anterior." },
  { clave: "busquedas", nombre: "Búsquedas", href: "/admin/metricas/busquedas", que: "Qué buscó la gente en Google para llegar al sitio." },
  { clave: "origen", nombre: "Origen", href: "/admin/metricas/origen", que: "Desde qué países, sitios y dispositivos llega la gente." },
  { clave: "acciones", nombre: "Qué hace la gente", href: "/admin/metricas/acciones", que: "Los materiales que más se consultan, y los CV y los contactos que llegan." },
  { clave: "enlaces", nombre: "Links para compartir", href: "/admin/metricas/enlaces", que: "Links cortos propios para saber qué posteo trajo gente." },
];

/** El nombre y el «qué es» de una pantalla, por su clave. */
export function pantallaDeMetricas(clave: PantallaDeMetricas["clave"]): PantallaDeMetricas {
  return PANTALLAS_DE_METRICAS.find((p) => p.clave === clave)!;
}
