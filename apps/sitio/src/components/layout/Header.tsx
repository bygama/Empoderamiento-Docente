"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DatosDelSitio } from "@/config/datos-del-sitio";
import { NAV_LINKS, CTA_LINK, HOME_LINK, esPaginaActiva } from "@/config/nav";
import { NavDropdown } from "./NavDropdown";
import { crearIntroSegunAncho } from "./header/coreografia-intro";
import { crearTemaSegunFondo } from "./header/tema-fondo";
import { useSeccionActiva } from "@/lib/hooks/useSeccionActiva";
import { EVENTO_URL, alClicSubirEnPagina, partirDestino } from "@/lib/navegar";
import { MobileNav } from "./MobileNav";
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
 *  - Queda siempre a la vista, también al bajar (pedido de ED, 2026-09-30):
 *    antes se escondía con el scroll y un salto a una sección la dejaba afuera.
 *
 * Adaptación a ED (invisible, igual que el Header anterior): la intro se dispara
 * por `onReveal`, no en el mount. Eso venía de cuando había un portón de entrada
 * (IntroGate, borrado el 2026-09-18): su zoom tapaba esta animación corta si
 * arrancaban juntas. Hoy `onReveal` corre de inmediato, así que es lo mismo que
 * el mount, y la rama de espera queda por si algún día vuelve un gate. Con
 * reduced-motion el JSX ya muestra el estado ABIERTO (final).
 *
 * `sitio` es lo que el menú del celular muestra al pie (el correo y las redes),
 * de Ajustes › Datos del sitio: lo lee el layout.
 */

