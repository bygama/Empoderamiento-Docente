import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La entrada del archivo en desktop (Facundo, 2026-09-14): una
 * sola timeline scrubbeada, SIN pin, sobre una pantalla pegada (sticky)
 * que lleva el título arriba y la pila abajo.
 *
 * 1. EL TÍTULO llega grande y centrado en la pantalla y, en el primer
 *    tramo de la pista, se achica y va directo a su lugar: arriba a la
 *    izquierda, con la pila todavía invisible debajo.
 * 2. LA PILA APARECE, sin más efecto, cuando el título ya está quieto en
 *    su esquina. (Hubo un barrido doble de líneas verdes descubriéndola
 *    desde el centro, como el de «Quiénes somos» del inicio; Facundo lo
 *    sacó: «que aparezcan después de que se mueve el título, sin ningún
 *    efecto».)
 *
 * Sin pin de ScrollTrigger a propósito: el expediente abierto es una capa
 * fija adentro de esta sección y un pin (position fixed más spacer) se le
 * cruzaría; el sticky no le molesta. El hook (maquina/useEscenaIndice.ts)
 * la crea en un gsap.context y la revierte al desmontar el índice.
 */

/** Tramos de la pista, en pantallas de scroll: el achique y la aparición. */
const TRAMO_TITULO = 0.6;
const TRAMO_APARICION = 0.25;
/** Escala máxima del título grande; se limita al ancho de la pantalla. */
const ESCALA_MAX = 2.6;
/** Aire a cada lado del título grande, en px. */
const MARGEN = 72;

export function escenaIndice({
  pista,
  escena,
  titulo,
  pila,
}: {
  pista: HTMLElement;
  escena: HTMLElement;
  titulo: HTMLElement;
  pila: HTMLElement;
}) {
  gsap.set(pista, { height: `${(1 + TRAMO_TITULO + TRAMO_APARICION) * 100}svh` });
  // El mismo aire arriba que la sección (py-28): el título queda en su
  // esquina de siempre, no pegado al borde ni bajo el header flotante.
  gsap.set(escena, { position: "sticky", top: 0, height: "100svh", paddingTop: "7rem" });
  gsap.set(titulo, { transformOrigin: "50% 50%", willChange: "transform" });
  gsap.set(pila, { autoAlpha: 0 });

  // De dónde parte el título: centrado en la pantalla y grande. Se mide
  // con la geometría de layout (offset*), que no ve el transform que el
  // título tenga puesto en el momento del refresh.
  const desde = () => {
    const w = titulo.offsetWidth;
    const h = titulo.offsetHeight;
    const izquierda = escena.getBoundingClientRect().left + titulo.offsetLeft;
    return {
      scale: Math.min(ESCALA_MAX, (window.innerWidth - 2 * MARGEN) / w),
      x: window.innerWidth / 2 - (izquierda + w / 2),
      y: window.innerHeight / 2 - (titulo.offsetTop + h / 2),
    };
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pista,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  const parteTitulo = TRAMO_TITULO / (TRAMO_TITULO + TRAMO_APARICION);
  tl.fromTo(
    titulo,
    { scale: () => desde().scale, x: () => desde().x, y: () => desde().y },
    { scale: 1, x: 0, y: 0, duration: parteTitulo, ease: "power2.inOut" },
    0,
  );
  tl.fromTo(
    pila,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 1 - parteTitulo, ease: "power1.out", immediateRender: false },
    parteTitulo,
  );
  return tl;
}
