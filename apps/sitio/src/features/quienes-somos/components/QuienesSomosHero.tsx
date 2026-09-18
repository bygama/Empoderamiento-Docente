"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MathField } from "@/components/ui/MathField";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { alClicIrA } from "@/lib/navegar";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hero de "Quiénes somos" — estilo EDITORIAL: titular GIGANTE alineado a la
 * izquierda A ANCHO TOTAL (sin el container del sitio; solo padding), sobre el
 * fondo de nodos del Inicio (MathField). El hero NO llega a 100vh: deja ASOMAR
 * un poco la sección siguiente (el navy de Origen), que invita a seguir — por
 * eso ya no hace falta un "scrolleá para explorar" explícito.
 *
 * La VUELTA DE TUERCA es el propio titular: una antítesis en primera persona
 * que es la identidad de ED (que NO "capacita": acompaña, diseña, transforma).
 *   1 · "No capacitamos."  se rellena en NAVY (el planteo).
 *   2 · "Transformamos."   se rellena DESPUÉS y queda en VERDE (el concepto,
 *       el giro) — verde para conceptos, según DESIGN.md.
 * El relleno se hace con background-clip:text sobre un gradiente cuya posición
 * anima (arranca gris tenue y un frente de color barre de izq a der). La bajada
 * sube con un fade al final.
 *
 * Sin motion / prefers-reduced-motion: los dos titulares quedan en su color
 * final (navy y verde) y todo visible. Copy oficial [[ed-copy-oficial]].
 */

// Gradientes del relleno (gris sin rellenar → color final, con un frente que
// barre). Línea 1 resuelve en navy; línea 2 resuelve en verde (el concepto).
const FILL_NAVY =
  "linear-gradient(100deg, #1f2d4d 0%, #1f2d4d 35%, #1f9a78 43%, #c5ccd6 52%, #c5ccd6 100%)";
const FILL_VERDE =
  "linear-gradient(100deg, #1f9a78 0%, #1f9a78 35%, #1f2d4d 43%, #c5ccd6 52%, #c5ccd6 100%)";

const clipStyle = (gradient: string) =>
  ({
    backgroundImage: gradient,
    backgroundSize: "250% 100%",
    backgroundPosition: "0% 0",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  }) as const;

export function QuienesSomosHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const line1 = root.querySelector<HTMLElement>("[data-title-1]");
      const line2 = root.querySelector<HTMLElement>("[data-title-2]");
      const foot = gsap.utils.toArray<HTMLElement>("[data-hero-foot]");
      if (!line1 || !line2) return;

      // ── Estado inicial ───────────────────────────────────────────────────
      gsap.set(foot, { autoAlpha: 0, y: 20 });

      // ── El titular se RELLENA en dos tiempos (el giro) ───────────────────
      const tl = gsap.timeline({ delay: 0.3 });
      // 1 — "No capacitamos." (planteo, resuelve navy)
      tl.fromTo(
        line1,
        { backgroundPosition: "100% 0" },
        { backgroundPosition: "0% 0", duration: 1.1, ease: "power2.inOut" },
        0,
      );
      // 2 — "Transformamos." (el giro, resuelve verde) — entra después, y al
      //     asentarse da un pop sutil que remata la vuelta de tuerca.
      tl.fromTo(
        line2,
        { backgroundPosition: "100% 0" },
        { backgroundPosition: "0% 0", duration: 1.1, ease: "power2.inOut" },
        0.5,
      ).to(
        line2,
        {
          keyframes: [
            { scale: 1.03, duration: 0.2, ease: "power2.out" },
            { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" },
          ],
          transformOrigin: "0% 50%",
        },
        "-=0.15",
      );

      // La bajada sube SINCRONIZADA con el segundo renglón: arranca mientras
      // "Transformamos." se rellena, así el clímax del título (verde + pop) y la
      // aparición de la bajada aterrizan juntos — un solo gesto, no dos tiempos.
      tl.to(
        foot,
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.95,
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-[87svh] flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-white to-gris-fondo/40 px-6 pt-40 pb-12 md:px-12 md:pt-48 md:pb-16"
      aria-label="Quiénes somos — Empoderamiento Docente"
    >
      {/* Fondo de nodos de marca (el mismo del Inicio), detrás de todo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <MathField className="h-full w-full" />
      </div>

      {/* ── Titular gigante (arriba, a la izquierda) — la antítesis ───────── */}
      <h1
        className="font-display relative z-10 max-w-[16ch] font-extrabold tracking-[-0.025em]"
        style={{ fontSize: "clamp(2.4rem, 0.5rem + 9vw, 8.5rem)", lineHeight: 0.96 }}
      >
        <span className="sr-only">No capacitamos. Transformamos.</span>
        <span aria-hidden="true" className="block">
          <span data-title-1 className="block" style={clipStyle(FILL_NAVY)}>
            No capacitamos.
          </span>
          <span data-title-2 className="block" style={clipStyle(FILL_VERDE)}>
            Transformamos.
          </span>
        </span>
      </h1>

      {/* ── Pie: bajada de identidad (abajo, a la derecha) ───────────────── */}
      <div className="relative z-10 flex flex-col items-start gap-6 md:items-end">
        <p
          data-hero-foot
          className="text-azul-principal max-w-[42ch] font-sans text-[1.05rem] leading-relaxed font-medium [text-wrap:balance] md:max-w-[62ch] md:text-right md:text-[1.2rem]"
        >
          Somos investigación, diseño y acompañamiento: un proceso colectivo que
          cambia la relación con el saber matemático escolar.
        </p>
        {/* Atajo a la sección que más se vuelve a buscar (decisión de ED,
            2026-09-08): mismas palabras que el submenú y el título de la
            sección, y corta directo como el navbar (la sección está al final,
            después de dos escenas largas). Secundario: el naranja es para
            Contacto. Entra con la bajada (data-hero-foot). */}
        <div data-hero-foot>
          <ButtonSecondary href="#equipo" onClick={alClicIrA("equipo")}>
            Quiénes sostienen ED
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
}
