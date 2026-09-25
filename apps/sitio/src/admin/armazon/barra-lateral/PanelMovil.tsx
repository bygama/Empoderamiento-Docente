"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "@/components/ui/icons";

// Lo que toma el foco adentro del panel. Los links de una página plegada
// están en el DOM pero no se ven: se filtran con `getClientRects`.
const ENFOCABLES = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * La sidebar en el celular (SPEC §2 de work/armazon-del-admin): una barra
 * arriba con el logo y «Menú», y la sidebar en un `<dialog>` modal sobre el
 * contenido.
 *
 * El `<dialog>` nativo, abierto con `showModal()`, vuelve inerte el resto de
 * la página, se cierra con Escape y devuelve el foco a «Menú». Acá se suma lo
 * que no trae:
 * - Tab da la vuelta adentro del panel (patrón de diálogo de WAI-ARIA). Solo,
 *   el `<dialog>` deja que el foco se vaya a la interfaz del navegador después
 *   del último control: medido con Playwright, 4 de cada 30 Tab;
 * - cerrar al tocar el fondo o un link (incluido uno a otra sección de la
 *   misma página, que no cambia la ruta);
 * - bloquear el scroll de atrás.
 *
 * No se anima: aparece y desaparece, así que no hay nada que apagar con
 * `prefers-reduced-motion`. Recibe como `children` el mismo contenido que la
 * sidebar de escritorio (`ContenidoDeLaBarra`, armado en el servidor por
 * `BarraLateral`).
 */
export function PanelMovil({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    // Escape, el botón de cerrar, el fondo o un link: todos terminan en `close()`, y esto se entera.
    const alCerrar = () => {
      setAbierto(false);
      document.body.style.overflow = "";
    };
    const alTocar = (e: MouseEvent) => {
      // Un clic en el fondo llega con el propio <dialog> como destino: el panel lo cubre por dentro.
      const tocoElFondo = e.target === d;
      const tocoUnLink = e.target instanceof Element && e.target.closest("a") !== null;
      if (tocoElFondo || tocoUnLink) d.close();
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focos = [...d.querySelectorAll<HTMLElement>(ENFOCABLES)].filter((el) => el.getClientRects().length > 0);
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo?.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero?.focus();
      }
    };
    d.addEventListener("close", alCerrar);
    d.addEventListener("click", alTocar);
    d.addEventListener("keydown", alTeclear);
    return () => {
      d.removeEventListener("close", alCerrar);
      d.removeEventListener("click", alTocar);
      d.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, []);

  const abrir = () => {
    dialogo.current?.showModal();
    document.body.style.overflow = "hidden";
    setAbierto(true);
  };

  return (
    <>
      <div data-barra className="flex items-center justify-between border-b border-azul-claro/60 bg-gris-fondo px-4 py-3 lg:hidden">
        {/* 128 px: el manual pide 120 como mínimo para el logo completo (§10). */}
        <Image src="/brand/logo-ed-principal.png" alt="Empoderamiento Docente" width={1252} height={608} sizes="128px" className="h-auto w-32 dark:hidden" />
        <Image src="/brand/logo-ed-negativo.png" alt="Empoderamiento Docente" width={1252} height={608} sizes="128px" className="hidden h-auto w-32 dark:block" />
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="panel-del-admin"
          onClick={abrir}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-admin-meta font-medium text-azul-principal transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-azul-medio"
        >
          <Menu size={20} />
          Menú
        </button>
      </div>
      <dialog
        data-barra
        id="panel-del-admin"
        ref={dialogo}
        aria-label="Menú del admin"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-80 max-w-[85vw] overflow-y-auto bg-gris-fondo p-0 shadow-xl backdrop:bg-azul-principal/70 dark:backdrop:bg-gris-fondo/80"
      >
        <button
          type="button"
          onClick={() => dialogo.current?.close()}
          aria-label="Cerrar el menú"
          className="absolute top-2 right-2 z-10 rounded-lg p-2 text-azul-principal transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-azul-medio"
        >
          <X size={20} />
        </button>
        {children}
      </dialog>
    </>
  );
}
