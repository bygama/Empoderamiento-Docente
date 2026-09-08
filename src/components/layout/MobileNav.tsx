"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { NAV_LINKS, CTA_LINK, HOME_LINK, esPaginaActiva } from "@/config/nav";
import { irEnPagina, partirDestino } from "@/lib/navegar";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Instagram,
  Linkedin,
  Facebook,
} from "@/components/ui/icons";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useSeccionesPagina } from "@/lib/hooks/useSeccionesPagina";
import { irASeccion } from "@/lib/indice";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { siteConfig } from "@/config/site";

// Redes a mostrar — mismo criterio que el Footer: el href sale de
// siteConfig.redes y, sin handle oficial, el ícono no se muestra.
const REDES = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const satisfies ReadonlyArray<{
  key: keyof typeof siteConfig.redes;
  label: string;
  Icon: typeof Instagram;
}>;

/**
 * Navegación mobile (< lg). Botón hamburguesa dentro de la píldora del Header
 * que abre un panel a pantalla completa con fondo `.faro-glow` (metáfora del
 * faro de marca). Los 5 ítems del sitemap se apilan grandes —mismo lenguaje
 * editorial que el Footer: tipografía display + hairline + flecha ↗— y el CTA
 * "Contacto" queda como acción focal abajo.
 *
 * - El panel se PORTALEA a <body> para escapar del containing-block que crea el
 *   `backdrop-blur` de la píldora: con un ancestro con `backdrop-filter`,
 *   `position:fixed` se ancla a ESE ancestro y no al viewport.
 * - Bloquea el scroll del body mientras está abierto (useLockScroll).
 * - Cierra con la X, Escape, click en un link, o al cambiar de ruta.
 * - Respeta prefers-reduced-motion (sin animación; apertura instantánea).
 */
