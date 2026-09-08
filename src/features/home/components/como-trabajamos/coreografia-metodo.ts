import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía de «Cómo trabajamos»: timeline scrubbed que mapea 0→1 a las N
 * fases (N se lee de los `[data-paso]` del DOM), nav de puntos sincronizado y
 * parallax del glow. Resuelve todo por data-attributes dentro de `el`; devuelve
 * la limpieza (`ctx.revert()`).
 */
export function crearMetodo(el: HTMLElement) {
  const ctx = gsap.context(() => {
    const pasos = el.querySelectorAll<HTMLElement>("[data-paso]");
    const navDots = el.querySelectorAll<HTMLElement>("[data-nav-dot]");
    const glowBg = el.querySelector<HTMLElement>("[data-glow-bg]");

    // ── Estado inicial: paso 0 visible, el resto ocultos ──────────
    const N = pasos.length;
    if (N >= 2) {
      gsap.set(pasos[0], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
      gsap.set(Array.from(pasos).slice(1), {
        opacity: 0,
        y: 64,
        scale: 0.97,
        filter: "blur(8px)",
      });

      // ── Timeline scrubbed — N fases en 0→1 ───────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // N-1 transiciones uniformes: cada una centrada en (i+1)/N (el paso
      // saliente se va un poco antes y el entrante llega justo después).
      const TRANSITIONS = Array.from({ length: N - 1 }, (_, i) => {
        const outAt = (i + 1) / N - 0.05;
        return { outAt, inAt: outAt + 0.06 };
      });

      TRANSITIONS.forEach(({ outAt, inAt }, i) => {
        tl.to(
          pasos[i],
          {
            opacity: 0,
            y: -56,
            scale: 0.97,
            filter: "blur(8px)",
            duration: 0.1,
            ease: "power2.in",
          },
          outAt,
        ).to(
          pasos[i + 1],
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.14,
            ease: "power3.out",
          },
          inAt,
        );
      });

      // ── Nav dots sincronizados ─────────────────────────────────
      if (navDots.length === N) {
        const dotsTl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        for (let i = 0; i < N - 1; i++) {
          const t = (i + 1) / N;
          dotsTl
            .to(
              navDots[i],
              {
                height: 8,
                backgroundColor: "rgb(31 45 77 / 0.18)",
                ease: "power2.inOut",
                duration: 0.1,
              },
              t,
            )
            .to(
              navDots[i + 1],
              {
                height: 36,
                backgroundColor: "var(--color-naranja-accion)",
                ease: "power2.inOut",
                duration: 0.1,
              },
              t,
            );
        }
      }
    }

    // ── Glow bg parallax ─────────────────────────────────────────
    if (glowBg) {
      gsap.fromTo(
        glowBg,
        { x: 0, y: 0 },
        {
          x: -120,
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 2,
          },
        },
      );
    }
  }, el);

  return () => ctx.revert();
}
