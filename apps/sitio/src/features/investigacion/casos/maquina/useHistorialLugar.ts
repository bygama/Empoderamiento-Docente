import { useEffect, useEffectEvent, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { irAElemento, irAPosicion } from "@/lib/indice";
import { EVENTO_CASO } from "../abrir-caso";
import type { CasoInvestigacion } from "../tipos";
import type { Maquina } from "./useLugarExpediente";

type Acciones = {
  abrir: (i: number, desdeUrl?: boolean) => void;
  cerrar: () => void;
  solicitarCierre: () => void;
};

/**
 * Llevar la página adonde el caso `i` se pueda abrir con su carpeta a la
 * vista. Con la escena del índice viva (desktop con puntero,
 * useEscenaIndice), la pila recién está entera al FINAL de la escena —antes
 * el título está grande o el barrido a medio camino—, así que se va al final
 * de su ScrollTrigger, el mismo donde aterriza el índice; calcularlo aparte
 * con el alto de la pista se desfasaba de la coreografía. Si no hay escena,
 * se centra la carpeta como siempre.
 */
function irAlCaso(
  section: HTMLElement,
  boton: HTMLElement,
  opciones: { corte?: boolean; alTerminar?: () => void },
) {
  const pista = section.querySelector<HTMLElement>("[data-casos-pista]");
  const escena = pista && ScrollTrigger.getAll().find((st) => st.trigger === pista);
  if (escena) {
    irAPosicion(escena.end, opciones);
    return;
  }
  irAElemento(boton, { centrar: true, ...opciones });
}

/**
 * El lugar como página del navegador: link directo por hash, pedido desde
 * otra sección (píldoras «Ver en acción» de las líneas), Escape y el botón
 * «atrás». Los efectos van en este orden, el de siempre. `casos` llega por
 * props (la base).
 */
export function useHistorialLugar(m: Maquina, { abrir, cerrar, solicitarCierre }: Acciones, casos: readonly CasoInvestigacion[]) {
  const { activo, estado, estadoRef, historialRef, cierrePendienteRef, botonesRef, sectionRef } = m;

  /* ── Link directo (#slug): abre el expediente al cargar ─────────── */
  // `abrir` y los casos se leen por ref para no atar el efecto de montaje a su identidad.
  const abrirRef = useRef(abrir);
  const casosRef = useRef(casos);
  useEffect(() => {
    abrirRef.current = abrir;
    casosRef.current = casos;
  });
  useEffect(() => {
    const slug = window.location.hash.replace(/^#/, "");
    if (!slug) return;
    const i = casosRef.current.findIndex((c) => c.slug === slug);
    if (i < 0) return;
    const t = window.setTimeout(() => {
      const el = botonesRef.current[i];
      const section = sectionRef.current;
      if (el && section) irAlCaso(section, el, { corte: true });
      abrirRef.current(i, true);
    }, 500);
    return () => window.clearTimeout(t);
    // Solo al montar: lee la URL una vez (los refs son estables).
  }, [botonesRef, sectionRef]);

  /* ── Pedido desde otra sección (abrir-caso.ts): deslizar hasta la pila y
     abrir el expediente al llegar, como si se hubiera tocado la carpeta ── */
  useEffect(() => {
    const onCaso = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      const i = casosRef.current.findIndex((c) => c.slug === slug);
      if (i < 0 || estadoRef.current !== "index") return;
      const el = botonesRef.current[i];
      const section = sectionRef.current;
      if (!el || !section) return;
      irAlCaso(section, el, { alTerminar: () => abrirRef.current(i) });
    };
    window.addEventListener(EVENTO_CASO, onCaso);
    return () => window.removeEventListener(EVENTO_CASO, onCaso);
  }, [botonesRef, sectionRef, estadoRef]);


  /* ── Escape cierra el expediente ──────────────────────────────────── */
  // Effect Events: los listeners se suscriben por estado (activo / estado) y
  // leen siempre la última versión del handler, sin re-suscribirse cada vez
  // que cambia la identidad de un callback.
  const onEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") solicitarCierre();
  });
  useEffect(() => {
    if (activo === null) return;
    const onKey = (e: KeyboardEvent) => onEscape(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo]);

  /* ── «Atrás» del navegador cierra el lugar ────────────────────────── */
  const onPopstate = useEffectEvent(() => {
    historialRef.current = false;
    if (estadoRef.current === "open") {
      cerrar();
    } else if (estadoRef.current === "opening" || estadoRef.current === "switching") {
      cierrePendienteRef.current = true;
    }
  });
  useEffect(() => {
    if (activo === null && estado === "index") return;
    const onPop = () => onPopstate();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [activo, estado]);
}
