// Grid de puntos del manual (DESIGN.md §6) para superficies navy: EXACTAMENTE
// la misma textura que la banda de stats de la home (DatosDuros), para que el
// navy del contacto sea el mismo navy y no un primo.
export const DOTS_NAVY =
  "opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]";

/**
 * Tipografía del titular, UNA sola para el hero (`[data-hero-titulo]`) y el
 * encabezado del selector (`[data-ap-titulo]`): misma familia, peso, tracking
 * y line-height en los dos, así la razón de font-size alcanza para que el
 * ghost del viaje calce clavado sobre ambos. Va en dos mitades porque el h2
 * lleva su margen entre ellas.
 */
export const TITULO_TIPO = {
  familia: "font-display text-azul-principal",
  peso: "font-extrabold tracking-[-0.03em]",
} as const;

// Campos de superficie suave: caja redondeada con relleno navy tenue y borde
// hairline (recesados sobre el panel claro). El foco la vuelve blanca, borde
// verde y un ring verde suave por box-shadow (no mueve layout) + caret verde.
// Label mono arriba. El dropdown de País (PaisDropdown) comparte esta misma
// caja para que el conjunto lea como un solo sistema.
export const INPUT_BASE =
  "w-full rounded-xl border border-azul-claro/60 bg-azul-principal/[0.03] px-3.5 py-2.5 font-sans text-[1rem] text-azul-principal caret-verde-concepto placeholder:text-gris-texto/45 transition-[border-color,background-color,box-shadow] hover:border-azul-claro focus:border-verde-concepto focus:bg-white focus:shadow-[0_0_0_3px_rgb(31_154_120/0.14)] focus:outline-none";
export const LABEL_BASE =
  "text-gris-texto mb-1.5 block font-mono text-[0.66rem] font-medium tracking-[0.14em] uppercase";

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

/** Clases del panel según esté activo (en el flujo) o no (superpuesto). */
export function panelClases(activo: boolean) {
  return activo ? PANEL_ACTIVO : PANEL_INACTIVO;
}
