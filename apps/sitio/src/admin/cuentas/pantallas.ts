// Las dos pantallas de Cuentas con pestaña (SPEC padre §5.8), en su orden.
// Invitar y la ficha de una cuenta no llevan pestañas: vuelven con «← Cuentas».

export const CUENTAS = { nombre: "Cuentas", href: "/admin/cuentas" } as const;

export const PESTANAS_DE_CUENTAS = [
  { href: "/admin/cuentas", etiqueta: "Personas" },
  { href: "/admin/cuentas/actividad", etiqueta: "Actividad" },
] as const;

/** «← Cuentas», para los detalles. */
export const VOLVER_A_CUENTAS = { href: CUENTAS.href, etiqueta: CUENTAS.nombre };
