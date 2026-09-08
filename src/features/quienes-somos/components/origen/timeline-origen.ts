import gsap from "gsap";
import type { Piezas } from "./estados-origen";

/**
 * Timeline maestro (≈11.5 unidades repartidas en toda la zona): los cinco
 * beats, 100% conducidos por el scroll (scrub — ida y vuelta). El panel de
 * fotos se suma después sobre este mismo timeline (`animarPanel`).
 */
export function crearTimelineOrigen(
  zone: HTMLElement,
  beats: HTMLElement[],
  p: Piezas,
  setDot: (progreso: number) => void,
) {
  const { chars0, quoteCard, quoteLines, quoteMark, quoteSub, typeChars, sub2, path } = p;
  const { nodos, labels, finWords, finRule, finSub, constTitle } = p;
  const { constvLine, constvNodes, constvCopies } = p;

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: zone,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => setDot(self.progress),
    },
  });

  // BEAT 0 → estallido de letras
  chars0.forEach((c, i) => {
    tl.to(
      c,
      {
        x: Math.sin(i * 3.7) * 190,
        y: -70 - ((i * 37) % 110),
        rotation: Math.sin(i * 1.3) * 55,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power2.in",
      },
      0.6 + (i % 7) * 0.05,
    );
  });
  tl.to(beats[0], { autoAlpha: 0, duration: 0.4 }, 1.3);

  // BEAT 1 — la cita (tarjeta 3D)
  tl.to(beats[1], { autoAlpha: 1, duration: 0.3 }, 1.5)
    .to(quoteCard, { rotateX: 0, y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, 1.6)
    .to(quoteLines, { yPercent: 0, duration: 0.6, stagger: 0.14, ease: "power3.out" }, 2.1);
  if (quoteMark) tl.to(quoteMark, { autoAlpha: 1, duration: 0.35 }, 2.15);
  if (quoteSub) tl.to(quoteSub, { autoAlpha: 1, y: 0, duration: 0.45 }, 2.8);
  tl.to(beats[1], { autoAlpha: 0, y: -50, scale: 0.96, duration: 0.6 }, 3.6);

  // BEAT 2 — la pregunta se tipea con el scroll
  tl.to(beats[2], { autoAlpha: 1, duration: 0.3 }, 4.0)
    .to(typeChars, { opacity: 1, duration: 0.02, stagger: 0.055, ease: "none" }, 4.2);
  if (sub2) tl.to(sub2, { autoAlpha: 1, y: 0, duration: 0.5 }, 5.6);
  tl.to(beats[2], { autoAlpha: 0, y: -50, scale: 0.96, duration: 0.6 }, 6.2);

  // BEAT 3 — qué es ED (definición institucional)
  // Secuencia: título grande → la línea se dibuja y cada hito se activa
  // cuando el trazo llega a su posición. Todo scrubbed: avanza y retrocede
  // con el usuario, sin estados one-shot.
  tl.to(beats[3], { autoAlpha: 1, duration: 0.3 }, 6.55);
  if (constTitle) {
    tl.fromTo(
      constTitle,
      { autoAlpha: 0, y: 26, filter: "blur(6px)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
      6.6,
    );
  }
  // Trazo: horizontal (desktop) y vertical (mobile) comparten timing.
  const DRAW_AT = 7.1;
  const DRAW_DUR = 2.05;
  if (path) tl.to(path, { strokeDashoffset: 0, duration: DRAW_DUR, ease: "none" }, DRAW_AT);
  if (constvLine) {
    tl.fromTo(
      constvLine,
      { scaleY: 0 },
      { scaleY: 1, duration: DRAW_DUR, ease: "none" },
      DRAW_AT,
    );
  }
  nodos.forEach((n, i) => {
    const at = DRAW_AT + (i / (nodos.length - 1)) * (DRAW_DUR - 0.2);
    tl.to(n, { attr: { r: 8 }, duration: 0.25, ease: "back.out(3)" }, at);
    if (labels[i]) tl.to(labels[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.08);
  });
  constvNodes.forEach((n, i) => {
    const at = DRAW_AT + (i / Math.max(constvNodes.length - 1, 1)) * (DRAW_DUR - 0.2);
    // Futuros tenues y chicos (expectativa) → activos plenos al llegar.
    tl.fromTo(
      n,
      { scale: 0.35, autoAlpha: 0.35 },
      { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(3)" },
      at,
    );
    if (constvCopies[i]) {
      tl.fromTo(
        constvCopies[i],
        { autoAlpha: 0.16, x: -10 },
        { autoAlpha: 1, x: 0, duration: 0.35 },
        at + 0.08,
      );
    }
  });
  tl.to(beats[3], { autoAlpha: 0, y: -40, scale: 0.97, duration: 0.5 }, 9.45);

  // BEAT 4 — «Vivir para hacer vivir» (corrido +0.25: el beat 3 ahora
  // respira al completarse; el respiro final del pin no cambia)
  tl.to(beats[4], { autoAlpha: 1, duration: 0.3 }, 9.75);
  tl.to(
    finWords,
    { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.55, stagger: 0.16, ease: "power3.out" },
    9.85,
  );
  if (finRule) tl.to(finRule, { scaleX: 1, duration: 0.5, ease: "power2.out" }, 10.4);
  if (finSub) tl.to(finSub, { autoAlpha: 1, y: 0, duration: 0.5 }, 10.55);
  tl.to({}, { duration: 0.6 }, 10.9); // respiro final antes de soltar el pin
  setDot(0);
  return tl;
}
