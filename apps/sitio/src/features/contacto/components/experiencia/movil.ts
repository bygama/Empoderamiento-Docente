/**
 * Contacto bajo `lg` (< 64rem): la experiencia deja de ser UNA pantalla fija.
 * En computadora los cuatro estados viven apilados en absoluto dentro de una
 * raíz de 100svh y morfean entre sí; en celular y tablet eso no sobrevive al
 * teclado virtual (svh no se recalcula y el panel de campos queda recortado).
 * Acá cada panel va en el flujo: el activo ocupa la página, los otros no se
 * renderizan (`display: none`), y el scroll es el de la página. Las clases
 * llevan `max-lg:` para que computadora quede exactamente igual.
 */
export const PANEL_MOVIL =
  "max-lg:relative max-lg:inset-auto max-lg:min-h-[100lvh] max-lg:overflow-visible";

/** Media query bajo `lg` (< 64rem), compartida entre `esMovil()` y los hooks del cliente. */
export const MQ_MOVIL = "(max-width: 63.999rem)";

/** Clases del panel según esté activo: en celular el inactivo no ocupa lugar. */
export function panelClases(activo: boolean) {
  return activo ? PANEL_MOVIL : `${PANEL_MOVIL} max-lg:hidden`;
}

/** ¿Estamos bajo `lg`? Solo en el cliente; en SSR devuelve false. */
export function esMovil() {
  return typeof window !== "undefined" && window.matchMedia(MQ_MOVIL).matches;
}
