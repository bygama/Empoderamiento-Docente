"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight } from "@/components/ui/icons";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useSeccionesPagina } from "@/lib/hooks/useSeccionesPagina";
import { irArriba, irASeccion } from "@/lib/indice";

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
 * El hover es un imán: la marca más cercana al cursor se estira y las vecinas
 * un poco, con caída suave. Los rótulos entran en píldoras blancas,
 * escalonados desde la fila del cursor hacia afuera, y el más cercano se
 * resalta en navy; se pueden clickear igual que las marcas. Todo con
 * quickTo de GSAP (un tween por propiedad, retarget en cada movimiento).
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

/** Alto de cada fila (h-7). Las dos capas comparten esta grilla. */
const ALTO_FILA = 28;
/** Ancho de la marca en px: en reposo, activa, y cuánto se estira con el cursor encima. */
const ANCHO_BASE = 12;
const ANCHO_ACTIVA = 24;
const ANCHO_EXTRA = 20;
/** Alcance del imán, en filas: a una fila de distancia queda cerca del 25%. */
const SIGMA = 0.6;
/** Corrimiento de la píldora escondida, en px. */
const CORRIMIENTO = 8;

type Item = { id: string | null; label: string };

type Animadores = {
  ancho: ((v: number) => void)[];
  tinta: ((v: number) => void)[];
  x: ((v: number) => void)[];
  op: ((v: number) => void)[];
  escala: ((v: number) => void)[];
};

/** Cuánto pesa la fila `i` con el cursor en la posición (continua) `r`. */
const cercania = (i: number, r: number) => {
  const d = i - r;
  return Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
};

const ir = (it: Item) => (it.id === null ? irArriba() : irASeccion(it.id));

