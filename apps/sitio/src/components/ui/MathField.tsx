"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  /** Umbral de scroll (0→1) a partir del cual el nodo se apaga. */
  vanish: number;
};

const COLORS = {
  base: "#4a6fa5", // azul-medio
  green: "#1f9a78", // verde-concepto
  orange: "#e07a2f", // naranja-accion (acento, pocos)
};

type MathFieldProps = {
  className?: string;
  /** Ref mutable con progreso de scroll 0→1. El canvas lo lee en cada frame
   *  sin causar re-renders. Modula la velocidad de los nodos con el scroll. */
  scrollRef?: React.MutableRefObject<number>;
};

/**
 * Campo de "constelación matemática": una red de nodos que derivan y se
 * conectan con líneas cuando están cerca (grafo vivo), y reaccionan al
 * mouse (los nodos cercanos se enlazan con el cursor y se atraen). Canvas
 * 2D, performante (cap de nodos por área, dpr<=2). Respeta reduced-motion
 * (dibuja un frame estático sin loop). Decorativo: pointer-events-none.
 * scrollRef (opcional): mutable {current: 0→1} que modula la velocidad de
 * los nodos con el scroll del Hero — sin re-renders.
 */
export function MathField({ className, scrollRef }: MathFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK = 132; // distancia de conexión entre nodos
    const REACH = 65; // alcance del mouse (más chico = hay que acercarse más)
    const FADE = 0.14; // banda de transición del apagado por nodo

    const build = () => {
      const count = Math.max(28, Math.min(140, Math.floor((w * h) / 15000)));
      nodes = Array.from({ length: count }, () => {
        const roll = Math.random();
        const color =
          roll > 0.93 ? COLORS.orange : roll > 0.72 ? COLORS.green : COLORS.base;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: color === COLORS.base ? 1.5 : 2.4,
          color,
          // Umbral de apagado aleatorio: a más scroll se apagan más nodos
          // (cada vez menos), de a poco y en orden disperso.
          vanish: FADE + Math.random() * (1 - FADE),
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      if (!reduced) {
        // scrollRef modula la velocidad de los nodos: a mayor progreso de
        // scroll del Hero, los nodos se aceleran levemente (1→1.5×).
        const scrollMult = 1 + (scrollRef?.current ?? 0) * 0.5;
        for (const n of nodes) {
          n.x += n.vx * scrollMult;
          n.y += n.vy * scrollMult;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < REACH) {
            n.x += dx * 0.0016;
            n.y += dy * 0.0016;
          }
        }
      }

      // Apagado por scroll: cada nodo se desvanece al cruzar su umbral
      // (vanish). A más progreso de scroll → cada vez menos nodos y líneas.
      const prog = scrollRef?.current ?? 0;
      const alphaOf = (n: Node) => {
        const a = (n.vanish - prog) / FADE;
        return a < 0 ? 0 : a > 1 ? 1 : a;
      };

      // Líneas entre nodos cercanos
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const aAlpha = alphaOf(a);
        if (aAlpha <= 0) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bAlpha = alphaOf(b);
          if (bAlpha <= 0) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const la = (1 - d / LINK) * 0.32 * Math.min(aAlpha, bAlpha);
            ctx.strokeStyle = `rgba(74,111,165,${la})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // Línea al cursor
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < REACH) {
          ctx.strokeStyle = `rgba(31,154,120,${(1 - dm / REACH) * 0.55 * aAlpha})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Nodos
      for (const n of nodes) {
        const nAlpha = alphaOf(n);
        if (nAlpha <= 0) continue;
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.9 * nAlpha;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) render();
    else raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
