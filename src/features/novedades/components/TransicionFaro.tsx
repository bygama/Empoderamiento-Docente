"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Transición de ruta "el faro te abre el documento", en tres tiempos:
 * 1. TELÓN (0.5s): sube desde abajo, con bordes en degradé.
 * 2. BEAT DEL FARO: isotipo + destello respirando; nunca menos que
 *    BEAT_MINIMO desde la cobertura.
 * 3. DESTAPE (0.55s): con la ruta nueva confirmada (pathname) y pintada
 *    (doble rAF), el telón sigue subiendo y revela la página lista. La ficha
 *    coordina sus reveals con el flag de sessionStorage (solo destinos ficha).
 *
 * SIN GSAP a propósito: el diagnóstico con logs mostró el tween de cobertura
 * tardando 7s reales (ticker de rAF famélico: en dev el main thread se satura
 * con compile + efectos de la página). Las transiciones CSS de transform y
 * opacity corren en el COMPOSITOR del navegador: suaves aunque el main thread
 * esté ahogado. El push espera el transitionend de la cobertura (con fallback
 * por timer si el evento se pierde); la página vieja se va siempre tapada.
 *
 * Robustez: gesto repetido con telón puesto se ignora; cualquier cambio de
 * pathname destapa (back del navegador incluido) y cancela un push pendiente;
 * al desmontar el provider se limpia todo; escape a los 8s si la ruta nunca
 * llega. Con prefers-reduced-motion: push directo, sin telón.
 */
export const FLAG_ENTRADA_FARO = "ed-entrada-faro";
/** Milisegundos de telón pleno antes de destapar (el respiro del faro). */
const BEAT_MINIMO_MS = 500;
const CUBRIR_MS = 500;
const DESTAPAR_MS = 550;
const ESCAPE_MS = 8000;
/** power3.out aproximado (veloz al arrancar, frenando al llegar). */
const EASE_CUBRIR = "cubic-bezier(0.215, 0.61, 0.355, 1)";
/** power2.inOut aproximado (retoma el viaje y frena al salir). */
const EASE_DESTAPAR = "cubic-bezier(0.455, 0.03, 0.515, 0.955)";

const Ctx = createContext<((href: string) => void) | null>(null);

/** null si no hay provider: el consumidor debe caer a navegación normal. */
export const useTransicionFaro = () => useContext(Ctx);

