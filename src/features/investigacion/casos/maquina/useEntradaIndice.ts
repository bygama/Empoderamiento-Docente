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
    const ctx = gsap.context(() => {
      // Entrada tipo cajón: las carpetas caen desde arriba y se asientan
      // una sobre otra, la del fondo primero (from: "end").
      gsap.fromTo(
        "[data-carpeta-item]",
        { autoAlpha: 0, y: -64, rotate: -1 },
        {
          autoAlpha: 1,
          y: 0,
          rotate: 0,
          duration: 0.75,
          ease: "back.out(1.05)",
          stagger: { each: 0.14, from: "end" },
          clearProps: "opacity,visibility,transform",
          onComplete: () => {
            entradaHechaRef.current = true;
          },
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        },
      );
    }, section);
    // Cleanup SIN revert una vez que el archivo ya se mostró: este efecto
    // se limpia justo cuando setActivo(i) monta el expediente, y un
    // ctx.revert() ahí restauraría el estado pre-entrada de TODAS las
    // bandas (resucitando en pleno morph las que la apertura escondió).
    return () => {
      if (entradaHechaRef.current) ctx.kill();
      else ctx.revert();
    };
  }, [reduced, activo]);
}
