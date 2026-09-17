import { TITULO } from "./data";

/**
 * El ghost del titular que VIAJA del hero al selector: un clon fixed de
 * "Hablemos." en <body>, con la tipografía exacta del destino, listo para
 * animarse por SCALE desde el tamaño del hero (no por font-size, que es
 * layout). Vive fuera del ctx de GSAP: quien lo crea lo tiene que sacar.
 */
export function crearGhostTitulo(d: DOMRect, cs: CSSStyleDeclaration, fsDst: number) {
  const gt = document.createElement("div");
  gt.textContent = TITULO;
  gt.setAttribute("aria-hidden", "true");
  Object.assign(gt.style, {
    position: "fixed",
    left: `${d.left}px`,
    top: `${d.top}px`,
    margin: "0",
    whiteSpace: "nowrap",
    fontFamily: cs.fontFamily,
    fontWeight: cs.fontWeight,
    fontSize: `${fsDst}px`,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    color: cs.color,
    zIndex: "46",
    pointerEvents: "none",
    transformOrigin: "left top",
  } as unknown as CSSStyleDeclaration);
  document.body.appendChild(gt);
  return gt;
}
