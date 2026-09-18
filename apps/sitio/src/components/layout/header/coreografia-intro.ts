import gsap from "gsap";
import { hasRevealed, onReveal } from "@/lib/intro-signal";

// Cuánto se ve el wordmark antes de colapsar y abrir los links. Hay dos tiempos
// según DÓNDE estás cuando arranca la intro (posición de scroll al cargar):
//  - HERO (arriba): tiempo largo, sincronizado a la entrada del hero (cards +
//    texto) — el wordmark colapsa recién cuando el hero termina de asentarse.
//  - De "Quiénes somos" para abajo (recargaste scrolleado): un ratito corto,
//    no tiene sentido hacerte esperar.
// Se elige por POSICIÓN, no por listener de scroll: así el wordmark nunca se
// saltea (el bug viejo venía justamente del listener).
const HERO_HOLD_MS = 3200;
const SCROLLED_HOLD_MS = 900;
// Si la persona ya quiere hacer algo (mueve el mouse, scrollea, toca, teclea)
// no se la hace esperar: el wordmark se sostiene este mínimo y los links
// entran. Quien mira quieto ve la coreografía completa.
const MIN_HOLD_MS = 700;
const EVENTOS_INTENCION = ["pointermove", "wheel", "touchstart", "keydown"] as const;

/**
 * INTRO DEL NAVBAR — arranca CERRADO (logo + wordmark) y morfea a ABIERTO: el
 * wordmark se sostiene un ratito, colapsa, y entran los links con slide + fade
 * escalonado. La llama el MISMO efecto de layout de antes, en la misma
 * posición, y devuelve su limpieza.
 */
export function crearIntroNavbar(nav: HTMLElement) {
  let cleanupReveal: (() => void) | undefined;
  let fallback: number | undefined;
  let openTimer: number | undefined;
  let ran = false;
  let quitarIntencion = () => {};

  const ctx = gsap.context(() => {
    // Estado inicial CERRADO: logo + wordmark expandido + visible, links
    // colapsados. (El JSX por defecto es el ABIERTO, para verse armado sin
    // JS / reduced-motion.) Los ítems apenas corridos para entrar escalonados.
    gsap.set("[data-nav-word]", {
      width: "auto",
      autoAlpha: 1,
      marginLeft: 12,
    });
    gsap.set("[data-nav-links]", { width: 0, autoAlpha: 0 });
    gsap.set("[data-nav-item]", { autoAlpha: 0, x: -8 });
    // Mobile: la hamburguesa NO se esconde durante el wordmark. Sin ella la
    // página queda sin navegación hasta que termina el intro, y un celular
    // no tiene otra puerta.

    const play = () => {
      if (ran) return;
      ran = true;
      if (openTimer) window.clearTimeout(openTimer);
      // Morph cerrado → abierto: el wordmark se desvanece (rápido, adelantado)
      // + colapsa su ancho, y A LA VEZ la píldora crece (expo.out) y los ítems
      // entran con slide + fade ESCALONADO. (La espera la maneja el schedule.)
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        // 1) CIERRA: el wordmark se desvanece y colapsa su ancho del todo.
        .to("[data-nav-word]", {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
        })
        .to(
          "[data-nav-word]",
          { width: 0, marginLeft: 0, duration: 0.45, ease: "power3.out" },
          "<",
        )
        // 2) ABRE: la píldora crece (expo.out) y los ítems entran escalonados.
        .set("[data-nav-links]", { autoAlpha: 1 }, "+=0.08")
        .to(
          "[data-nav-links]",
          { width: "auto", duration: 0.75, ease: "expo.out" },
          "<",
        )
        .to(
          "[data-nav-item]",
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.07,
          },
          "<0.12",
        );
    };

    // Elegí el "ratito" según dónde estás al cargar: en el hero (arriba), el
    // tiempo largo sincronizado al hero; ya scrolleado en "Quiénes somos" o
    // más abajo, el corto. Es por POSICIÓN, sin listener de scroll, así el
    // wordmark siempre tiene su momento (el bug viejo venía del listener).
    const schedule = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.5;
      const arranque = performance.now();
      openTimer = window.setTimeout(
        play,
        pastHero ? SCROLLED_HOLD_MS : HERO_HOLD_MS,
      );
      // Intención de uso: adelanta la apertura al mínimo de sostén.
      const intencion = () => {
        quitarIntencion();
        if (ran) return;
        window.clearTimeout(openTimer);
        const faltante = Math.max(
          0,
          MIN_HOLD_MS - (performance.now() - arranque),
        );
        openTimer = window.setTimeout(play, faltante);
      };
      EVENTOS_INTENCION.forEach((ev) =>
        window.addEventListener(ev, intencion, { passive: true }),
      );
      quitarIntencion = () =>
        EVENTOS_INTENCION.forEach((ev) =>
          window.removeEventListener(ev, intencion),
        );
    };

    // Se dispara cuando el gate termina (página revelada). Fallback por si no
    // hubo gate o nunca avisó.
    if (hasRevealed()) schedule();
    else {
      cleanupReveal = onReveal(schedule);
      fallback = window.setTimeout(schedule, 6000);
    }
  }, nav);

  return () => {
    if (fallback) window.clearTimeout(fallback);
    if (openTimer) window.clearTimeout(openTimer);
    quitarIntencion();
    cleanupReveal?.();
    ctx.revert();
  };
}
