import gsap from "gsap";
import { FIGURAS, PERSONAJE, PUNTOS } from "../../constelacion";
import { ESTRELLA } from "../estrellas";
import type { Piezas } from "./escena";
import { T } from "./salida";

/** Cuándo se trazan las aristas de la pregunta, ya con la bandada posada. */
export const TRAZO = 2.75;
/** Grosor de las aristas en unidades de lámina (el de las láminas ED). */
const GROSOR_ARISTA = 1.5;
const sinRender = { immediateRender: false } as const;

/**
 * La bandada en celular: las 13 estrellas del cielo —las mismas que la luz
 * tocó— bajan sobre la hoja y se arman en la pregunta, y la chispa vuela
 * detrás de la naranja hasta que el punto final la guarda. Es el tramo 4 de
 * escritorio (coreografia-historia.ts) con el despegue desde el cielo de
 * celular y un vuelo más corto: en un celular el recorrido son pocos
 * centímetros.
 */
export function agregarVuelo(tl: gsap.core.Timeline, p: Piezas) {
  const { cielo } = p;
  const { reposo } = p.encendido.luz;
  const base = FIGURAS[0];
  const X = (punto: readonly [number, number]) => () => cielo.x(punto[0]);
  const Y = (punto: readonly [number, number]) => () => cielo.y(punto[1]);

  p.circulos.forEach((c, i) => {
    const orden = i === PERSONAJE ? 0 : i + 1;
    const salida = T.BANDADA + orden * 0.042;
    const punto = base.puntos[i];
    const rEstrella = PUNTOS[i].r * ESTRELLA.tocada;
    const sx = () => cielo.estrella(i)[0];
    const sy = () => cielo.estrella(i)[1];
    // Waypoint propio, con un desvío determinista por índice: nada viaja rígido.
    const wx = () => (sx() + cielo.x(punto[0])) / 2 + (((i * 17 + 3) % 7) - 3) * 9;
    const wy = () => (sy() + cielo.y(punto[1])) / 2 + (((i * 29 + 5) % 11) - 5) * 8;
    tl.fromTo(
      c,
      { attr: { cx: sx, cy: sy, r: () => reposo.r[i] ?? rEstrella, "fill-opacity": () => reposo.brillo[i] ?? 1 } },
      { attr: { cx: wx, cy: wy, r: rEstrella * 0.85, "fill-opacity": 1 }, duration: 0.5, ease: "power1.in", ...sinRender },
      salida,
    );
    tl.fromTo(
      c,
      { attr: { cx: wx, cy: wy, r: rEstrella * 0.85 } },
      {
        attr: { cx: X(punto), cy: Y(punto), r: () => PUNTOS[i].r * cielo.escala() },
        duration: 0.55,
        ease: "power3.out",
        ...sinRender,
      },
      salida + 0.5,
    );
  });

  // ── La chispa vuela detrás de la naranja y el punto final la guarda.
  {
    const guarda = base.puntos[PERSONAJE];
    const { fx, fy } = p.chispaSale;
    const salida = T.BANDADA + 0.09;
    const wx = () => (fx() + cielo.x(guarda[0])) / 2 - 26;
    const wy = () => (fy() + cielo.y(guarda[1])) / 2 + 22;
    tl.fromTo(p.chispa, { x: fx, y: fy }, { x: wx, y: wy, duration: 0.5, ease: "power1.in", ...sinRender }, salida);
    tl.fromTo(
      p.chispa,
      { x: wx, y: wy },
      { x: X(guarda), y: Y(guarda), duration: 0.55, ease: "power3.out", ...sinRender },
      salida + 0.5,
    );
    tl.fromTo(
      p.chispa,
      { autoAlpha: 1, scale: 1 },
      { autoAlpha: 0, scale: 0.15, duration: 0.25, ease: "power2.in", ...sinRender },
      salida + 0.95,
    );
  }

  // ── Las aristas se trazan sobre la figura recién formada.
  p.lineas.forEach((l, j) => {
    const arista = base.aristas[j];
    if (!arista) return;
    const [a, b] = arista;
    const largo = () =>
      Math.hypot(base.puntos[b][0] - base.puntos[a][0], base.puntos[b][1] - base.puntos[a][1]) * cielo.escala();
    tl.fromTo(
      l,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        strokeDasharray: largo,
        strokeDashoffset: largo,
        attr: {
          "stroke-width": () => GROSOR_ARISTA * cielo.escala(),
          x1: X(base.puntos[a]),
          y1: Y(base.puntos[a]),
          x2: X(base.puntos[b]),
          y2: Y(base.puntos[b]),
        },
        duration: 0.02,
        ...sinRender,
      },
      TRAZO,
    );
    tl.fromTo(
      l,
      { strokeDashoffset: largo },
      { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", ...sinRender },
      TRAZO + 0.05 + j * 0.035,
    );
  });
  // Liberar el dash para que los morphs de los pasos muevan extremos.
  tl.set(p.lineas, { strokeDasharray: "none", strokeDashoffset: 0 }, TRAZO + 0.9);
}
