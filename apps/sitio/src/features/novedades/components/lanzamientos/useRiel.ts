import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

// El riel de «Recién salido» (LanzamientosRecientes.tsx): arrastrar con
// inercia en desktop, flechas y teclado para quien no arrastra, la pill que
// reemplaza al cursor y el velo del borde. En touch va el scroll nativo, que
// ya trae su propia inercia.

const hoverFine = () => window.matchMedia("(hover: hover)").matches;

export function useRiel() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const fadeRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const st = useRef({ down: false, startX: 0, startScroll: 0, vx: 0, lastX: 0, raf: 0 });

  /* La pill se posiciona directo al DOM (transform instantáneo, sin estado
     React); el "apretar" se transmite escalando el contenido interno, que sí
     tiene transición CSS. */
  const movePill = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pill = pillRef.current;
    const wrap = wrapRef.current;
    if (!pill || !wrap) return;
    const r = wrap.getBoundingClientRect();
    pill.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%, -50%)`;
  };

  const setPillPressed = (pressed: boolean) => {
    const inner = pillRef.current?.firstElementChild as HTMLElement | null;
    if (inner) inner.style.transform = pressed ? "scale(0.9)" : "scale(1)";
  };

  /* Extremos del riel: apagan el velo derecho (directo al DOM) y deshabilitan
     las flechas prev/next (estado React, solo cambia en los bordes). */
  const [ends, setEnds] = useState({ start: true, end: false });
  const syncEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 8;
    const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
    if (fadeRef.current) fadeRef.current.style.opacity = end ? "0" : "1";
    setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, []);

  // Una card por paso: ancho de la primera card + gap del riel (gap-5 = 20px).
  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("article");
    const paso = (card ? card.getBoundingClientRect().width : el.clientWidth * 0.8) + 20;
    el.scrollBy({ left: dir * paso, behavior: reduced ? "auto" : "smooth" });
  };

  const onUp = () => {
    setPillPressed(false);
    const s = st.current;
    const el = trackRef.current;
    if (!s.down || !el) return;
    s.down = false;
    if (reduced) return;
    let v = s.vx;
    const decay = () => {
      v *= 0.92;
      el.scrollLeft -= v;
      if (Math.abs(v) > 0.4) s.raf = requestAnimationFrame(decay);
    };
    s.raf = requestAnimationFrame(decay);
  };

  const handlers = {
    onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      scrollByCard(e.key === "ArrowLeft" ? -1 : 1);
    },
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!hoverFine()) return; // touch → scroll nativo
      const el = trackRef.current;
      if (!el) return;
      cancelAnimationFrame(st.current.raf);
      Object.assign(st.current, { down: true, startX: e.clientX, startScroll: el.scrollLeft, lastX: e.clientX, vx: 0 });
      el.setPointerCapture?.(e.pointerId);
      setPillPressed(true);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      movePill(e);
      const s = st.current;
      const el = trackRef.current;
      if (!s.down || !el) return;
      el.scrollLeft = s.startScroll - (e.clientX - s.startX);
      s.vx = e.clientX - s.lastX;
      s.lastX = e.clientX;
    },
    onPointerUp: onUp,
    onPointerEnter: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!hoverFine() || !pillRef.current) return;
      movePill(e);
      pillRef.current.style.opacity = "1";
    },
    onPointerLeave: () => {
      if (pillRef.current) pillRef.current.style.opacity = "0";
      onUp();
    },
    onScroll: syncEdges,
  };

  return { trackRef, wrapRef, pillRef, fadeRef, ends, scrollByCard, handlers };
}
