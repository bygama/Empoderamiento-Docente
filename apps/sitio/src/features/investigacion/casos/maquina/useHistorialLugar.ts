import { useEffect, useEffectEvent, useRef } from "react";
import { irAElemento, irAPosicion } from "@/lib/indice";
import { EVENTO_CASO } from "../abrir-caso";
import { CASOS } from "../data";
import type { Maquina } from "./useLugarExpediente";

type Acciones = {
  abrir: (i: number, desdeUrl?: boolean) => void;
  cerrar: () => void;
  solicitarCierre: () => void;
};

/**
 * Llevar la página adonde el caso `i` se pueda abrir con su carpeta a la
 * vista. Con la escena del índice viva (desktop: la pista mide más que la
 * pantalla, useEscenaIndice), la pila recién está entera al FINAL de la
 * pista —antes el título está grande o el barrido a medio camino—, así que
 * se va ahí; si no, se centra la carpeta como siempre.
 */
function irAlCaso(
  section: HTMLElement,
  boton: HTMLElement,
  opciones: { corte?: boolean; alTerminar?: () => void },
) {
  const pista = section.querySelector<HTMLElement>("[data-casos-pista]");
  if (pista && pista.offsetHeight > window.innerHeight) {
    const fin = pista.getBoundingClientRect().top + window.scrollY + pista.offsetHeight - window.innerHeight;
    irAPosicion(fin, opciones);
    return;
  }
  irAElemento(boton, { centrar: true, ...opciones });
}

/**
 * El lugar como página del navegador: link directo por hash, pedido desde
 * otra sección (píldoras «Ver en acción» de las líneas), Escape y el botón
 * «atrás». Los efectos van en este orden, el de siempre.
 */
export function useHistorialLugar(m: Maquina, { abrir, cerrar, solicitarCierre }: Acciones) {
  const { activo, estado, estadoRef, historialRef, cierrePendienteRef, botonesRef, sectionRef } = m;

  /* ── Link directo (#slug): abre el expediente al cargar ─────────── */
  // `abrir` se lee por ref para no atar el efecto de montaje a su identidad.
  const abrirRef = useRef(abrir);
  useEffect(() => {
    abrirRef.current = abrir;
  });
  useEffect(() => {
    const slug = window.location.hash.replace(/^#/, "");
    if (!slug) return;
    const i = CASOS.findIndex((c) => c.slug === slug);
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
      const i = CASOS.findIndex((c) => c.slug === slug);
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
