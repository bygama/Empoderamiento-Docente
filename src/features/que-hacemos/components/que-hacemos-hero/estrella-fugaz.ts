import gsap from "gsap";

/**
 * Estrella fugaz ocasional: UNA sola, cada ~9-13s, arriba del cielo (nunca
 * sobre el titular), rápida y tenue — vida, no espectáculo. Solo client y solo
 * con motion: la aleatoriedad vive acá, así que no toca la hidratación.
 * Devuelve la limpieza.
 */
export function crearEstrellaFugaz(fugaz: HTMLElement) {
  let tl: gsap.core.Timeline | null = null;
  let primera = true;
  const lanzar = () => {
    const W = window.innerWidth;
    const x0 = W * (0.12 + Math.random() * 0.6);
    const y0 = window.innerHeight * (0.06 + Math.random() * 0.2);
    const largo = 180 + Math.random() * 140;
    // La primera sale pronto (~4s, con la entrada ya asentada); las
    // siguientes respetan la cadencia lenta.
    tl = gsap
      .timeline({ delay: primera ? 4 : 9 + Math.random() * 4, onComplete: lanzar })
      .set(fugaz, { x: x0, y: y0, rotation: 24, autoAlpha: 0 })
      .to(fugaz, { autoAlpha: 0.55, duration: 0.18, ease: "power1.in" })
      .to(fugaz, { x: x0 + largo, y: y0 + largo * 0.45, duration: 0.75, ease: "power2.out" }, 0)
      .to(fugaz, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0.5);
    primera = false;
  };
  lanzar();

  return () => {
    tl?.kill();
    gsap.set(fugaz, { autoAlpha: 0 });
  };
}
