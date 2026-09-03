"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { ArrowRight } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { getLenis } from "@/lib/lenis";
import { fotoDe, TIER_ROTULO, type Persona } from "@/features/quienes-somos/data/equipo";
import { ImmersiveProfile } from "@/features/quienes-somos/components/profile/ImmersiveProfile";

/**
 * TeamProfileOverlay — shell de perfil a pantalla completa, portaleado a body.
 *
 * Resuelve el fixed contra el viewport real (el modal anterior se rompía dentro
 * de una <section> transformada con overflow-clip). Aporta, para TODA persona:
 * portal · lock de scroll · foco atrapado y restaurado a la card · header tapado
 * · fondo marfil · apertura/cierre.
 *
 * Dos modos según los datos:
 *   · SHELL (Parte 1) — sin `persona.profile`: foto + nombre + rol + país. Base
 *     validada para las 11 personas sin recorrido desarrollado. FLIP-lite desde
 *     la card.
 *   · INMERSIVO (Parte 2) — con `persona.profile`: el root se vuelve el scroller
 *     (`data-profile-scroller`, `data-lenis-prevent` para no pelear con Lenis) y
 *     renderiza <ImmersiveProfile>, que trae su propia narrativa y coreografía.
 */

export function TeamProfileOverlay({
  persona,
  originEl,
  onClose,
}: {
  persona: Persona;
  originEl: HTMLElement | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const immersive = !!persona.profile;
  // La coreografía inmersiva es desktop-only: su columna de identidad (el h2
  // real con nombre y rol) vive en un layer fijo `hidden lg:block`. Por debajo
  // de 64rem —incluye un desktop con zoom al 200%, WCAG 1.4.10— servimos la
  // variante lineal, que trae su propio h2 y todo el contenido en flujo.
  const desktopChoreo = useMediaQuery("(min-width: 64rem)");
  const staticProfile = reduced || !desktopChoreo;
  const [container] = useState<HTMLDivElement | null>(() =>
    typeof document !== "undefined" ? document.createElement("div") : null,
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const closingRef = useRef(false);

  useLockScroll(true);

  // ── Portal + inert + ENTRADA, todo en FASE DE LAYOUT ────────────────────
  // Adjuntamos el container al document EN FASE DE LAYOUT y ANTES de medir o
  // enfocar. Si viviera en un useEffect pasivo, el hero mediría 0 (FLIP → fade)
  // y focus() sobre un botón desconectado sería no-op (foco perdido).
  useIsomorphicLayoutEffect(() => {
    if (!container) return;
    // Congelar el smooth scroll de la página y recordar el punto EXACTO: al
    // cerrar, Lenis + ScrollTrigger.refresh() recalculan con alturas
    // transitorias y sin esto la página "deriva" hacia otra sección.
    const savedY = window.scrollY;
    getLenis()?.stop();
    container.setAttribute("data-team-portal", "");
    document.body.appendChild(container);
    const siblings = Array.from(document.body.children).filter((c) => c !== container) as HTMLElement[];
    siblings.forEach((s) => {
      s.setAttribute("aria-hidden", "true");
      s.setAttribute("inert", "");
    });

    // Root VISIBLE antes de enfocar: `invisible` (visibility:hidden) impide foco.
    const root = rootRef.current;
    if (root) gsap.set(root, { autoAlpha: 1 });
    backRef.current?.focus();

    let ctx: gsap.Context | undefined;
    if (root && !reduced) {
      ctx = gsap.context(() => {
        // INMERSIVO: la card ES el origen físico — el panel blanco se expande
        // desde su rectángulo (clip-path) mientras figura y nombre FLIPean
        // (eso lo coreografía ImmersiveProfile). Sin flash ni corte de pantalla.
        if (immersive) {
          const from = originEl?.getBoundingClientRect();
          const backdrop = backdropRef.current;
          if (backdrop && from && from.width > 0) {
            gsap.fromTo(
              backdrop,
              {
                clipPath: `inset(${from.top}px ${window.innerWidth - from.right}px ${window.innerHeight - from.bottom}px ${from.left}px round 1.5rem)`,
              },
              {
                clipPath: "inset(0px 0px 0px 0px round 0rem)",
                duration: 0.8,
                ease: "power3.inOut",
                onComplete: () => gsap.set(backdrop, { clearProps: "clipPath" }),
              },
            );
          } else {
            gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
          }
          gsap.fromTo(
            backRef.current,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.55, ease: "power2.out" },
          );
          return;
        }

        gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });

        // El FLIP-lite del hero es exclusivo del SHELL (el inmersivo trae su
        // propia entrada de figura recortada).
        if (!immersive) {
          const hero = heroRef.current;
          const originImg = originEl?.querySelector("img");
          if (hero && originImg) {
            const from = originImg.getBoundingClientRect();
            const to = hero.getBoundingClientRect();
            if (from.width > 0 && to.width > 0) {
              gsap.fromTo(
                hero,
                {
                  x: from.left - to.left,
                  y: from.top - to.top,
                  scaleX: from.width / to.width,
                  scaleY: from.height / to.height,
                  transformOrigin: "top left",
                },
                { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "power3.inOut" },
              );
            } else {
              gsap.fromTo(hero, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" });
            }
          }
          gsap.fromTo(
            contentRef.current,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power3.out" },
          );
        }
      }, root);
    } else if (root && reduced) {
      gsap.set(root, { autoAlpha: 1 });
    }

    return () => {
      ctx?.revert();
      siblings.forEach((s) => {
        s.removeAttribute("aria-hidden");
        s.removeAttribute("inert");
      });
      if (container.parentNode) container.parentNode.removeChild(container);
      // Restaurar foco a la card DESPUÉS de quitar inert (un elemento inert no
      // puede recibir foco). preventScroll conserva el punto de scroll.
      originEl?.focus?.({ preventScroll: true });
      // Restauración DETERMINÍSTICA del scroll: sync inmediato de ventana y
      // Lenis al punto guardado, y re-aserciones tras los refresh async
      // (ResizeObserver del provider → lenis.resize + ScrollTrigger.refresh)
      // que antes hacían derivar la página hacia la sección anterior.
      window.scrollTo(0, savedY);
      const lenis = getLenis();
      lenis?.scrollTo(savedY, { immediate: true, force: true });
      lenis?.start();
      const reassert = () => {
        if (Math.abs(window.scrollY - savedY) <= 1) return;
        window.scrollTo(0, savedY);
        getLenis()?.scrollTo(savedY, { immediate: true, force: true });
      };
      requestAnimationFrame(() => {
        reassert();
        requestAnimationFrame(reassert);
      });
      window.setTimeout(reassert, 180);
    };
  }, [container, originEl, reduced, immersive]);

  // ── Cierre ───────────────────────────────────────────────────────────────
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const finish = () => onClose();
    if (reduced || !rootRef.current) {
      finish();
      return;
    }
    if (immersive) {
      // El scroller no puede animar FLIP de card; salida por fade.
      gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.32, ease: "power2.in", onComplete: finish });
      return;
    }
    const hero = heroRef.current;
    const originImg = originEl?.querySelector("img");
    const tl = gsap.timeline({ onComplete: finish });
    if (hero && originImg) {
      const from = originImg.getBoundingClientRect();
      const to = hero.getBoundingClientRect();
      if (from.width > 0 && to.width > 0) {
        tl.to(hero, {
          x: from.left - to.left,
          y: from.top - to.top,
          scaleX: from.width / to.width,
          scaleY: from.height / to.height,
          duration: 0.5,
          ease: "power3.inOut",
        }, 0);
      }
    }
    tl.to(contentRef.current, { autoAlpha: 0, y: 12, duration: 0.28, ease: "power2.in" }, 0);
    tl.to(backdropRef.current, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 0.05);
  }, [originEl, onClose, reduced, immersive]);

  // ── Teclado: ESC cierra · Tab atrapado ─────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key === "Tab" && rootRef.current) {
        // Solo focusables REALMENTE enfocables (visibles): en el inmersivo el
        // botón de cierre puede estar aún oculto por el revelado; si lo dejáramos
        // como `last`, el navegador lo saltearía y el foco escaparía del diálogo.
        const focusables = Array.from(
          rootRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  if (!container) return null;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${persona.profile?.fullName ?? persona.nombre}`}
      data-profile-scroller={immersive ? "" : undefined}
      data-lenis-prevent={immersive ? "" : undefined}
      className={
        immersive
          ? "invisible fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto overscroll-contain"
          : "invisible fixed inset-0 z-[100]"
      }
    >
      {/* Lienzo claro (nunca negro) — fijo al viewport. En el inmersivo es
          BLANCO y limpio (el patrón de marca vive localizado dentro del hero
          y el cierre, no en toda la experiencia); en el shell, marfil + patrón. */}
      <div ref={backdropRef} className={immersive ? "fixed inset-0 bg-white" : "bg-gris-fondo fixed inset-0"} />
      {!immersive && (
        <div aria-hidden="true" className="pattern-dots pointer-events-none fixed inset-0 opacity-[0.35]" />
      )}

      {/* Volver al equipo — fijo (persiste durante el scroll del inmersivo) */}
      <button
        ref={backRef}
        type="button"
        onClick={requestClose}
        className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto focus-visible:outline-verde-concepto fixed top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2.5 font-sans text-[0.9rem] font-medium backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:top-8 md:left-8"
      >
        <ArrowRight size={16} className="rotate-180" />
        Volver al equipo
      </button>

      {immersive ? (
        <ImmersiveProfile
          profile={persona.profile!}
          reduced={staticProfile}
          originEl={originEl}
          onClose={requestClose}
        />
      ) : (
        <div className="relative z-[1] mx-auto flex h-full max-w-screen-xl items-center px-6 md:px-12">
          <div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
            <div
              ref={heroRef}
              className="relative mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden rounded-[1.8rem] shadow-[0_40px_100px_-40px_rgb(31_45_77/0.5)] ring-1 ring-black/5 will-change-transform"
            >
              {/* Quien pidió no publicar retrato lleva la misma superficie
                  tipográfica que en su card, no un hueco (ver Persona.sinFoto). */}
              {persona.sinFoto ? (
                <span aria-hidden="true" className="bg-gris-fondo absolute inset-0 block">
                  <span className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
                  <span className="font-display text-azul-principal/12 absolute inset-0 flex items-center justify-center text-[7rem] font-extrabold tracking-[-0.04em] select-none">
                    {persona.nombre
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                </span>
              ) : (
                <Image
                  src={fotoDe(persona.key)}
                  alt={persona.nombre}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  style={{ objectPosition: persona.imagePosition }}
                  priority
                  className="object-cover"
                />
              )}
            </div>

            <div ref={contentRef}>
              <span className="text-verde-concepto font-mono text-[0.72rem] font-medium tracking-[0.22em] uppercase">
                {TIER_ROTULO[persona.tier]}
              </span>
              <h2
                className="font-display text-azul-principal mt-3 font-bold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.2rem, 1.4rem + 2.4vw, 3.4rem)", lineHeight: 1.05 }}
              >
                {persona.nombre}
              </h2>
              <p className="text-azul-medio mt-3 font-sans text-[1.05rem] font-medium">{persona.rol}</p>
              <p className="text-gris-texto mt-1 font-mono text-[0.78rem] tracking-[0.16em] uppercase">{persona.pais}</p>

              <div aria-hidden="true" className="border-azul-principal/10 mt-8 max-w-[16rem] border-t" />
            </div>
          </div>
        </div>
      )}
    </div>,
    container,
  );
}
