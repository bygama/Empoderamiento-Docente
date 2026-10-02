import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import type { Maquina } from "./useLugarExpediente";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Entrada del índice (primera vez en viewport) ─────────────────── */
export function useEntradaIndice(m: Maquina) {
  const { activo, reduced, sectionRef, entradaHechaRef } = m;
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || activo !== null) return;
    if (reduced || entradaHechaRef.current) return;
    // En desktop con puntero la entrada es la escena del índice (título
    // grande que se achica y pila que se arma, useEscenaIndice), atada al
    // scroll. En touch es el mismo gesto, por tiempo y una sola vez.
    if (window.matchMedia("(hover: hover) and (min-width: 64rem)").matches) {
      entradaHechaRef.current = true;
      return;
    }
    const observadores: IntersectionObserver[] = [];
    /**
     * Corre `animar` una vez, cuando `el` entra a la pantalla dejando
     * `margen` (fracción del alto) por debajo. Con IntersectionObserver y no
     * con ScrollTrigger: sus posiciones se miden al crearlo, y acá arriba hay
     * escenas que cambian de alto después (las pistas de celular), así que el
     * disparo caía cuando la pila todavía no estaba a la vista. Y la
     * animación se CREA dos cuadros después, no se suelta una en pausa: con
     * el `lagSmoothing(0)` de Lenis, un tween que arranca con el reloj de
     * GSAP dormido salta derecho al final.
     */
    const alVer = (el: Element, margen: number, animar: () => void) => {
      const o = new IntersectionObserver(
        ([entrada]) => {
          if (!entrada?.isIntersecting) return;
          o.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(() => ctx.add(animar)));
        },
        { rootMargin: `0px 0px -${Math.round(margen * 100)}% 0px` },
      );
      o.observe(el);
      observadores.push(o);
    };
    const ctx = gsap.context(() => {
      // El título llega un poco más grande y se achica a su lugar, y las
      // carpetas se apilan de a una desde abajo, en orden: 01 apoya, 02
      // encima, 03, 04 —alguien armando la pila sobre el escritorio, como
      // en la escena de desktop (coreografia-indice.ts)—. Antes caían desde
      // arriba con giro y rebote, la última primero; a Gastón (2026-10-02)
      // no le cerró. Arranca cuando la pila asoma, no la sección: con el
      // título arriba, las carpetas empezaban a apilarse fuera de pantalla.
      const pila = section.querySelector("[data-casos-pila]") ?? section;
      const titulo = section.querySelector("[data-casos-titulo]");
      gsap.set(titulo, { scale: 1.14, transformOrigin: "0% 60%" });
      gsap.set("[data-carpeta-item]", { autoAlpha: 0, y: 44 });
      alVer(titulo ?? section, 0.34, () =>
        gsap.to(titulo, { scale: 1, duration: 0.9, ease: "power3.out", clearProps: "transform" }),
      );
      alVer(pila, 0.18, () =>
        gsap.to("[data-carpeta-item]", {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.13,
          clearProps: "opacity,visibility,transform",
          onComplete: () => {
            entradaHechaRef.current = true;
          },
        }),
      );
    }, section);
    // Cleanup SIN revert una vez que el archivo ya se mostró: este efecto
    // se limpia justo cuando setActivo(i) monta el expediente, y un
    // ctx.revert() ahí restauraría el estado pre-entrada de TODAS las
    // bandas (resucitando en pleno morph las que la apertura escondió).
    return () => {
      observadores.forEach((o) => o.disconnect());
      if (entradaHechaRef.current) ctx.kill();
      else ctx.revert();
    };
  }, [reduced, activo]);
}
