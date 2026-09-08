import gsap from "gsap";
import type { Piezas } from "./estados-origen";

/**
 * Panel de fotos (beats 0–2, solo desktop + motion): se acopla a la derecha
 * junto con la lámina. La ENTRADA anima el wrapper externo (panel) y la
 * SALIDA —dentro del timeline maestro— anima la lámina interna (lamina).
 * Cada ScrollTrigger es dueño exclusivo de su elemento: no dependemos del
 * orden de render de GSAP cuando ambos escriben las mismas propiedades.
 */
export function prepararPanel(root: HTMLElement, { panel, photoFrames, notchRail }: Piezas) {
  if (!panel) return;
  gsap.set(photoFrames.slice(1), { autoAlpha: 0 });
  if (notchRail) gsap.set(notchRail, { yPercent: 8 });
  gsap.fromTo(
    panel,
    { autoAlpha: 0, y: 170, x: 46, rotate: 1.4 },
    {
      autoAlpha: 1,
      y: 0,
      x: 0,
      rotate: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top 82%", end: "top top", scrub: true },
    },
  );
}

/**
 * Las fotos se revelan DENTRO de la máscara (fade + blur + leve
 * desplazamiento), en sincronía con las transiciones de texto. La muesca del
 * borde izquierdo recorre el panel con el progreso de la historia. El panel
 * despega antes de la constelación (beat 3).
 */
export function animarPanel(tl: gsap.core.Timeline, p: Piezas) {
  const { panel, lamina, photoFrames, photoImgs, notchRail } = p;
  if (!panel || photoFrames.length !== 3) return;
  const SWAPS = [
    { out: 0, entra: 1, at: 1.35 }, // con la transición beat 0 → 1
    { out: 1, entra: 2, at: 3.65 }, // con la transición beat 1 → 2
  ] as const;
  SWAPS.forEach(({ out, entra, at }) => {
    tl.to(
      photoFrames[out],
      {
        autoAlpha: 0,
        yPercent: -6,
        scale: 1.04,
        filter: "blur(9px)",
        duration: 0.5,
        ease: "power2.in",
      },
      at,
    ).fromTo(
      photoFrames[entra],
      { autoAlpha: 0, yPercent: 8, scale: 1.06, filter: "blur(9px)" },
      {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
      },
      at + 0.18,
    );
  });
  // Deriva vertical continua de la foto activa (profundidad sutil).
  // Cada deriva arranca cuando su frame empieza a entrar (at + 0.18).
  tl.fromTo(photoImgs[0], { yPercent: 2.6 }, { yPercent: -2.6, ease: "none", duration: 1.85 }, 0);
  tl.fromTo(photoImgs[1], { yPercent: 2.6 }, { yPercent: -2.6, ease: "none", duration: 2.3 }, 1.53);
  tl.fromTo(photoImgs[2], { yPercent: 2.6 }, { yPercent: -2.6, ease: "none", duration: 2.4 }, 3.83);
  // Muesca deslizante (guiño editorial de la referencia). El rail mide
  // la altura del panel, así que yPercent 8→74 = top 8%→74% pero por
  // transform (composited): sin reflow por frame y a prueba de resize.
  if (notchRail) {
    tl.fromTo(notchRail, { yPercent: 8 }, { yPercent: 74, ease: "none", duration: 5.3 }, 0.7);
  }
  // Salida del panel antes del beat 3 (la constelación usa todo el
  // ancho). Anima la lámina interna: la entrada es dueña del wrapper
  // externo y acá nadie pisa propiedades de nadie.
  if (lamina) {
    tl.to(lamina, { autoAlpha: 0, x: 80, y: 46, scale: 0.965, duration: 0.55, ease: "power2.in" }, 6.05);
  }
}
