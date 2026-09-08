import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getLenis } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type EstadoLugar = "index" | "opening" | "open" | "switching" | "closing";

/**
 * La máquina del archivo: estado (index → opening → open → switching |
 * closing), los refs que la coreografía necesita, el scroll-lock y la
 * limpieza global. Las acciones viven en `useAccionesLugar`, el historial y
 * el teclado en `useHistorialLugar`, las transiciones en
 * `useTransicionesExpediente`; el compositor los llama en ese orden.
 */
export function useLugarExpediente() {
  const [estado, setEstadoReact] = useState<EstadoLugar>("index");
  const [activo, setActivo] = useState<number | null>(null);
  const [anuncio, setAnuncio] = useState("");
  // true tras la primera apertura: el intro no vuelve a correr su reveal
  // SplitText en los remontajes del cierre (RevealLines enabled=false).
  const [introRevelado, setIntroRevelado] = useState(false);

  const estadoRef = useRef<EstadoLugar>("index");
  const sectionRef = useRef<HTMLElement | null>(null);
  const lugarRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const tituloRef = useRef<HTMLHeadingElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const ultimaAbiertaRef = useRef<number | null>(null);
  const entradaHechaRef = useRef(false);
  const regresoPendienteRef = useRef(false);
  const lenisDetenidoRef = useRef(false);
  // true si la apertura registró una entrada en el historial (pushState):
  // cerrar desde la UI pasa por history.back() para consumirla.
  const historialRef = useRef(false);
  // back presionado a mitad de transición: cerrar al llegar a "open".
  const cierrePendienteRef = useRef(false);
  // Ghost de la banda durante el switch (clon fijo en el body que
  // sobrevive al remount); se limpia al aterrizar o al desmontar.
  const ghostRef = useRef<HTMLElement | null>(null);
  const animsRef = useRef<gsap.core.Animation[]>([]);
  const reduced = useReducedMotion();

  const setEstado = (e: EstadoLugar) => {
    estadoRef.current = e;
    setEstadoReact(e);
  };

  /** Registra una animación para matarla si la sección se desmonta. */
  const registrar = useCallback(<T extends gsap.core.Animation>(anim: T): T => {
    animsRef.current = animsRef.current.filter((a) => a.isActive());
    animsRef.current.push(anim);
    return anim;
  }, []);

  /** Alineación INSTANTÁNEA de la página congelada con la sección: se usa
   *  en el cierre, antes del primer paint del índice remontado y con el
   *  telón todavía opaco — el salto de reflow nunca llega a verse. */
  const alinearConSeccion = useCallback((offset: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const y = window.scrollY + section.getBoundingClientRect().top - offset;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(y, { immediate: true, force: true });
    } else {
      window.scrollTo(0, y);
    }
  }, []);

  /** Scroll-lock durante las transiciones: la coreografía mide y posiciona
   *  contra el viewport; un wheel a mitad de camino rompería el staging.
   *  (Mismo patrón que TeamProfileOverlay.) */
  const detenerScroll = useCallback(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.stop();
      lenisDetenidoRef.current = true;
    }
  }, []);
  const reanudarScroll = useCallback(() => {
    if (lenisDetenidoRef.current) {
      getLenis()?.start();
      lenisDetenidoRef.current = false;
    }
  }, []);

  /* ── Cleanup global: nada sobrevive a la navegación ───────────────── */
  useEffect(() => {
    return () => {
      animsRef.current.forEach((a) => a.kill());
      animsRef.current = [];
      ghostRef.current?.remove();
      ghostRef.current = null;
      gsap.killTweensOf(window);
      // Si se navega a mitad de una transición: cancelar el scrollTo de
      // Lenis en vuelo (snap a la posición actual) y devolver el control.
      if (lenisDetenidoRef.current) {
        const lenis = getLenis();
        lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
        lenis?.start();
        lenisDetenidoRef.current = false;
      }
    };
  }, []);

  /* ── Página congelada mientras el lugar está establecido: sin
     scrollbar de ventana (el scroll vive en la capa del expediente). El
     cambio ocurre siempre con el telón opaco: el reflow es invisible. ── */
  useEffect(() => {
    if (estado !== "open" && estado !== "switching") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [estado]);

  return {
    estado,
    activo,
    anuncio,
    introRevelado,
    reduced,
    setEstado,
    setActivo,
    setAnuncio,
    setIntroRevelado,
    estadoRef,
    sectionRef,
    lugarRef,
    shellRef,
    tituloRef,
    introRef,
    itemsRef,
    botonesRef,
    ultimaAbiertaRef,
    entradaHechaRef,
    regresoPendienteRef,
    historialRef,
    cierrePendienteRef,
    ghostRef,
    registrar,
    alinearConSeccion,
    detenerScroll,
    reanudarScroll,
  };
}

export type Maquina = ReturnType<typeof useLugarExpediente>;
