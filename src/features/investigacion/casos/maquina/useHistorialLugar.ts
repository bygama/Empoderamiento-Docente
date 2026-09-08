import { useEffect, useEffectEvent, useRef } from "react";
import { irAElemento } from "@/lib/indice";
import { CASOS } from "../data";
import type { Maquina } from "./useLugarExpediente";

type Acciones = {
  abrir: (i: number, desdeUrl?: boolean) => void;
  cerrar: () => void;
  solicitarCierre: () => void;
};

/**
 * El lugar como página del navegador: link directo por hash, Escape y el
 * botón «atrás». Los tres efectos van en este orden, el de siempre.
 */
export function useHistorialLugar(m: Maquina, { abrir, cerrar, solicitarCierre }: Acciones) {
  const { activo, estado, estadoRef, historialRef, cierrePendienteRef, botonesRef } = m;

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
      if (el) irAElemento(el, true);
      abrirRef.current(i, true);
    }, 500);
    return () => window.clearTimeout(t);
    // Solo al montar: lee la URL una vez (el ref es estable).
  }, [botonesRef]);

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
