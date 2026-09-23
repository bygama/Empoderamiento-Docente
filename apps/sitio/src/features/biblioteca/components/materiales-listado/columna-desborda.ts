/**
 * La columna de filtros del catálogo es sticky y, en escritorio, nunca pasa del
 * alto de la pantalla: si no entra, se recorre adentro suyo. Pero solo tiene que
 * quedarse con la rueda cuando DE VERDAD desborda. Con `data-lenis-prevent` fijo,
 * en una pantalla alta —donde la columna entra entera— la rueda sobre ella
 * dejaba de mover la página. Esto mide y pone las dos marcas solo cuando hace
 * falta: `data-lenis-prevent` (Lenis la deja scrollear sola) y `data-desborda`
 * (que activa el `overscroll-contain`). Se vuelve a medir cuando cambia el alto
 * de la ventana o del contenido (aparece «Limpiar todo», se achica el ancho).
 */
export function vigilarDesborde(columna: HTMLElement) {
  const medir = () => {
    const desborda = columna.scrollHeight > columna.clientHeight + 1;
    columna.toggleAttribute("data-lenis-prevent", desborda);
    columna.toggleAttribute("data-desborda", desborda);
  };
  const observador = new ResizeObserver(medir);
  observador.observe(columna);
  for (const hijo of Array.from(columna.children)) observador.observe(hijo);
  medir();
  return () => observador.disconnect();
}