export function IndicePagina() {
  const secciones = useSeccionesPagina();
  const reduced = useReducedMotion();
  const [activa, setActiva] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [mostrarSubir, setMostrarSubir] = useState(false);
  const [hover, setHover] = useState(false);
  const [cerca, setCerca] = useState<number | null>(null);

  const navRef = useRef<HTMLElement | null>(null);
  const marcas = useRef<(HTMLSpanElement | null)[]>([]);
  const pildoras = useRef<(HTMLSpanElement | null)[]>([]);
  const anims = useRef<Animadores | null>(null);
  const enHover = useRef(false);
  const temporizadores = useRef<number[]>([]);
  const gracia = useRef(0);

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

  // ── Animadores: un quickTo por propiedad, por marca y por píldora ────────
  useEffect(() => {
    if (secciones.length < 2) return;
    const n = secciones.length + 1;
    const m = marcas.current.slice(0, n).filter(Boolean) as HTMLSpanElement[];
    const p = pildoras.current.slice(0, n).filter(Boolean) as HTMLSpanElement[];
    const cfg = { duration: reduced ? 0 : 0.35, ease: "power3.out" };
    gsap.set(m, { width: ANCHO_BASE, opacity: 0.45 });
    gsap.set(p, { x: CORRIMIENTO, opacity: 0, scale: 1 });
    anims.current = {
      ancho: m.map((el) => gsap.quickTo(el, "width", cfg)),
      tinta: m.map((el) => gsap.quickTo(el, "opacity", cfg)),
      x: p.map((el) => gsap.quickTo(el, "x", cfg)),
      op: p.map((el) => gsap.quickTo(el, "opacity", cfg)),
      escala: p.map((el) => gsap.quickTo(el, "scale", cfg)),
    };
    return () => {
      gsap.killTweensOf([...m, ...p]);
      anims.current = null;
    };
  }, [secciones, reduced]);

  // ── Reposo: la activa larga, el resto corto. Solo cuando no hay cursor. ──
  useEffect(() => {
    const a = anims.current;
    if (!a || hover) return;
    const ids: (string | null)[] = [null, ...secciones.map((s) => s.id)];
    ids.forEach((id, i) => {
      const es = id === null ? activa === null : id === activa;
      a.ancho[i]?.(es ? ANCHO_ACTIVA : ANCHO_BASE);
      a.tinta[i]?.(es ? 1 : 0.45);
    });
  }, [activa, hover, secciones]);

  if (secciones.length < 2) return null;

  // «Arriba» siempre primero: no es una sección, es el tope de la página.
  const items: Item[] = [{ id: null, label: "Arriba" }, ...secciones];
  const esActiva = (id: string | null) =>
    id === null ? activa === null : id === activa;

  /** Posición continua del cursor en filas (0 = centro de la primera). */
  const filaDesde = (clientY: number) => {
    const nav = navRef.current;
    if (!nav) return 0;
    return (clientY - nav.getBoundingClientRect().top) / ALTO_FILA - 0.5;
  };

  const limpiarTemporizadores = () => {
    temporizadores.current.forEach((t) => window.clearTimeout(t));
    temporizadores.current = [];
  };

  /** Marcas y píldoras según dónde está el cursor. */
  const aplicar = (r: number, escalonado: boolean) => {
    const a = anims.current;
    if (!a) return;
    const idx = Math.round(Math.max(0, Math.min(items.length - 1, r)));
    items.forEach((it, i) => {
      const c = cercania(i, r);
      const base = esActiva(it.id) ? ANCHO_ACTIVA : ANCHO_BASE;
      a.ancho[i]?.(base + ANCHO_EXTRA * c);
      a.tinta[i]?.(esActiva(it.id) ? 1 : 0.45 + 0.55 * c);
      const pildora = () => {
        a.x[i]?.(CORRIMIENTO * (1 - c));
        a.op[i]?.(0.6 + 0.4 * c);
        a.escala[i]?.(1 + 0.05 * c);
      };
      // Entrada escalonada desde la fila del cursor hacia afuera.
      if (escalonado && !reduced) {
        temporizadores.current.push(
          window.setTimeout(pildora, 28 * Math.abs(i - idx)),
        );
      } else pildora();
    });
    setCerca(idx);
  };

  const entrar = (clientY: number) => {
    window.clearTimeout(gracia.current);
    const r = filaDesde(clientY);
    if (!enHover.current) {
      enHover.current = true;
      setHover(true);
      limpiarTemporizadores();
      aplicar(r, true);
    } else aplicar(r, false);
  };

  const salir = () => {
    // Un respiro para cruzar el aire entre las marcas y las píldoras.
    window.clearTimeout(gracia.current);
    gracia.current = window.setTimeout(() => {
      enHover.current = false;
      setHover(false);
      setCerca(null);
      limpiarTemporizadores();
      const a = anims.current;
      if (!a) return;
      items.forEach((it, i) => {
        a.ancho[i]?.(esActiva(it.id) ? ANCHO_ACTIVA : ANCHO_BASE);
        a.tinta[i]?.(esActiva(it.id) ? 1 : 0.45);
        a.x[i]?.(CORRIMIENTO);
        a.op[i]?.(0);
        a.escala[i]?.(1);
      });
    }, 120);
  };

  /** Tic de confirmación en la marca al clickear. */
  const tic = (i: number) => {
    const el = marcas.current[i];
    if (!el || reduced) return;
    gsap.fromTo(
      el,
      { scaleX: 1 },
      {
        scaleX: 1.5,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        transformOrigin: "100% 50%",
      },
    );
  };

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

      {/* Rótulos: misma grilla de filas que las marcas, corrida el ancho de la
          marca estirada más el aire. Se mueven con GSAP (ver aplicar). */}
      <div
        aria-hidden="true"
        onPointerEnter={(e) => entrar(e.clientY)}
        onPointerMove={(e) => entrar(e.clientY)}
        onPointerLeave={salir}
        className={`fixed top-1/2 right-[4.25rem] z-40 hidden -translate-y-1/2 transition-opacity duration-300 lg:block ${
          visible ? "opacity-100" : "opacity-0"
        } ${interactivo ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <ol className="flex flex-col items-end">
          {items.map((it, i) => (
            <li key={it.id ?? "arriba"} className="flex h-7 items-center justify-end">
              <span
                ref={(el) => {
                  pildoras.current[i] = el;
                }}
                onClick={() => {
                  tic(i);
                  ir(it);
                }}
                className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.2em] uppercase whitespace-nowrap shadow-[0_6px_18px_-10px_rgb(31_45_77/0.45)] ring-1 backdrop-blur transition-colors duration-200 ${
                  interactivo && cerca === i
                    ? "bg-azul-principal ring-azul-principal text-white"
                    : "text-azul-principal ring-azul-principal/10 bg-white/92"
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
