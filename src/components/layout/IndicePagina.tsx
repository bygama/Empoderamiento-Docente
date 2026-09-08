"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { useSeccionesPagina } from "@/lib/hooks/useSeccionesPagina";
import { irArriba, irASeccion } from "@/lib/indice";

/**
 * Índice de la página: la forma de llegar a una sección sin recorrer todas
 * las escenas animadas que hay antes, y de volver arriba sin desandarlas.
 *
 * Desktop (lg+): una columna de marquitas finas pegada al borde derecho, a
 * media altura. Cada marca es una sección (más «Arriba»); la activa es más
 * larga. Al pasar el mouse por la columna aparecen los rótulos, en píldoras
 * blancas para leerse igual sobre una foto, el navy o el blanco. Las marcas
 * van en blanco con `mix-blend-difference`: sobre claro se ven oscuras y
 * sobre navy claras, sin elegir color a mano por sección. Ojo: el blend tiene
 * que estar en el propio elemento fijo (un fijo es su propio contexto de
 * apilamiento; puesto en un hijo mezclaría solo contra el fondo transparente
 * del padre y desaparecería), por eso marcas y rótulos son dos capas fijas
 * hermanas y no una sola.
 *
 * No aparece hasta que el hero quedó atrás (ahí no hay nada que saltear) y
 * se esconde cuando el pie tapa la pantalla o cuando un overlay bloqueó el
 * scroll (expediente, perfil, menú): en esos momentos molestaría o apuntaría
 * a algo que no está.
 *
 * Mobile: la lista de secciones vive en el menú hamburguesa (MobileNav) y
 * acá queda solo un botón chico para subir, que aparece después de una
 * pantalla y media de scroll.
 *
 * Las secciones se declaran con `data-indice="Rótulo"` + `id` (ver
 * useSeccionesPagina). El salto es instantáneo a propósito (ver irASeccion).
 */
export function IndicePagina() {
  const secciones = useSeccionesPagina();
  const [activa, setActiva] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [mostrarSubir, setMostrarSubir] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (secciones.length < 2) return;
    let raf = 0;

    const medir = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      // Un overlay con el scroll bloqueado (expediente, perfil, menú) deja el
      // overflow inline en hidden; ahí el índice no tiene que estar.
      const bloqueado =
        document.documentElement.style.overflow === "hidden" ||
        document.body.style.overflow === "hidden";
      const footer = document.querySelector("footer");
      const pieEncima = footer
        ? footer.getBoundingClientRect().top < vh * 0.45
        : false;
      setVisible(!bloqueado && !pieEncima && y > vh * 0.6);
      setMostrarSubir(!bloqueado && y > vh * 1.5);

      // Activa: la última sección cuyo borde superior ya pasó el 40% de la
      // pantalla. Antes de la primera no hay ninguna (queda «Arriba»).
      let actual: string | null = null;
      for (const s of secciones) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= vh * 0.4) actual = s.id;
      }
      setActiva(actual);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };

    pedir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    // Los overlays no scrollean la página: hay que enterarse por el style.
    const observador = new MutationObserver(pedir);
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    observador.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      observador.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [secciones]);

  if (secciones.length < 2) return null;

  // «Arriba» siempre primero: no es una sección, es el tope de la página.
  const items: { id: string | null; label: string }[] = [
    { id: null, label: "Arriba" },
    ...secciones,
  ];
  const esActiva = (id: string | null) =>
    id === null ? activa === null : id === activa;
  const mostrarRotulos = visible && hover;

  return (
    <>
      <nav
        aria-label="Índice de la página"
        aria-hidden={!visible}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setHover(false);
          }
        }}
        className={`pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 text-white mix-blend-difference transition-opacity duration-500 lg:block ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <ol className="flex flex-col items-end">
          {items.map((it) => (
            <li key={it.id ?? "arriba"} className="flex h-7 items-center justify-end">
              <button
                type="button"
                onClick={it.id === null ? irArriba : () => irASeccion(it.id as string)}
                aria-label={`Ir a ${it.label}`}
                aria-current={esActiva(it.id) ? "location" : undefined}
                tabIndex={visible ? 0 : -1}
                className={`flex h-7 w-8 items-center justify-end rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
                  visible ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`block h-px bg-current transition-[width,opacity] duration-300 ${
                    esActiva(it.id)
                      ? "w-6 opacity-100"
                      : hover
                        ? "w-3 opacity-75"
                        : "w-3 opacity-45"
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Rótulos: misma grilla de filas que las marcas, corrida el ancho de la
          marca más el aire. Solo se ven con el mouse (o el foco) en la columna. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed top-1/2 right-14 z-40 hidden -translate-y-1/2 transition-opacity duration-300 lg:block ${
          mostrarRotulos ? "opacity-100" : "opacity-0"
        }`}
      >
        <ol className="flex flex-col items-end">
          {items.map((it) => (
            <li key={it.id ?? "arriba"} className="flex h-7 items-center justify-end">
              <span
                className={`text-azul-principal ring-azul-principal/10 rounded-full bg-white/92 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.2em] uppercase whitespace-nowrap shadow-[0_6px_18px_-10px_rgb(31_45_77/0.45)] ring-1 backdrop-blur transition-[translate] duration-300 ${
                  mostrarRotulos ? "translate-x-0" : "translate-x-1"
                } ${esActiva(it.id) ? "font-semibold" : ""}`}
              >
                {it.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile: volver arriba. */}
      <button
        type="button"
        onClick={irArriba}
        aria-label="Volver arriba"
        tabIndex={mostrarSubir ? 0 : -1}
        className={`border-azul-principal/15 text-azul-principal fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border bg-white/85 shadow-[0_10px_30px_-12px_rgb(31_45_77/0.35)] backdrop-blur transition-[opacity,translate] duration-300 lg:hidden ${
          mostrarSubir
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowRight size={18} className="-rotate-90" aria-hidden="true" />
      </button>
    </>
  );
}
