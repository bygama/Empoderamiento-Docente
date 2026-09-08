import type { Geo, GeoTambor } from "./geometria-torre";

/** Escala de la línea: a tamaño final no entra en pantalla (~2000px). */
export const ESCALA_LINEA = 0.55;
export const DEG = Math.PI / 180;
const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

type Letras = {
  spans: (HTMLSpanElement | null)[];
  g: GeoTambor;
  geo: Geo;
  /** Ángulo del tambor en esta estación (fase + scroll). */
  rot: number;
  /** 0→1 del enrollado; 1 = tubo cerrado (todos los tambores salvo el 01). */
  rollo: number;
  /** Ángulo efectivo durante el rollo: de la línea centrada a la estación. */
  rotNow: number;
  enRollo: boolean;
  /** Opacidad de la línea durante el armado (build.linea). */
  linea: number;
  /** Escribir el transform final una sola vez (ver `fijado`). */
  fijar: boolean;
  acento: string;
  /** Largo del nombre sin separador: lo que se lee en la línea. */
  nombreLen: number;
};

/**
 * Las rebanadas del nombre, letra por letra.
 *
 * ENROLLADO: una línea es un arco de radio infinito. Se parte de un radio
 * enorme (R / rollo) tangente al frente y se lo cierra hasta R: cada letra
 * conserva su arco real, así la línea se dobla sola sin que nada se
 * amontone. Mientras tanto la fase se desliza desde la del nombre centrado
 * hasta la de la estación.
 */
export function pintarLetras({ spans, g, geo, rot, rollo, rotNow, enRollo, linea, fijar, acento, nombreLen }: Letras) {
  const e = Math.max(rollo, 1e-4);
  const rho = geo.r / e;
  // Copias repetidas y separadores: apagados en la línea, entran con
  // el arco (si no, la línea muestra "…ONAL • DESARROLLO PROF…").
  const copiaFade = Math.min(1, Math.max(0, (rollo - 0.35) / 0.5));
  for (let j = 0; j < spans.length; j++) {
    const s = spans[j];
    if (!s) continue;
    let c: number;
    let vis = 1;
    if (enRollo) {
      const aw = wrap180(g.angs[j] + rotNow);
      const phi = aw * e; // grados: s/ρ = (aw·R)/(R/e)
      c = Math.cos(phi * DEG);
      const x = rho * Math.sin(phi * DEG);
      const z = geo.r - rho + rho * Math.cos(phi * DEG);
      s.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0px, ${z}px) rotateY(${phi}deg)`;
      vis = linea * (j < nombreLen ? 1 : copiaFade);
    } else {
      const a = (((g.angs[j] + rot) % 360) + 360) % 360;
      c = Math.cos(a * DEG);
      if (fijar) {
        s.style.transform = `translate(-50%, -50%) rotateY(${g.angs[j]}deg) translateZ(${geo.r}px)`;
      }
    }
    if (c > 0) {
      // Zona legible bien marcada: plena de frente, cae rápido hacia
      // los costados (antes 0.2 + 0.8·c, casi lineal).
      s.style.opacity = String((0.08 + 0.92 * Math.pow(c, 1.5)) * vis);
      // El acento se REPONE, no se limpia: `color = ""` borraba el
      // color que pone React desde data y las letras volvían al navy
      // heredado en el frame siguiente.
      s.style.color = acento;
      s.style.textShadow = "none";
    } else {
      // Cara de atrás: se ve a través del "vidrio", tenue y difusa. La
      // sombra toma el color de la estación (antes navy fijo), así el
      // tambor tiene su tinte también por detrás. A la mitad de lo que
      // estaba: las letras espejadas ensuciaban el frente que se lee.
      s.style.opacity = String((0.05 + 0.06 * -c) * vis);
      s.style.color = "transparent";
      s.style.textShadow = `0 0 14px color-mix(in srgb, ${acento} 55%, transparent)`;
    }
  }
  return copiaFade;
}
