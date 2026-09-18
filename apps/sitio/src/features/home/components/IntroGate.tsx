"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LogotipoEDInline } from "@/components/brand/LogotipoEDInline";
import { MathField } from "@/components/ui/MathField";
import { markEntered, markRevealed } from "@/lib/intro-signal";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Gate de entrada cinematográfico a la experiencia ED. Sobre navy con campo
 * de nodos vivo: el logo entra enfocándose (blur→nítido) y se "construye"
 * (stroke-draw + faro + letras, vía LogotipoEDInline) sobre un halo verde que
 * late; al terminar, un destello estalla (el faro "enciende"). Aparecen la
 * marca y el CTA "Comenzá la experiencia". Al click, zoom-through: el logo
 * escala y nos atraviesa revelando el Inicio. Bloquea el scroll mientras
 * está. Respeta prefers-reduced-motion.
 */
export function IntroGate() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useLockScroll(!done);

  useEffect(() => {
    if (done || reduced) return;
    const scope = overlayRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      // Enfoque de entrada del logo (mientras se auto-construye por dentro)
      gsap.fromTo(
        "[data-intro-logo]",
        { opacity: 0, scale: 0.78, filter: "blur(14px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.1, ease: "expo.out" },
      );

      // Halo verde que late
      gsap.to("[data-intro-halo]", {
        scale: 1.18,
        opacity: 0.85,
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Destello: el faro "enciende" al terminar de construirse el logo
      gsap.fromTo(
        "[data-intro-flash]",
        { opacity: 0, scale: 0.2 },
        {
          opacity: 1,
          scale: 2.6,
          duration: 0.5,
          ease: "power2.out",
          delay: 2.0,
          onComplete: () => gsap.to("[data-intro-flash]", { opacity: 0, duration: 0.7 }),
        },
      );

      // Marca + rótulo + CTA
      gsap.from("[data-intro-reveal]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.13,
        delay: 2.25,
      });
    }, scope);

    return () => ctx.revert();
  }, [done, reduced]);

  const handleStart = () => {
    const overlay = overlayRef.current;
    const stage = stageRef.current;
    if (!overlay || !stage || reduced) {
      markEntered();
      markRevealed();
      setDone(true);
      return;
    }
    gsap
      .timeline({
        onComplete: () => {
          markRevealed();
          setDone(true);
        },
      })
      // pequeño flash de salida
      .to("[data-intro-flash]", { opacity: 1, scale: 1.4, duration: 0.25, ease: "power2.out" }, 0)
      .to("[data-intro-reveal]", { opacity: 0, y: -14, duration: 0.35, ease: "power2.in", stagger: 0.04 }, 0)
      // anticipación: el logo retrocede apenas
      .to(stage, { scale: 0.92, duration: 0.45, ease: "power2.in" }, 0.05)
      // el Hero empieza a entrar en el mismo instante en que arranca el zoom
      .add(markEntered, 0.55)
      // zoom-through: escala fuerte + fade → nos atraviesa y revela el Inicio
      .to(
        stage,
        { scale: 9, duration: 1.0, ease: "power3.in" },
        0.5,
      )
      .to(overlay, { opacity: 0, duration: 0.7, ease: "power2.in" }, 0.8);
  };

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="bg-azul-principal bg-grain fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-6 text-center text-white"
    >
      {/* Campo de nodos vivo de fondo */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70" aria-hidden="true">
        <MathField className="h-full w-full" />
      </div>

      {/* Stage que hace el zoom-through */}
      <div
        ref={stageRef}
        className="relative z-10 flex flex-col items-center"
        style={{ transformOrigin: "50% 42%" }}
      >
        {/* Halo verde que late detrás del logo */}
        <span
          data-intro-halo
          aria-hidden="true"
          className="pointer-events-none absolute top-[18%] left-1/2 z-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(31 154 120 / 0.4) 0%, transparent 70%)" }}
        />
        {/* Destello (encendido del faro) */}
        <span
          data-intro-flash
          aria-hidden="true"
          className="pointer-events-none absolute top-[22%] left-1/2 z-20 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full opacity-0 blur-2xl"
          style={{ background: "radial-gradient(circle, rgb(245 245 240 / 0.9) 0%, rgb(224 122 47 / 0.5) 35%, transparent 70%)" }}
        />

        <div data-intro-logo className="relative z-10">
          <LogotipoEDInline variant="negativo" animate className="mx-auto h-32 w-auto md:h-40" />
        </div>

        <h2 data-intro-reveal className="font-display relative z-10 mt-8 text-2xl font-bold tracking-tight md:text-3xl">
          Empoderamiento Docente
        </h2>
        <p data-intro-reveal className="font-mono text-azul-claro/80 relative z-10 mt-2 text-[0.72rem] tracking-[0.24em] uppercase">
          Consultora en educación matemática
        </p>

        <button
          data-intro-reveal
          type="button"
          onClick={handleStart}
          className="bg-naranja-accion relative z-10 mt-10 inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 font-sans text-[0.95rem] font-semibold text-white shadow-lg shadow-black/25 transition-transform duration-300 hover:scale-[1.05]"
        >
          Comenzá la experiencia
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
