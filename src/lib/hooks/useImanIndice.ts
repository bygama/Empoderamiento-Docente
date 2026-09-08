"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/** Alto de cada fila (h-7). Las dos capas comparten esta grilla. */
const ALTO_FILA = 28;
/** Ancho de la marca en px: en reposo, activa, y cuánto se estira con el cursor encima. */
export const ANCHO_BASE = 12;
const ANCHO_ACTIVA = 24;
const ANCHO_EXTRA = 20;
/** Alcance del imán, en filas: a una fila de distancia queda cerca del 25%. */
const SIGMA = 0.6;
/** Corrimiento de la píldora escondida, en px. */
const CORRIMIENTO = 8;

export type ItemIndice = { id: string | null; label: string };

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

/**
 * El imán del índice de la página: la marca más cercana al cursor se estira y
 * las vecinas un poco, con caída suave; los rótulos entran en píldoras
 * escalonados desde la fila del cursor hacia afuera, y el más cercano se
 * resalta. Todo con quickTo de GSAP (un tween por propiedad, retarget en cada
 * movimiento). Devuelve los items (con «Arriba» primero), los refs para colgar
 * de cada marca y cada píldora, y los handlers de puntero, foco y click.
 */
export function useImanIndice(
  secciones: ReadonlyArray<{ id: string; label: string }>,
  activa: string | null,
  reduced: boolean,
) {
  const [hover, setHover] = useState(false);
  const [cerca, setCerca] = useState<number | null>(null);

  const navRef = useRef<HTMLElement | null>(null);
  const marcas = useRef<(HTMLSpanElement | null)[]>([]);
  const pildoras = useRef<(HTMLButtonElement | null)[]>([]);
  const anims = useRef<Animadores | null>(null);
  const enHover = useRef(false);
  const temporizadores = useRef<number[]>([]);
  const gracia = useRef(0);

  // ── Animadores: un quickTo por propiedad, por marca y por píldora ────────
  useEffect(() => {
    if (secciones.length < 2) return;
    const n = secciones.length + 1;
    const m = marcas.current.slice(0, n).filter(Boolean) as HTMLSpanElement[];
    const p = pildoras.current.slice(0, n).filter(Boolean) as HTMLButtonElement[];
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

  // «Arriba» siempre primero: no es una sección, es el tope de la página.
  const items: ItemIndice[] = [{ id: null, label: "Arriba" }, ...secciones];
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

  return { items, hover, cerca, navRef, marcas, pildoras, esActiva, entrar, salir, tic };
}