export function Header({ sitio }: { sitio: Pick<DatosDelSitio, "correo" | "redes"> }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  // El intro coreografiado del navbar (wordmark que se sostiene y colapsa a los
  // links) está temporizado al hero grande del INICIO. En páginas internas el
  // hero es más rápido, así que ese hold largo llega tarde y desfasado: ahí el
  // navbar arranca ya ABIERTO (el JSX por defecto es el estado abierto), sin
  // replay del intro. El intro es un momento de bienvenida del Inicio.
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Submenús: un solo menú abierto a la vez. El activo de nivel 2 (la
  // sección donde se está) sale de la misma regla que el índice lateral,
  // medida sobre los destinos de la página actual; `search` es para los
  // destinos con query (Biblioteca `?tipo=`).
  const [abierto, setAbierto] = useState<string | null>(null);
  const destinosAca = useMemo(() => {
    const actual = NAV_LINKS.find((l) => esPaginaActiva(pathname, l.href));
    // flatMap y no map().filter(Boolean): una sola pasada, sin el array
    // intermedio que después hay que recorrer de nuevo.
    const ids = (actual?.submenu ?? []).flatMap((s) => {
      const { hash } = partirDestino(s.href);
      return hash ? [hash] : [];
    });
    return Array.from(new Set(ids));
  }, [pathname]);
  const seccionActiva = useSeccionActiva(destinosAca);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const leer = () => setSearch(window.location.search);
    leer();
    window.addEventListener(EVENTO_URL, leer);
    window.addEventListener("popstate", leer);
    return () => {
      window.removeEventListener(EVENTO_URL, leer);
      window.removeEventListener("popstate", leer);
    };
  }, [pathname]);
  // Cerrar el menú abierto al cambiar de página (ajuste en render contra el
  // valor previo, patrón de React; no en un efecto) y al scrollear.
  const [rutaPrevia, setRutaPrevia] = useState(pathname);
  if (pathname !== rutaPrevia) {
    setRutaPrevia(pathname);
    setAbierto(null);
  }
  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(null);
    window.addEventListener("scroll", cerrar, { passive: true });
    return () => window.removeEventListener("scroll", cerrar);
  }, [abierto]);

  useIsomorphicLayoutEffect(() => {
    const nav = ref.current;
    if (!nav || reducedMotion || !isHome) return;
    return crearIntroSegunAncho(nav);
  }, [reducedMotion]);

  // El logo suelto (< lg) pasa a negativo sobre fondos oscuros: quién mide y
  // cómo, en `header/tema-fondo.ts`. Se rearma por página: cambia el fondo.
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    return crearTemaSegunFondo(nav);
  }, [pathname]);

  return (
    <nav
      ref={ref}
      data-bp-nav
      // El tope suma lo que el navegador tape por arriba (VisorVisual): así el
      // logo y el menú quedan siempre a la vista.
      // La píldora es de escritorio (todo lo `lg:`). Por debajo de lg el nav es
      // solo el renglón: el logo va suelto y el botón es una isla (MobileNav).
      className="group/nav lg:border-azul-principal/10 fixed top-[calc(1rem+var(--visor-arriba,0px))] right-4 left-4 z-50 flex items-center justify-between gap-3 lg:right-auto lg:left-1/2 lg:w-max lg:max-w-[calc(100vw-2rem)] lg:-translate-x-1/2 lg:justify-start lg:rounded-[1.25rem] lg:border lg:bg-white/70 lg:px-4 lg:py-3 lg:backdrop-blur-xl"
    >
      {/* Grupo logo + wordmark. El wordmark colapsa (width + marginLeft → 0) sin
          dejar gap residual: la separación con los links la da el gap-3 del nav. */}
      {/* En el Inicio, un Link a "/" no navegaría: pasa a subir al hero. */}
      <Link
        href={HOME_LINK.href}
        onClick={alClicSubirEnPagina(isHome)}
        aria-label="Empoderamiento Docente — Inicio"
        data-nav-marca
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
          data-nav-logo
          className="h-11 w-auto shrink-0 transition-opacity duration-300 max-lg:group-data-[tema=noche]/nav:opacity-0"
        />
        {/* El mismo logo en negativo, encimado: sobre un fondo oscuro se funde
            con el azul (< lg; en escritorio el logo vive adentro de la píldora
            clara y no cambia). Decorativo: el nombre ya lo dice el de arriba. */}
        <Image
          src="/brand/logotipo-principal-ed-negativo.png"
          alt=""
          aria-hidden="true"
          width={425}
          height={467}
          unoptimized
          className="pointer-events-none absolute h-11 w-auto opacity-0 transition-opacity duration-300 max-lg:group-data-[tema=noche]/nav:opacity-100 lg:hidden"
        />
        {/* Wordmark que se colapsa. Aparece también en mobile (navbar full-width):
            arranca visible "Empoderamiento Docente" y, tras el hold, colapsa —
            misma coreografía que en desktop. Font un poco menor en mobile para
            que entre junto al logo + hamburguesa en pantallas chicas, y un punto
            menos por debajo de 380px: ahí la marca centrada del intro (ver
            header/intro-marca-movil.ts) no entraba sin tocar el botón. */}
        <span
          data-nav-word
          className="font-display overflow-hidden text-[0.95rem] font-extrabold max-[379px]:text-[0.85rem] tracking-tight whitespace-nowrap transition-colors duration-300 max-lg:group-data-[tema=noche]/nav:text-white lg:text-[1.05rem]"
          style={{ width: 0, opacity: 0 }}
        >
          {/* Capa interna: en el intro mobile el nombre se DESTAPA corriéndose
              adentro del recorte de su padre (solo transform). */}
          <span data-nav-word-in className="inline-block">
            Empoderamiento&nbsp;Docente
          </span>
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
            <NavDropdown
              key={link.href}
              item={link}
              pathname={pathname}
              seccionActiva={seccionActiva}
              search={search}
              abierto={abierto === link.href}
              onAbrir={() => setAbierto(link.href)}
              onCerrar={() => setAbierto((a) => (a === link.href ? null : a))}
            />
          ))}
        </ul>
        <Link
          href={CTA_LINK.href}
          onClick={alClicSubirEnPagina(pathname === CTA_LINK.href)}
          data-nav-item
          className="bg-naranja-accion rounded-xl px-5 py-2.5 font-sans text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {CTA_LINK.label}
        </Link>
      </div>

      {/* Navegación mobile (< lg): hamburguesa + panel a pantalla completa. */}
      <MobileNav sitio={sitio} />
    </nav>
  );
}
