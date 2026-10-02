"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import type { DatosDelSitio } from "@/config/datos-del-sitio";
import { irEnPagina, partirDestino } from "@/lib/navegar";
import { Menu } from "@/components/ui/icons";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { irArriba } from "@/lib/indice";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useMenuAnimado } from "./mobile-nav/useMenuAnimado";
import { BarraMenu, HuecoBarra } from "./mobile-nav/BarraMenu";
import { NavegacionMenu } from "./mobile-nav/NavegacionMenu";
import { PieMenu } from "./mobile-nav/PieMenu";


/**
 * Navegación mobile (< lg). Botón hamburguesa —una isla circular suelta, a la
 * derecha del Header— que abre un panel a pantalla completa con fondo `.faro-glow`: la noche del
 * faro. El panel INVIERTE la página —ella clara, él azul con el logo en
 * negativo—, mismo lenguaje que el Footer. Los 5 ítems del sitemap se apilan
 * grandes a la izquierda y el CTA "Contacto" queda como acción focal abajo.
 *
 * - Entra como una CORTINA desde la derecha (la coreografía y su porqué, en
 *   `useMenuAnimado`); el cierre es la misma cortina en reversa.
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

export function MobileNav({ sitio }: { sitio: Pick<DatosDelSitio, "correo" | "redes"> }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  // Página en foco (ver NavegacionMenu). El menú abre siempre en la lista
  // completa: se resetea al abrir y al cambiar de ruta, no al cerrar, para que
  // la lista no se rearme a la vista mientras la cortina se va.
  const [desplegado, setDesplegado] = useState<string | null>(null);

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
    setDesplegado(null);
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

  // Tocar el nombre de la página en la que ya estamos: cierra y sube al
  // principio deslizando. La espera deja que el body suelte el lock.
  const subir = () => {
    close();
    window.setTimeout(irArriba, 60);
  };
  // Destino de un submenú: en la misma página desliza (con la misma
  // espera que arriba); en otra, navega Next y aterriza el layout.
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
        onClick={() => {
          setDesplegado(null);
          setOpen(true);
        }}
        // La isla del botón: un círculo blanco SÓLIDO —un vidrio se agrisa
        // sobre los fondos oscuros—, que se lee sobre lo que sea sin cambiar.
        // `rounded-3xl` y NO `rounded-full`: ver coreografia-boton.ts (en
        // iPhone quedaba cuadrado). `BotonCerrar` copia esta caja.
        className="border-azul-principal/10 text-azul-principal hover:bg-gris-fondo inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border bg-white shadow-[0_8px_24px_-12px_rgb(31_45_77_/_0.4)] transition-colors lg:hidden"
      >
        <Menu size={22} data-mnav-rayas />
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
            // El navegador puede cerrar el diálogo sin avisar por `cancel` (un
            // segundo Escape o el «atrás» de Android sin interacción de por
            // medio): sin esto el estado quedaría en abierto y el menú no
            // volvería a abrir.
            onClose={() => setOpen(false)}
            // `open:block` y no `block`: un `display` fijo le gana a la regla del
            // agente que esconde el dialog cerrado y el panel quedaría siempre
            // a la vista. El resto neutraliza margen, borde, fondo y topes de
            // tamaño del agente para que siga siendo full-bleed, y `h-full
            // w-full` no sobra al lado de `inset-0`: el agente le da al dialog
            // `width`/`height: fit-content`, que le ganan al tamaño implícito
            // del inset y encogían el panel (los ítems quedaban 21px más
            // angostos y 59px más arriba que antes de ser <dialog>).
            className="fixed inset-x-0 top-[var(--visor-arriba,0px)] z-[70] m-0 hidden h-[var(--visor-alto,100%)] w-full max-h-none max-w-none overflow-clip border-0 bg-transparent p-0 backdrop:bg-transparent open:block lg:hidden"
            style={{ visibility: "hidden" }}
          >
            {/* Velo: apaga la página de atrás mientras la cortina la cruza. */}
            <div data-mnav-velo className="bg-azul-principal/60 absolute inset-0" />

            {/* La cortina (ver useMenuAnimado): la capa de afuera entra de punta
                a punta y recorta; adentro, el contenido viaja a mitad de
                velocidad y la barra se queda quieta sobre la píldora de la
                página. `overflow-clip` y no `hidden`: un contenedor `hidden` se
                puede scrollear por código, y enfocar algo de adentro con las
                capas todavía corridas lo dejaría desplazado. */}
            <div data-mnav-cortina className="absolute inset-0 overflow-clip">
              {/* Primero en el DOM: el cierre es lo primero que encuentra el Tab. */}
              <BarraMenu closeRef={closeRef} onCerrar={close} />

              <div
                data-mnav-contenido
                className="faro-glow flex h-full w-full flex-col overflow-y-auto text-white"
              >
                <HuecoBarra />

                <NavegacionMenu
                  pathname={pathname}
                  desplegado={desplegado}
                  onDesplegar={setDesplegado}
                  reduced={reduced}
                  onCerrar={close}
                  onSubirEnPagina={subir}
                  onIrADestino={irADestino}
                />

                <PieMenu pathname={pathname} correo={sitio.correo} redes={sitio.redes} onCerrar={close} onSubirEnPagina={subir} />
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
