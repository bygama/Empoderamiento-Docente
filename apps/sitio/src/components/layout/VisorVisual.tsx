"use client";

import { useEffect } from "react";

/**
 * Dónde está de verdad la pantalla. Lo `fixed` se ubica contra el viewport de
 * layout, y hay navegadores donde ese rectángulo no coincide con lo que se ve:
 * en Chrome de iPhone, al esconderse las barras, el logo y el menú quedaban
 * tapados arriba, al expediente de un caso le faltaba la cabecera y por abajo
 * asomaba la página de atrás (Gastón, 2026-10-02, videos).
 *
 * Acá se mide el visor (`visualViewport`) contra una sonda `fixed inset-0` y
 * se dejan tres variables en `<html>` para quien necesite compensar:
 *
 *   --visor-arriba  cuánto quedó tapado por arriba (0 donde todo coincide)
 *   --visor-alto    el alto visible
 *   --visor-abajo   dónde cae el borde de abajo visible, medido desde el del
 *                   layout (negativo: se ve más abajo que el layout)
 *
 * Donde el navegador hace las cosas bien valen 0 / el alto de siempre / 0, y
 * quien las usa queda igual que sin ellas. Con zoom de pellizco no se
 * compensa: ahí el visor se mueve porque la persona lo pidió.
 */
export function VisorVisual() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const raiz = document.documentElement;
    const sonda = document.createElement("div");
    sonda.setAttribute("aria-hidden", "true");
    sonda.style.cssText = "position:fixed;inset:0;visibility:hidden;pointer-events:none;z-index:-1";
    document.body.appendChild(sonda);

    let raf = 0;
    const medir = () => {
      raf = 0;
      const conZoom = vv.scale > 1.01;
      const arriba = conZoom ? 0 : Math.max(0, Math.round(vv.offsetTop));
      const alto = Math.round(vv.height);
      const abajo = conZoom ? 0 : Math.round(sonda.offsetHeight - (arriba + alto));
      raiz.style.setProperty("--visor-arriba", `${arriba}px`);
      raiz.style.setProperty("--visor-alto", conZoom ? "100%" : `${alto}px`);
      raiz.style.setProperty("--visor-abajo", `${abajo}px`);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    vv.addEventListener("resize", pedir);
    vv.addEventListener("scroll", pedir);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", pedir);
      vv.removeEventListener("scroll", pedir);
      sonda.remove();
      for (const v of ["--visor-arriba", "--visor-alto", "--visor-abajo"]) raiz.style.removeProperty(v);
    };
  }, []);
  return null;
}
