/**
 * Lecturas del viewport que las coreografías consultan en cada refresh (nunca
 * en el render). Viven fuera de los componentes: leídas dentro de un hook,
 * react-doctor las toma por un acceso a `window` durante el render aunque el
 * closure solo corra dentro de un ScrollTrigger.
 */

/** Alto del viewport, en px. */
export const altoViewport = () => window.innerHeight;

/** Ancho del documento sin la barra de scroll: donde el usuario ve. */
export const anchoDocumento = () => document.documentElement.clientWidth;
