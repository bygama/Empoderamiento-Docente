import gsap from "gsap";
import { altoViewport, anchoDocumento } from "@/lib/viewport";
import { CAMARA } from "./constelacion-mirada";

// Aire entre fichas y relleno de arriba y abajo de cada una, en rem (el gap
// de siempre y el py-3 del markup), y cuánto se pueden apretar como mucho.
const AIRE = 0.55;
const RELLENO = 0.75;
const APRIETE_MAX = 0.5;
// Lo que queda libre, en px, entre la última ficha y el borde de abajo.
const PIE = 16;

/**
 * Ubica cada pila de fichas bajo el punto donde la cámara deja su nodo
 * (CAMARA[i]): 28 px a la derecha y 54 px abajo, debajo del rótulo. Corre al
 * montar y en cada refresh del timeline, porque la cámara se recalcula con el
 * alto de ese momento: con los píxeles del montaje, si el alto cambiaba
 * después (zoom, barra del navegador) la primera ficha caía sobre el rótulo.
 * Los sets del refresh nacen fuera del registro del contexto y no hace falta
 * sumarlos: el revert de los del montaje devuelve todo a como estaba.
 *
 * Si la pila no entra hasta el pie (a 730 de alto, la del 03, con textos de
 * dos y tres renglones, cortaba la quinta ficha), se aprietan el aire y el
 * relleno en la misma proporción, lo justo y como mucho a la mitad.
 */
export function ubicarFichas(grupos: HTMLElement[]) {
  // clientWidth (sin scrollbar): la cámara aterriza donde el usuario ve.
  const W = anchoDocumento();
  const H = altoViewport();
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  grupos.forEach((g, i) => {
    const top = CAMARA[i].ty * H + 54;
    const fichas = gsap.utils.toArray<HTMLElement>("[data-ficha]", g);
    const espaciar = (f: number) => {
      gsap.set(g, { gap: `${AIRE * f}rem` });
      gsap.set(fichas, { paddingTop: `${RELLENO * f}rem`, paddingBottom: `${RELLENO * f}rem` });
    };
    gsap.set(g, { left: CAMARA[i].tx * W + 28, top });
    espaciar(1);
    const sobra = g.offsetHeight - (H - top - PIE);
    if (sobra <= 0) return;
    const espacio = ((fichas.length - 1) * AIRE + fichas.length * 2 * RELLENO) * rem;
    espaciar(Math.max(1 - APRIETE_MAX, 1 - sobra / espacio));
  });
}
