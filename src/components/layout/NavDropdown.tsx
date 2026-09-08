"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "@/components/ui/icons";
import type { NavItem } from "@/config/nav";
import { coincideDestino, irEnPagina, partirDestino } from "@/lib/navegar";

/**
 * Un ítem del navbar de escritorio con su submenú (ver config/nav.ts).
 *
 * Comportamiento:
 * - El RÓTULO SIEMPRE NAVEGA a la página. Nunca es solo "abrir el menú".
 * - Abre con hover, con una demora corta de intención (pasar el mouse por
 *   la píldora no dispara menús) y una gracia al salir (bajar en diagonal
 *   hacia la tarjeta no lo cierra). Un solo menú abierto a la vez lo
 *   garantiza el Header (`abierto` vive ahí).
 * - Teclado: flecha abajo abre y pasa el foco al primer ítem; Escape
 *   cierra; el chevron es un botón real (aria-expanded) para quien navega
 *   con teclado o toca.
 * - Ítems: en la misma página cortan directo (irEnPagina); desde otra página
 *   navega Next con scroll={false} y aterriza AterrizajePorLink. Con
 *   modificadores (nueva pestaña) no se intercepta nada.
 *
 * Active en dos niveles: la página actual marca el rótulo (píldora tenue);
 * dentro del menú, el destino donde se está lleva un punto verde.
 *
 * Diseño: tarjeta chica colgando del BORDE de la píldora (no del botón:
 * si no se superpone con ella), blanco pleno —sin transparencia: con
 * texto encima del hero se filtraba el título de atrás—, una columna,
 * sin kicker (el rótulo de arriba ya dice de qué página es y queda
 * marcado). Opaca pero en gris-fondo, no blanco puro: así sobre páginas
 * claras iguala a la píldora y sobre navy queda un paso más clara, como la
 * hoja que sale de la barra. Entra en 150 ms con CSS (sin GSAP: no compite con la intro
 * del navbar).
 */
const DEMORA_ABRIR = 120;
const GRACIA_CERRAR = 160;

export function NavDropdown({
  item,
  pathname,
  seccionActiva,
  search,
  abierto,
  onAbrir,
  onCerrar,
}: {
  item: NavItem;
  pathname: string;
  seccionActiva: string | null;
  search: string;
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
}) {
  const enPagina = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const submenu = item.submenu ?? [];
  const tiene = submenu.length > 0;
  const menuId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const primerItemRef = useRef<HTMLAnchorElement>(null);
  const abrirTimer = useRef(0);
  const cerrarTimer = useRef(0);
  // Se mantiene montado para animar la salida; `visible` retira el display
  // al terminar, así no queda un menú invisible pero enfocable.
  const [visible, setVisible] = useState(false);
  // Al abrir, visible acompaña en el mismo render (ajuste contra el valor
  // previo); al cerrar, se apaga diferido para dejar terminar la salida.
  if (abierto && !visible) setVisible(true);
  useEffect(() => {
    if (abierto) return;
    const t = window.setTimeout(() => setVisible(false), 160);
    return () => window.clearTimeout(t);
  }, [abierto]);

  useEffect(
    () => () => {
      window.clearTimeout(abrirTimer.current);
      window.clearTimeout(cerrarTimer.current);
    },
    [],
  );

  const pedirAbrir = () => {
    window.clearTimeout(cerrarTimer.current);
    window.clearTimeout(abrirTimer.current);
    abrirTimer.current = window.setTimeout(onAbrir, DEMORA_ABRIR);
  };
  const pedirCerrar = () => {
    window.clearTimeout(abrirTimer.current);
    window.clearTimeout(cerrarTimer.current);
    cerrarTimer.current = window.setTimeout(onCerrar, GRACIA_CERRAR);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!tiene) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onAbrir();
      requestAnimationFrame(() => primerItemRef.current?.focus());
    } else if (e.key === "Escape" && abierto) {
      e.preventDefault();
      onCerrar();
      rootRef.current?.querySelector<HTMLElement>("a")?.focus();
    }
  };

  const onClickItem = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const d = partirDestino(href);
    if (d.pathname !== pathname) return; // navega Next; aterriza el layout
    e.preventDefault();
    onCerrar();
    irEnPagina(href);
  };

  return (
    <li
      ref={rootRef}
      data-nav-item
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && tiene) pedirAbrir();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && tiene) pedirCerrar();
      }}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        // El foco se fue del ítem entero (rótulo, chevron y menú): cerrar.
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) onCerrar();
      }}
    >
      {/* `group`: la flecha despierta con el ítem entero (hover, foco,
          abierto, página actual); en reposo es apenas una insinuación. */}
      <div
        className={`group flex items-center rounded-lg transition-colors ${
          enPagina
            ? "bg-azul-principal/[0.07] text-azul-principal font-semibold"
            : "hover:bg-azul-principal/5 hover:text-azul-principal"
        }`}
      >
        <Link
          href={item.href}
          aria-current={enPagina ? "page" : undefined}
          className={`py-2 pl-3 ${tiene ? "pr-1" : "pr-3"}`}
        >
          {item.label}
        </Link>
        {tiene && (
          <button
            type="button"
            aria-label={`${abierto ? "Cerrar" : "Abrir"} secciones de ${item.label}`}
            aria-expanded={abierto}
            aria-controls={menuId}
            onClick={() => (abierto ? onCerrar() : onAbrir())}
            className={`rounded-md py-2 pr-2 pl-0.5 text-current transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 ${
              abierto || enPagina ? "opacity-100" : "opacity-30"
            }`}
          >
            {/* Gira el ÍCONO sobre su propio centro (el botón tiene padding
                desigual: rotarlo entero lo hacía desplazarse). */}
            <ChevronDown
              size={13}
              strokeWidth={2.4}
              className="transition-transform duration-200 ease-out"
              style={{ transform: abierto ? "rotate(180deg)" : undefined }}
            />
          </button>
        )}
      </div>

      {tiene && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Secciones de ${item.label}`}
          hidden={!visible}
          // top: el borde inferior del botón + el padding de la píldora
          // (py-3) + su borde + 8px de respiro → cuelga de la píldora.
          className={`border-azul-principal/10 absolute top-[calc(100%+0.75rem+1px+0.5rem)] left-0 z-10 min-w-[14rem] rounded-2xl border bg-gris-fondo p-1.5 shadow-[0_24px_60px_-28px_rgb(31_45_77/0.45)] transition-[opacity,transform] duration-150 ease-out ${
            abierto ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
        >
          <ul className="flex flex-col py-1">
            {submenu.map((sub, i) => {
              const aca = enPagina && coincideDestino(sub.href, seccionActiva, search);
              return (
                <li key={sub.href} role="none">
                  <Link
                    ref={i === 0 ? primerItemRef : undefined}
                    role="menuitem"
                    href={sub.href}
                    scroll={false}
                    tabIndex={abierto ? 0 : -1}
                    aria-current={aca ? "location" : undefined}
                    onClick={(e) => onClickItem(e, sub.href)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                      aca
                        ? "text-azul-principal font-medium"
                        : "text-azul-principal/70 hover:bg-azul-principal/5 hover:text-azul-principal"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`bg-verde-concepto h-1.5 w-1.5 shrink-0 rounded-full transition-opacity ${
                        aca ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {sub.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
