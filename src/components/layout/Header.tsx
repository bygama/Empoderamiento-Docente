"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { NAV_LINKS, CTA_LINK, HOME_LINK } from "@/config/nav";
import { MobileNav } from "./MobileNav";
import { hasRevealed, onReveal } from "@/lib/intro-signal";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Navbar Blueprint — réplica 1:1 del navbar del hero "Blueprint" de la rama
 * `nuevo-frontend`. Es una PÍLDORA flotante centrada (white/70 + backdrop-blur):
 *  - Logo (PNG transparente del cliente) + wordmark "Empoderamiento Docente".
 *  - Intro coreografiada: arranca CERRADO (logo + wordmark) y MORFEA a ABIERTO
 *    — el wordmark se ve un RATITO fijo, después colapsa y entran los links +
 *    el CTA naranja con slide + fade escalonado. Pasa igual aunque cargues la
 *    página scrolleada (sin depender de estar parado en el hero).
 *  - Links + CTA en Inter Medium (font-sans, por manual de marca §2: UI/botones);
 *    CTA "Contacto" naranja (único acento de acción).
 *
 * Adaptación a ED (invisible, igual que el Header anterior): la intro se dispara
 * cuando el IntroGate TERMINA (`onReveal`), no en el mount — si no, su animación
 * corta queda tapada por el zoom-through del gate. Sin gate o con reduced-motion,
 * el JSX por defecto ya muestra el estado ABIERTO (final). Respeta prefers-reduced-motion.
 */
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

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  // El intro coreografiado del navbar (wordmark que se sostiene y colapsa a los
  // links) está temporizado al hero grande del INICIO. En páginas internas el
  // hero es más rápido, así que ese hold largo llega tarde y desfasado: ahí el
  // navbar arranca ya ABIERTO (el JSX por defecto es el estado abierto), sin
  // replay del intro. El intro es un momento de bienvenida del Inicio.
  const isHome = usePathname() === "/";

  useIsomorphicLayoutEffect(() => {
    const nav = ref.current;
    if (!nav || reducedMotion || !isHome) return;
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
  }, [reducedMotion]);

  // Auto-hide: al scrollear hacia abajo la píldora se esconde arriba; al
  // scrollear un poco hacia arriba (o cerca del tope) reaparece. Animamos
  // `top` (no `transform`) para no pisar el -translate-x-1/2 del centrado.
  useEffect(() => {
    const nav = ref.current;
    if (!nav || reducedMotion) return;

    const TOP_SHOWN = 16; // top-4 (1rem) — posición visible
    const TOP_HIDDEN = -120; // fuera de cuadro por arriba
    let lastY = window.scrollY;
    let hidden = false;
    const DELTA = 6; // ignora micro-jitter de scroll
    const TOP_ZONE = 120; // cerca del tope siempre visible

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < DELTA) return;

      const show = () => {
        if (!hidden) return;
        hidden = false;
        gsap.to(nav, { top: TOP_SHOWN, duration: 0.45, ease: "power3.out" });
      };
      const hide = () => {
        if (hidden) return;
        hidden = true;
        gsap.to(nav, { top: TOP_HIDDEN, duration: 0.45, ease: "power3.out" });
      };

      if (y < TOP_ZONE || dy < 0) show();
      else if (dy > 0) hide();
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.set(nav, { clearProps: "top" });
    };
  }, [reducedMotion]);

  return (
    <nav
      ref={ref}
      data-bp-nav
      className="border-azul-principal/10 fixed top-4 right-4 left-4 z-50 flex items-center justify-between gap-3 rounded-[1.25rem] border bg-white/70 px-4 py-3 backdrop-blur-xl lg:right-auto lg:left-1/2 lg:w-max lg:max-w-[calc(100vw-2rem)] lg:-translate-x-1/2 lg:justify-start"
    >
      {/* Grupo logo + wordmark. El wordmark colapsa (width + marginLeft → 0) sin
          dejar gap residual: la separación con los links la da el gap-3 del nav. */}
      <Link
        href={HOME_LINK.href}
        aria-label="Empoderamiento Docente — Inicio"
        className="flex shrink-0 items-center"
      >
        {/* Logo (PNG transparente) tal cual lo pasó el cliente, sin recuadro. */}
        <Image
          src="/brand/logotipo-principal-ed.png"
          alt="Empoderamiento Docente"
          width={425}
          height={467}
          priority
          unoptimized
          className="h-11 w-auto shrink-0"
        />
        {/* Wordmark que se colapsa. Aparece también en mobile (navbar full-width):
            arranca visible "Empoderamiento Docente" y, tras el hold, colapsa —
            misma coreografía que en desktop. Font un poco menor en mobile para
            que entre junto al logo + hamburguesa en pantallas chicas. */}
        <span
          data-nav-word
          className="font-display overflow-hidden text-[0.95rem] font-extrabold tracking-tight whitespace-nowrap lg:text-[1.05rem]"
          style={{ width: 0, opacity: 0 }}
        >
          Empoderamiento&nbsp;Docente
        </span>
      </Link>

      {/* Links + CTA que se abren (solo desktop ≥ lg). Por debajo de lg la
          navegación vive en <MobileNav /> (panel a pantalla completa). */}
      <div
        data-nav-links
        className="hidden items-center gap-1 whitespace-nowrap lg:flex"
      >
        <ul className="text-azul-principal/70 hidden items-center gap-1 pr-2 font-sans text-[14px] font-medium lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href} data-nav-item>
              <Link
                href={link.href}
                className="hover:bg-azul-principal/5 hover:text-azul-principal rounded-lg px-3 py-2 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={CTA_LINK.href}
          data-nav-item
          className="bg-naranja-accion rounded-xl px-5 py-2.5 font-sans text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {CTA_LINK.label}
        </Link>
      </div>

      {/* Navegación mobile (< lg): hamburguesa + panel a pantalla completa. */}
      <MobileNav />
    </nav>
  );
}
