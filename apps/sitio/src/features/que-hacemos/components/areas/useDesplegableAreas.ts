"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { EVENTO_AREA, conDesplegables } from "./ir-al-area";

/** Debajo del logo y el menú flotantes, si no hay franja pegada que mida más. */
const TOPE_PX = 76;

/**
 * Dónde queda la cabecera del área abierta: debajo de la franja pegada del
 * índice (IndiceAreas, `data-areas-banda`), que ya incluye el alto del
 * header en su padding. Si no está (escritorio, o sin JS) vale el header.
 */
function tope() {
  const banda = document.querySelector<HTMLElement>("[data-areas-banda]");
  if (!banda || getComputedStyle(banda).position !== "sticky") return TOPE_PX;
  return Math.max(TOPE_PX, Math.round(banda.getBoundingClientRect().height));
}

/** Lleva el artículo hasta el tope, suave salvo con movimiento reducido. */
function irA(articulo: Element) {
  const lenis = getLenis();
  const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // En número y no el elemento: con el elemento, Lenis suma su
  // scroll-margin-top (pensado para las anclas) y la cabecera quedaba más abajo.
  const destino = articulo.getBoundingClientRect().top + window.scrollY - tope();
  if (lenis) lenis.scrollTo(destino, { duration: suave ? 0.9 : 0, immediate: !suave });
  else window.scrollTo({ top: destino, behavior: suave ? "smooth" : "auto" });
}

/**
 * Los desplegables de las áreas en celular: UNA abierta por vez.
 *
 * Al abrir una se cierra la anterior, y si esa estaba más arriba la página
 * se acortaría de golpe y el área tocada saltaría hacia arriba. Por eso, en
 * el mismo frame del cambio, se compensa el scroll para que la cabecera
 * tocada quede exactamente donde estaba, y recién ahí se desliza (Lenis)
 * hasta dejarla arriba, que es donde queda pegada mientras se lee.
 *
 * Llegar con `#area-<id>` en la dirección la abre, y también un chip del
 * hero (EVENTO_AREA).
 */
export function useDesplegableAreas(ids: string[]) {
  const [abierta, setAbierta] = useState<number | null>(null);
  // Copia del estado para leerla desde `abrir` sin re-crear el callback.
  const abiertaRef = useRef<number | null>(null);
  useEffect(() => {
    abiertaRef.current = abierta;
  }, [abierta]);
  const ancla = useRef<{ el: HTMLElement; top: number } | null>(null);

  const alternar = useCallback((i: number, cabecera: HTMLElement) => {
    ancla.current = { el: cabecera, top: cabecera.getBoundingClientRect().top };
    setAbierta((a) => (a === i ? null : i));
  }, []);
  // Desde el índice: abre (no alterna) y lleva la cabecera bajo la franja.
  // Si ya estaba abierta no hay cambio de estado que dispare el efecto: se
  // vuelve a su inicio directo.
  const abrir = useCallback((i: number) => {
    const cabecera = document.querySelector<HTMLElement>(`[data-area="${i}"] [data-area-cabecera]`);
    if (!cabecera) return;
    if (abiertaRef.current === i) {
      const articulo = cabecera.closest("article");
      if (articulo) irA(articulo);
      return;
    }
    ancla.current = { el: cabecera, top: cabecera.getBoundingClientRect().top };
    setAbierta(i);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const a = ancla.current;
    ancla.current = null;
    if (!a) return;
    const lenis = getLenis();
    const salto = a.el.getBoundingClientRect().top - a.top;
    if (Math.abs(salto) > 0.5) {
      if (lenis) lenis.scrollTo(window.scrollY + salto, { immediate: true, force: true });
      else window.scrollTo(0, window.scrollY + salto);
    }
    if (abierta === null) return;
    const articulo = a.el.closest("article");
    if (articulo) irA(articulo);
  }, [abierta]);

  // Llegar con el ancla de un área (otra página, un link compartido) la
  // abre, y también el pedido de los chips del hero (ir-al-area.ts), que ya
  // no pasan por la dirección. Al cargar se mira en el frame siguiente, no
  // durante el efecto.
  useEffect(() => {
    // Sin ancla de compensación: quien la pidió ya deja el artículo bajo la
    // franja (el ancla del navegador con su scroll-mt, el chip con su
    // corte), y una vieja movería la página.
    const abrirSinCompensar = (i: number) => {
      ancla.current = null;
      if (i >= 0) setAbierta(i);
    };
    const desdeAncla = () => {
      if (conDesplegables()) abrirSinCompensar(ids.indexOf(window.location.hash.slice(1)));
    };
    const pedida = (e: Event) => abrirSinCompensar((e as CustomEvent<number>).detail);
    const raf = requestAnimationFrame(desdeAncla);
    window.addEventListener("hashchange", desdeAncla);
    window.addEventListener(EVENTO_AREA, pedida);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", desdeAncla);
      window.removeEventListener(EVENTO_AREA, pedida);
    };
  }, [ids]);

  return { abierta, alternar, abrir };
}
