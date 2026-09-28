import gsap from "gsap";
import { panelDe, type Contexto } from "./contexto";

// ── APERTURA → FORMULARIO en móvil ─────────────────────────────────────────
// Bajo `lg` el panel saliente pasa a display:none al instante (setVista):
// sus tweens de salida animarían sobre nada mientras el entrante espera
// en blanco. Se salta directo a la cascada de entrada, arrancando en 0.
export function elegirTemaMovil(c: Contexto, root: HTMLElement, campos: HTMLElement[]) {
  gsap.set(panelDe(c, "apertura"), { autoAlpha: 0 });
  gsap.set(panelDe(c, "formulario"), { autoAlpha: 1 });
  gsap.fromTo(
    campos,
    { autoAlpha: 0, y: 18 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.06,
      onComplete: () => {
        c.estado.animando = false;
        root.querySelector<HTMLInputElement>("#ct-nombre")?.focus({ preventScroll: true });
      },
    },
  );
}

// ── FORMULARIO → APERTURA en móvil ─────────────────────────────────────────
// Bajo `lg` el formulario ya pasó a display:none (setVista): sus tweens de
// salida animarían sobre nada. Se salta a la cascada de entrada de la
// apertura, arrancando en 0.
export function cambiarTemaMovil(c: Contexto, volverElFoco: () => void) {
  gsap.set(panelDe(c, "formulario"), { autoAlpha: 0 });
  gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
  c.estado.animando = true;
  gsap
    .timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        c.estado.animando = false;
        volverElFoco();
      },
    })
    .fromTo(
      "[data-ap-head], [data-ap-h2]",
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, y: 0, duration: 0.43 },
      0,
    )
    .fromTo(
      "[data-tema-card]",
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.02 },
      0,
    );
}
