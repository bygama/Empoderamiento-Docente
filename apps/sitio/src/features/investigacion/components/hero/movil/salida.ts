import gsap from "gsap";
import { HAZ_CIELO, VIDRIO_APAGADO } from "../coreografia-encendido";
import type { Piezas } from "./escena";

/** Cuándo arranca cada tramo de la salida (unidades del timeline). */
export const T = {
  HAZ_SUBE: 0.1,
  APAGADO: 0.42,
  FARO_BAJA: 0.72,
  HOJA: 1.05,
  BANDADA: 1.15,
} as const;
/** La chispa nace cuando se apaga la lámpara. */
export const NACE = T.APAGADO + 0.28;
/** Cuánto baja el faro: su alto y un poco más. */
const AIRE_OCULTO = 40;
const sinRender = { immediateRender: false } as const;

/**
 * La salida del hero en celular, la de escritorio (coreografia-historia.ts,
 * tramos 1 a 3) al tamaño de la escena chica: el titular y los botones ceden
 * y la luz vuelve al cielo; la lámpara se apaga al revés de como se encendió
 * y de su cristal nace la chispa; el faro se hunde girando una vuelta, y la
 * hoja 01 sube sobre la noche mientras él termina de irse.
 */
export function agregarSalida(tl: gsap.core.Timeline, p: Piezas) {
  const { haz, apuntar, posado, giro, girar } = p.encendido.luz;

  // ── 1. El hero cede y la luz lo suelta.
  tl.fromTo(p.acto, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -36, duration: 0.6, ease: "power1.in", ...sinRender }, 0);
  tl.fromTo(
    haz,
    { beta: posado },
    { beta: HAZ_CIELO, duration: 0.5, ease: "power2.inOut", onUpdate: apuntar, ...sinRender },
    T.HAZ_SUBE,
  );

  // ── 2. El faro se apaga —haz, halo, cristal, chispa— y baja girando.
  tl.fromTo(p.haces, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, ...sinRender }, T.APAGADO + 0.05);
  tl.fromTo(
    p.halo,
    { autoAlpha: 1, scale: 1 },
    { autoAlpha: 0, scale: 0.3, duration: 0.25, ease: "power2.in", ...sinRender },
    T.APAGADO + 0.1,
  );
  tl.fromTo(p.vidrio, { opacity: 1 }, { opacity: VIDRIO_APAGADO, duration: 0.2, ...sinRender }, T.APAGADO + 0.18);
  tl.fromTo(
    p.encendido.nucleo,
    { autoAlpha: 1, scale: 1 },
    { autoAlpha: 0, scale: 0.3, duration: 0.1, ease: "power2.in", ...sinRender },
    T.APAGADO + 0.3,
  );
  tl.fromTo(
    p.linterna,
    { y: 0 },
    { y: () => p.linterna.offsetHeight + AIRE_OCULTO, duration: 1, ease: "power1.in", ...sinRender },
    T.FARO_BAJA,
  );
  tl.fromTo(giro, { theta: 0 }, { theta: 360, duration: 1, ease: "power1.in", onUpdate: girar, ...sinRender }, T.FARO_BAJA);

  // ── La chispa nace del cristal y flota mientras el faro se hunde. El salto
  //    de posición va en un `set` aparte: se reaplica cada vez que el playhead
  //    lo cruza, en cualquier dirección (un `from` no).
  const { lx, ly, fx, fy } = p.chispaSale;
  tl.set(p.chispa, { x: lx, y: ly }, NACE);
  tl.fromTo(
    p.chispa,
    { autoAlpha: 0, scale: 0.4 },
    { autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.out", ...sinRender },
    NACE,
  );
  tl.fromTo(
    p.chispa,
    { x: lx, y: ly },
    { x: fx, y: fy, duration: T.BANDADA + 0.09 - (NACE + 0.2), ease: "sine.inOut", ...sinRender },
    NACE + 0.2,
  );

  // ── 3. La hoja sube sobre la noche.
  tl.fromTo(
    p.hoja,
    { yPercent: 100, y: 12 },
    { yPercent: 0, y: 0, duration: 1, ease: "power2.out", ...sinRender },
    T.HOJA,
  );
}
