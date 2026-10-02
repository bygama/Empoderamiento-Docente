/**
 * Los cuatro estados de Contacto, en TODOS los tamaños: el panel activo va en
 * el flujo y los inactivos quedan superpuestos en absoluto, arriba. Cada uno
 * mide al menos una pantalla: si el contenido entra, se ve como una sola
 * pantalla centrada; si no entra (notebook baja, zoom, celular, teclado
 * virtual), la sección crece y scrollea LA PÁGINA. Ningún panel scrollea por
 * dentro: antes la raíz medía 100svh fijos y cada panel tenía su
 * `overflow-y-auto`, y en una ventana de menos de ~720px de alto aparecía una
 * segunda barra adentro de la de la página.
 *
 * El inactivo no lleva `bottom`: mide lo mismo que cuando estaba en el flujo,
 * así que al cambiar de vista el que sale no se mueve mientras se apaga.
 */
const PANEL_ACTIVO = "relative min-h-[100svh]";
const PANEL_INACTIVO = "absolute inset-x-5 top-0 min-h-[100svh] md:inset-x-10";

/** Media query bajo `lg` (< 64rem), compartida entre `esMovil()` y los hooks del cliente. */
export const MQ_MOVIL = "(max-width: 63.999rem)";

/** Clases del panel según esté activo (en el flujo) o no (superpuesto). */
export function panelClases(activo: boolean) {
  return activo ? PANEL_ACTIVO : PANEL_INACTIVO;
}

/** ¿Estamos bajo `lg`? Solo en el cliente; en SSR devuelve false. */
export function esMovil() {
  return typeof window !== "undefined" && window.matchMedia(MQ_MOVIL).matches;
}
