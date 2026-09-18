import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hasEntered, onEnter } from "@/lib/intro-signal";
import { entradaHero } from "./entrada-hero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía del hero: estados iniciales pre-paint (cards y copy ocultas),
 * la entrada al atravesar el gate (o a los 6 s como salvaguarda), el parallax
 * de scroll por tarjeta y la copy que se va con el scroll. Devuelve la
 * limpieza. Corre desde el layout effect del hero: la entrada mide cajas antes
 * del primer paint.
 */
export function crearHero(scope: HTMLElement) {
  let cleanupEnter: (() => void) | undefined;
  let fallback: number | undefined;
  let ran = false;

  const ctx = gsap.context(() => {
    const inners = gsap.utils.toArray<HTMLElement>("[data-card-inner]");
    const outers = gsap.utils.toArray<HTMLElement>("[data-card-outer]");

    // Ocultas hasta el ingreso desde el gate.
    gsap.set(inners, { autoAlpha: 0 });
    // Copy oculta por partes: el titular en MÁSCARA (cada línea baja fuera de
    // su recorte) + descripción + acciones.
    // Titular: cada palabra arranca volteada hacia abajo (flip 3D) e invisible.
    gsap.set("[data-hero-word]", {
      opacity: 0,
      yPercent: 120,
      rotateX: -85,
      transformOrigin: "50% 100%",
      transformPerspective: 700,
    });
    // El acento ENTRA en azul (como el resto) y vira a verde en el pop.
    gsap.set("[data-hero-accent]", { color: "#1f2d4d" });
    gsap.set("[data-hero-desc]", { autoAlpha: 0, y: 18 });
    gsap.set("[data-hero-actions]", { autoAlpha: 0, y: 16 });
    // Los carteles de las fotos arrancan ocultos: aparecen DESPUÉS, cuando las
    // cards ya llegaron a su lugar (no desde el frame 0, apiladas).
    gsap.set("[data-card-label]", { autoAlpha: 0, y: 8 });
    // Cards mobile (capa interna) ocultas pre-paint, igual que las del desktop.
    gsap.set("[data-mcard]", { autoAlpha: 0 });
    // Halo blanco de legibilidad oculto pre-paint: aparece RECIÉN al final del
    // armado (fade suave) para no ensuciar la animación de entrada.
    gsap.set("[data-hero-halo]", { autoAlpha: 0 });

    // Centrado base de cada tarjeta. El scroll-parallax va sobre ESTA capa.
    gsap.set(outers, { xPercent: -50, yPercent: -50 });

    const runOnce = () => {
      if (ran) return;
      ran = true;
      entradaHero(inners);
    };
    if (hasEntered()) runOnce();
    else {
      cleanupEnter = onEnter(runOnce);
      // Salvaguarda: si por algún motivo no hubo señal del gate, animamos igual.
      fallback = window.setTimeout(runOnce, 6000);
    }

    // Parallax de scroll por tarjeta (capa [data-card-outer]). El factor `par`
    // viaja en `data-par` para que funcione con AMBOS campos (desktop y mobile)
    // sin depender del índice de CARDS.
    outers.forEach((outer) => {
      const par = parseFloat(outer.dataset.par || "1");
      const extra = -(par - 1) * (scope.offsetHeight || 1);
      gsap.to(outer, {
        y: extra,
        ease: "none",
        scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: true },
      });
    });

    // La copy se va con el scroll.
    gsap.to("[data-hero-copy-scroll]", {
      y: -80,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: scope, start: "top top", end: "55% top", scrub: 1 },
    });
  }, scope);

  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 200);

  return () => {
    window.clearTimeout(refresh);
    if (fallback) window.clearTimeout(fallback);
    cleanupEnter?.();
    ctx.revert();
  };
}