// Snapshot vacío para useSyncExternalStore: nunca cambia, solo distingue
// servidor (false) de cliente (true) sin disparar setState en un efecto.
const emptySubscribe = () => () => {};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const secciones = useSeccionesPagina();
  // Submenú desplegado (acordeón): el de la página actual arranca abierto.
  const [desplegado, setDesplegado] = useState<string | null>(
    () => NAV_LINKS.find((l) => esPaginaActiva(pathname, l.href))?.href ?? null,
  );

  // true recién en cliente (post-hidratación): el portal a <body> se monta
  // solo entonces. Patrón canónico sin setState-en-efecto ni mismatch.
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Cierra el panel al cambiar de ruta. Ajuste de estado EN RENDER comparando
  // contra el valor previo (patrón recomendado de React), no en un efecto.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
    setDesplegado(NAV_LINKS.find((l) => esPaginaActiva(pathname, l.href))?.href ?? null);
  }

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstFocusRun = useRef(true);

  useLockScroll(open);

  // Escape para cerrar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Timeline de apertura — se arma una vez que el panel existe en el DOM.
  useEffect(() => {
    if (!hydrated) return;
    const panel = panelRef.current;
    if (!panel) return;

    const ctx = gsap.context(() => {
      gsap.set(panel, { autoAlpha: 0 });
      if (reduced) return; // sin timeline: lo maneja el efecto de abajo.

      const items = panel.querySelectorAll("[data-mnav-item]");
      const cta = panel.querySelector("[data-mnav-cta]");
      tlRef.current = gsap
        .timeline({ paused: true })
        .to(panel, { autoAlpha: 1, duration: 0.3, ease: "power2.out" })
        .from(
          items,
          {
            autoAlpha: 0,
            y: 20,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.06,
          },
          "<0.05",
        )
        .from(
          cta,
          { autoAlpha: 0, y: 14, duration: 0.45, ease: "power3.out" },
          "<0.12",
        );
    }, panel);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, [hydrated, reduced]);

  // Play/reverse del panel + manejo de foco al abrir/cerrar.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) {
      if (reduced) {
        gsap.set(panel, { autoAlpha: open ? 1 : 0 });
      } else if (tlRef.current) {
        if (open) tlRef.current.play();
        else tlRef.current.reverse();
      }
    }
    // Foco: al abrir, a la X; al cerrar, de vuelta al botón hamburguesa. Se
    // saltea la PRIMERA corrida (montaje) para no robar el foco al cargar.
    if (firstFocusRun.current) {
      firstFocusRun.current = false;
    } else if (open) {
      closeRef.current?.focus();
    } else {
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [open, reduced]);

  const close = () => setOpen(false);

  // Saltar a una sección de la página actual: cierra el menú y corta
  // directo (ver irASeccion). La espera deja que el body suelte el lock.
  const irA = (id: string) => {
    close();
    window.setTimeout(() => irASeccion(id), 60);
  };
  // Destino de un submenú: en la misma página corta directo (con la
  // misma espera); en otra, navega Next y aterriza el layout.
  const irADestino = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (partirDestino(href).pathname !== pathname) {
      close();
      return;
    }
    e.preventDefault();
    close();
    window.setTimeout(() => irEnPagina(href), 60);
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        data-nav-burger
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(true)}
        className="text-azul-principal hover:bg-azul-principal/5 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl p-2 transition-colors lg:hidden"
      >
        <Menu size={22} />
      </button>

      {hydrated &&
        createPortal(
          <div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            aria-hidden={!open}
            className="faro-glow fixed inset-0 z-[70] flex flex-col overflow-y-auto lg:hidden"
            style={{ visibility: "hidden" }}
          >
            {/* Barra superior: logo (→ Inicio) + cerrar. */}
            <div className="flex items-center justify-between px-5 py-4">
              <Link
                href={HOME_LINK.href}
                aria-label="Empoderamiento Docente — Inicio"
                onClick={close}
                className="inline-flex items-center"
              >
                <Image
                  src="/brand/logotipo-principal-ed.png"
                  alt="Empoderamiento Docente"
                  width={425}
                  height={467}
                  unoptimized
                  className="h-10 w-auto"
                />
              </Link>
              <button
                ref={closeRef}
                type="button"
                aria-label="Cerrar menú"
                onClick={close}
                className="text-azul-principal hover:bg-azul-principal/5 inline-flex items-center justify-center rounded-xl p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navegación grande apilada (eco del Footer). */}
            <nav
              aria-label="Navegación principal"
              className="flex flex-1 flex-col justify-center px-6 sm:px-8"
            >
              <ul>
                {NAV_LINKS.map((link) => {
                  const active = esPaginaActiva(pathname, link.href);
                  const sub = link.submenu ?? [];
                  const abierto = desplegado === link.href;
                  return (
                    <li key={link.href} data-mnav-item className="border-azul-principal/10 border-b">
                      <div className="flex items-center justify-between">
                        <Link
                          href={link.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className="group flex flex-1 items-center justify-between py-4"
                        >
                          <span
                            className={`font-display text-[clamp(1.6rem,1rem+4vw,2.4rem)] font-bold tracking-[-0.01em] transition-colors ${
                              active
                                ? "text-verde-concepto"
                                : "text-azul-principal group-hover:text-verde-concepto"
                            }`}
                          >
                            {link.label}
                          </span>
                          <ArrowUpRight
                            size={22}
                            className={`shrink-0 transition-all duration-300 ${
                              active
                                ? "text-verde-concepto opacity-100"
                                : "text-azul-principal/40 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            }`}
                          />
                        </Link>
                        {sub.length > 0 && (
                          <button
                            type="button"
                            aria-label={`${abierto ? "Ocultar" : "Ver"} secciones de ${link.label}`}
                            aria-expanded={abierto}
                            onClick={() => setDesplegado(abierto ? null : link.href)}
                            className="text-azul-principal/60 hover:text-azul-principal ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform"
                            style={{ transform: abierto ? "rotate(180deg)" : undefined }}
                          >
                            <ChevronDown size={20} />
                          </button>
                        )}
                      </div>
                      {sub.length > 0 && (
                        <ul
                          hidden={!abierto}
                          className="flex flex-wrap gap-2 pb-4"
                        >
                          {sub.map((s) => (
                            <li key={s.href}>
                              <Link
                                href={s.href}
                                scroll={false}
                                onClick={(e) => irADestino(e, s.href)}
                                className="border-azul-principal/15 text-azul-principal hover:border-azul-principal inline-flex min-h-10 items-center rounded-full border px-3.5 font-sans text-[0.9rem] font-medium transition-colors"
                              >
                                {s.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Secciones de la página actual: el atajo para no recorrer
                  todas las escenas hasta llegar a la que se busca. En
                  desktop esto es la columna de marcas del borde derecho
                  (IndicePagina). */}
              {secciones.length >= 2 && (
                <div className="mt-8">
                  <p className="text-gris-texto font-mono text-[0.68rem] font-medium tracking-[0.2em] uppercase">
                    En esta página
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {secciones.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => irA(s.id)}
                          className="border-azul-principal/15 text-azul-principal hover:border-azul-principal inline-flex min-h-10 items-center rounded-full border px-3.5 font-sans text-[0.9rem] font-medium transition-colors"
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </nav>

            {/* Acción focal (Contacto) + mail real. */}
            <div
              data-mnav-cta
              className="flex flex-col gap-5 px-6 pt-4 pb-10 sm:px-8"
            >
              <Link
                href={CTA_LINK.href}
                onClick={close}
                className="bg-naranja-accion inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-medium text-white transition-opacity hover:opacity-90"
              >
                {CTA_LINK.label}
                <ArrowUpRight size={18} />
              </Link>

              {/* Mail de contacto: centrado, justo debajo del CTA. */}
              <a
                href={`mailto:${siteConfig.contacto.email}`}
                className="text-gris-texto hover:text-azul-principal text-center font-mono text-[0.78rem] tracking-wide transition-colors"
              >
                {siteConfig.contacto.email}
              </a>

              {/* Redes sociales — con rótulo y botones circulares (buen target
                  táctil). Solo las que tienen URL confirmada; sin ninguna, la
                  fila entera no se muestra. */}
              {REDES.some(({ key }) => siteConfig.redes[key]) && (
                <div className="border-azul-principal/10 flex items-center justify-between gap-4 border-t pt-5">
                  <span className="text-gris-texto font-mono text-[0.72rem] font-medium tracking-[0.18em] uppercase">
                    Seguinos
                  </span>
                  <ul className="flex items-center gap-2.5">
                    {REDES.map(({ key, label, Icon }) => {
                      const url = siteConfig.redes[key];
                      if (!url) return null;
                      return (
                        <li key={key}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Empoderamiento Docente en ${label}`}
                            className="border-azul-principal/15 text-azul-principal/75 hover:border-azul-principal hover:bg-azul-principal inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:text-white"
                          >
                            <Icon size={20} />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