export function TransicionFaro({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const veloRef = useRef<HTMLDivElement | null>(null);
  const marcaRef = useRef<HTMLDivElement | null>(null);
  const destelloRef = useRef<HTMLSpanElement | null>(null);
  const cubriendo = useRef(false); // telón puesto, esperando la ruta nueva
  const cubiertoEn = useRef(Infinity); // performance.now() al completar cobertura
  const timers = useRef<number[]>([]);
  const alCubrir = useRef<((e: TransitionEvent) => void) | null>(null);

  const programar = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const limpiarTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const velo = veloRef.current;
    if (velo && alCubrir.current) {
      velo.removeEventListener("transitionend", alCubrir.current);
      alCubrir.current = null;
    }
  }, []);

  // Al desmontar el provider (salir de /novedades con el telón en cualquier
  // fase): limpiar todo — un push pendiente secuestraría la navegación.
  useEffect(() => limpiarTimers, [limpiarTimers]);

  const destapar = useCallback(() => {
    const velo = veloRef.current;
    const marca = marcaRef.current;
    if (!velo || !marca || !cubriendo.current) return;
    cubriendo.current = false;
    limpiarTimers(); // cancela push pendiente y escape
    const transcurrido = performance.now() - cubiertoEn.current;
    const espera =
      cubiertoEn.current === Infinity
        ? 0
        : Math.max(0, BEAT_MINIMO_MS - transcurrido);
    // Margen para el primer paint de la página nueva bajo el telón. Timer y
    // no rAF: el rAF se congela con la pestaña en segundo plano (y con el
    // main thread saturado en dev) y dejaba el destape colgado.
    programar(() => {
      {
        programar(() => {
          marca.style.opacity = "0";
          marca.style.transform = "translateY(-12px)";
          programar(() => {
            velo.style.transitionDuration = `${DESTAPAR_MS}ms`;
            velo.style.transitionTimingFunction = EASE_DESTAPAR;
            velo.style.transform = "translateY(-100%)";
            programar(() => {
              // Reset a posición de partida, sin transición visible.
              velo.style.transitionDuration = "0ms";
              velo.style.visibility = "hidden";
              velo.style.willChange = "";
              velo.style.transform = "translateY(100%)";
              if (destelloRef.current)
                destelloRef.current.style.animationPlayState = "paused";
            }, DESTAPAR_MS + 80);
          }, 100);
        }, espera);
      }
    }, 60);
  }, [limpiarTimers]);

  const abrir = useCallback(
    (href: string) => {
      const velo = veloRef.current;
      const marca = marcaRef.current;
      if (cubriendo.current) return; // gesto en curso: ignorar repetidos
      if (reduced || !velo || !marca) {
        router.push(href);
        return;
      }
      cubriendo.current = true;
      cubiertoEn.current = Infinity;
      // Solo las fichas coordinan su entrada con el destape.
      if (href.startsWith("/novedades/")) {
        try {
          sessionStorage.setItem(FLAG_ENTRADA_FARO, "1");
        } catch {}
      }

      // Estados de partida sin transición, con reflow para fijarlos.
      velo.style.transitionDuration = "0ms";
      velo.style.visibility = "visible";
      // Pantalla completa: el hint solo mientras el telón viaja.
      velo.style.willChange = "transform";
      velo.style.transform = "translateY(100%)";
      marca.style.transitionDuration = "0ms";
      marca.style.opacity = "0";
      marca.style.transform = "translateY(16px) scale(0.97)";
      void velo.getBoundingClientRect();

      // Cobertura (compositor). El push viaja con el transitionend.
      velo.style.transitionDuration = `${CUBRIR_MS}ms`;
      velo.style.transitionTimingFunction = EASE_CUBRIR;
      velo.style.transform = "translateY(0%)";

      let pushHecho = false;
      const push = () => {
        if (pushHecho || !cubriendo.current) return;
        pushHecho = true;
        cubiertoEn.current = performance.now();
        router.push(href); // pantalla 100% cubierta: recién ahora
      };
      const onEnd = (e: TransitionEvent) => {
        if (e.target === velo && e.propertyName === "transform") push();
      };
      alCubrir.current = onEnd;
      velo.addEventListener("transitionend", onEnd, { once: true });
      // Fallback: transitionend se pierde si la pestaña se oculta, etc.
      programar(push, CUBRIR_MS + 250);

      // La marca entra apenas el telón va llegando; el destello respira por
      // keyframes CSS (tf-destello, ver globals.css).
      programar(() => {
        marca.style.transitionDuration = "350ms";
        marca.style.opacity = "1";
        marca.style.transform = "translateY(0) scale(1)";
        if (destelloRef.current)
          destelloRef.current.style.animationPlayState = "running";
      }, 220);

      // Escape: si la ruta nunca llega, no dejar la pantalla presa del telón.
      programar(destapar, ESCAPE_MS);
    },
    [reduced, router, destapar],
  );

  // Cualquier cambio de ruta con el telón puesto destapa: la ficha que llegó,
  // o un back del navegador en pleno viaje.
  useEffect(() => {
    if (cubriendo.current) destapar();
  }, [pathname, destapar]);

  return (
    <Ctx.Provider value={abrir}>
      {children}
      {/* Telón: por encima de todo (header z-50 incluido). */}
      <div
        ref={veloRef}
        aria-hidden="true"
        className="bg-azul-principal fixed inset-0 z-[120]"
        style={{
          visibility: "hidden",
          transform: "translateY(100%)",
          transitionProperty: "transform",
        }}
      >
        {/* Bordes blandos por fuera del telón: tela, no guillotina. */}
        <span
          className="absolute inset-x-0 -top-24 h-24"
          style={{ background: "linear-gradient(to top, var(--color-azul-principal), transparent)" }}
        />
        <span
          className="absolute inset-x-0 -bottom-24 h-24"
          style={{ background: "linear-gradient(to bottom, var(--color-azul-principal), transparent)" }}
        />
        <span className="pattern-dots-inverse absolute inset-0 [--dots-alpha:0.12]" />
        <div
          ref={marcaRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: 0,
            transitionProperty: "opacity, transform",
            transitionTimingFunction: "ease-out",
          }}
        >
          <span
            ref={destelloRef}
            className="bg-azul-claro/25 absolute h-64 w-64 rounded-full blur-3xl"
            style={{
              animation: "tf-destello 1.7s ease-in-out infinite",
              animationPlayState: "paused",
            }}
          />
          <Image
            src="/brand/logotipo-ed-negativo.png"
            alt=""
            width={79}
            height={101}
            className="relative"
          />
        </div>
      </div>
    </Ctx.Provider>
  );
}
