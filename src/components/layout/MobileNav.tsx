"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, HOME_LINK, esPaginaActiva } from "@/config/nav";
import { irEnPagina, partirDestino } from "@/lib/navegar";
import { Menu, X } from "@/components/ui/icons";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useSeccionesPagina } from "@/lib/hooks/useSeccionesPagina";
import { irArriba, irASeccion } from "@/lib/indice";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useMenuAnimado } from "./mobile-nav/useMenuAnimado";
import { NavegacionMenu } from "./mobile-nav/NavegacionMenu";
import { PieMenu } from "./mobile-nav/PieMenu";


/**
 * Navegación mobile (< lg). Botón hamburguesa dentro de la píldora del Header
 * que abre un panel a pantalla completa con fondo `.faro-glow` (metáfora del
 * faro de marca). Los 5 ítems del sitemap se apilan grandes —mismo lenguaje
 * editorial que el Footer: tipografía display + hairline + flecha ↗— y el CTA
 * "Contacto" queda como acción focal abajo.
 *
 * - El panel es un `<dialog>` abierto con `showModal()`: el navegador se
 *   encarga del top layer, del `inert` sobre el resto de la página y de
 *   atrapar el Tab, que antes no teníamos.
 * - Se PORTALEA a <body> para escapar del containing-block que crea el
 *   `backdrop-blur` de la píldora: con un ancestro con `backdrop-filter`,
 *   `position:fixed` se ancla a ESE ancestro y no al viewport.
 * - Bloquea el scroll del body mientras está abierto (useLockScroll).
 * - Cierra con la X, Escape (`onCancel`), click en un link, o al cambiar de
 *   ruta; el `close()` real espera a que la timeline termine la reversa.
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

  // Este menú es de < lg: si la ventana cruza a escritorio con el panel
  // abierto, el nav de escritorio ya está a la vista y el panel se quedaría
  // encima —modal, con la página inerte y el scroll trabado—. Se cierra, con
  // el mismo ajuste en render que el cambio de ruta. (En `false` durante el
  // SSR, que es el fallback seguro: no cerrar.)
  const esDesktop = useMediaQuery("(min-width: 64rem)");
  if (esDesktop && open) setOpen(false);

  const panelRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useLockScroll(open);
  useMenuAnimado({ open, reduced, hydrated, panelRef, toggleRef, closeRef });

  const close = () => setOpen(false);

  // Saltar a una sección de la página actual: cierra el menú y desliza
  // (ver irASeccion). La espera deja que el body suelte el lock.
  const irA = (id: string) => {
    close();
    window.setTimeout(() => irASeccion(id), 60);
  };
  // Tocar el nombre de la página en la que ya estamos: cierra y sube al
  // principio deslizando. Misma espera de 60ms que arriba, por el lock.
  const subir = () => {
    close();
    window.setTimeout(irArriba, 60);
  };
  // Destino de un submenú: en la misma página desliza (con la misma
  // espera); en otra, navega Next y aterriza el layout.
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
          <dialog
            id="mobile-nav-panel"
            ref={panelRef}
            aria-label="Menú de navegación"
            // Escape: el navegador dispara `cancel` y cerraría de golpe; se lo
            // frena para que el cierre pase por la reversa de la timeline.
            onCancel={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            // `open:flex` y no `flex`: un `display` fijo le gana a la regla del
            // agente que esconde el dialog cerrado y el panel quedaría siempre
            // a la vista. El resto neutraliza margen, borde, fondo y topes de
            // tamaño del agente para que siga siendo full-bleed, y `h-full
            // w-full` no sobra al lado de `inset-0`: el agente le da al dialog
            // `width`/`height: fit-content`, que le ganan al tamaño implícito
            // del inset y encogían el panel (los ítems quedaban 21px más
            // angostos y 59px más arriba que antes de ser <dialog>).
            className="faro-glow fixed inset-0 z-[70] m-0 hidden h-full w-full max-h-none max-w-none flex-col overflow-y-auto border-0 bg-transparent p-0 backdrop:bg-transparent open:flex lg:hidden"
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

            <NavegacionMenu
              pathname={pathname}
              secciones={secciones}
              desplegado={desplegado}
              onDesplegar={setDesplegado}
              onCerrar={close}
              onSubirEnPagina={subir}
              onIrASeccion={irA}
              onIrADestino={irADestino}
            />

            <PieMenu onCerrar={close} />
          </dialog>,
          document.body,
        )}
    </>
  );
}
