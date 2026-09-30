import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Tiempos } from "./tiempos-quienes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Indicador horizontal de progreso (Quiénes somos → Misión). Es la versión
 * HORIZONTAL del indicador vertical de "Cómo trabajamos": misma cápsula
 * naranja alargada (tramo activo) + punto gris (inactivo) sobre una línea
 * fina. La cápsula activa pasa de QS a Misión durante el MISMO tramo de scroll
 * que el barrido verde, con los tiempos de la rama (`tiempos-quienes.ts`).
 * Suave (scrub). Corre adentro del `gsap.context` de `crearQuienes`; el
 * markup es `IndicadorQuienes`.
 */
export function crearProgresoQuienes(panel: HTMLElement, zone: HTMLElement, T: Tiempos) {
  const prog = panel.querySelector<HTMLElement>("[data-qs-progress]");
  const seg0 = panel.querySelector<HTMLElement>('[data-qs-seg="0"]');
  const seg1 = panel.querySelector<HTMLElement>('[data-qs-seg="1"]');
  if (!prog || !seg0 || !seg1) return;
  // Cada cápsula CRECE de izquierda a derecha (8→36px) a medida que se lee
  // su sección — igual que el texto se va llenando con el scroll. En el
  // barrido el activo pasa de "Quiénes somos" a "Misión" (tamaño + color).
  // Un solo ScrollTrigger calcula el estado por fase (evita conflictos):
  //   lectura de QS · barrido · lectura de Misión, en vh (T).
  const ORANGE = [224, 122, 47, 1];
  const GREY = [31, 45, 77, 0.18];
  const clamp = (v: number, a: number, b: number) =>
    v < a ? a : v > b ? b : v;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const mix = (c1: number[], c2: number[], t: number) =>
    `rgba(${Math.round(lerp(c1[0], c2[0], t))}, ${Math.round(
      lerp(c1[1], c2[1], t),
    )}, ${Math.round(lerp(c1[2], c2[2], t))}, ${lerp(
      c1[3],
      c2[3],
      t,
    ).toFixed(3)})`;
  ScrollTrigger.create({
    trigger: zone,
    start: "top top",
    end: () => "top top-=" + window.innerHeight * T.fin,
    scrub: 0.6,
    onUpdate: (self) => {
      const s = self.progress * T.fin; // vh recorridos dentro de la zona
      const qsRead = clamp((s - T.qs[0]) / (T.qs[1] - T.qs[0]), 0, 1);
      const wipe = clamp((s - T.barrido[0]) / (T.barrido[1] - T.barrido[0]), 0, 1);
      const misRead = clamp((s - T.mision[0]) / (T.mision[1] - T.mision[0]), 0, 1);
      gsap.set(seg0, {
        width: lerp(lerp(8, 36, qsRead), 8, wipe),
        backgroundColor: mix(ORANGE, GREY, wipe),
      });
      gsap.set(seg1, {
        width: lerp(8, 36, misRead),
        backgroundColor: mix(GREY, ORANGE, wipe),
      });
      gsap.set(prog, { autoAlpha: clamp(s / T.qs[0], 0, 1) });
    },
  });
}
