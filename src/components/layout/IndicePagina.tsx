"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useSeccionesPagina } from "@/lib/hooks/useSeccionesPagina";
import { ANCHO_BASE, useImanIndice, type ItemIndice } from "@/lib/hooks/useImanIndice";
import { irArriba, irASeccion } from "@/lib/indice";
import { BotonSubir } from "./indice-pagina/BotonSubir";
import { RotulosIndice } from "./indice-pagina/RotulosIndice";

/**
 * Índice de la página: la forma de llegar a una sección sin recorrer todas
 * las escenas animadas que hay antes, y de volver arriba sin desandarlas.
 *
 * Desktop (lg+): una columna de marquitas finas pegada al borde derecho, a
 * media altura. Cada marca es una sección (más «Arriba»); la activa es más
 * larga. Las marcas van en blanco con `mix-blend-difference`: sobre claro se
 * ven oscuras y sobre navy claras, sin elegir color a mano por sección. Ojo:
 * el blend tiene que estar en el propio elemento fijo (un fijo es su propio
 * contexto de apilamiento; puesto en un hijo mezclaría solo contra el fondo
 * transparente del padre y desaparecería), por eso marcas y rótulos son dos
 * capas fijas hermanas y no una sola.
 *
 * El hover es un imán (ver useImanIndice): la marca más cercana al cursor se
 * estira y las vecinas un poco, con caída suave. Los rótulos entran en
 * píldoras blancas, escalonados desde la fila del cursor hacia afuera, y el
 * más cercano se resalta en navy; se pueden clickear igual que las marcas.
 *
 * No aparece hasta que el hero quedó atrás (ahí no hay nada que saltear) y
 * se esconde cuando el pie tapa la pantalla o cuando un overlay bloqueó el
 * scroll (expediente, perfil, menú): en esos momentos molestaría o apuntaría
 * a algo que no está.
 *
 * Mobile: la lista de secciones vive en el menú hamburguesa (MobileNav) y
 * acá queda solo un botón chico para subir (BotonSubir), que aparece después
 * de una pantalla y media de scroll.
 *
 * Las secciones se declaran con `data-indice="Rótulo"` + `id` (ver
 * useSeccionesPagina). El salto es instantáneo a propósito (ver irASeccion).
 */

const ir = (it: ItemIndice) => (it.id === null ? irArriba() : irASeccion(it.id));

export function IndicePagina() {
  const secciones = useSeccionesPagina();
  const reduced = useReducedMotion();
  const [activa, setActiva] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [mostrarSubir, setMostrarSubir] = useState(false);

  // ── Visibilidad y sección activa (por scroll) ────────────────────────────
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

  const { items, hover, cerca, navRef, marcas, pildoras, esActiva, entrar, salir, tic } =
    useImanIndice(secciones, activa, reduced);

  if (secciones.length < 2) return null;

  const interactivo = visible && hover;

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Índice de la página"
        aria-hidden={!visible}
        onPointerEnter={(e) => entrar(e.clientY)}
        onPointerMove={(e) => entrar(e.clientY)}
        onPointerLeave={salir}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) salir();
        }}
        className={`pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 text-white mix-blend-difference transition-opacity duration-500 lg:block ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <ol className="flex flex-col items-end">
          {items.map((it, i) => (
            <li key={it.id ?? "arriba"} className="flex h-7 items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  tic(i);
                  ir(it);
                }}
                onFocus={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  entrar(r.top + r.height / 2);
                }}
                aria-label={`Ir a ${it.label}`}
                aria-current={esActiva(it.id) ? "location" : undefined}
                tabIndex={visible ? 0 : -1}
                className={`flex h-7 w-12 items-center justify-end rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
                  visible ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                <span
                  ref={(el) => {
                    marcas.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="block h-px bg-current"
                  style={{ width: ANCHO_BASE }}
                />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <RotulosIndice
        items={items}
        visible={visible}
        interactivo={interactivo}
        cerca={cerca}
        esActiva={esActiva}
        refPildora={(i) => (el) => {
          pildoras.current[i] = el;
        }}
        onEntrar={entrar}
        onSalir={salir}
        onIr={(i, it) => {
          tic(i);
          ir(it);
        }}
      />

      <BotonSubir visible={mostrarSubir} />
    </>
  );
}
