"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { abrirArriba, aterrizarEn } from "@/lib/navegar";

/**
 * Dónde abre una página a la que se llega navegando. Vive en el layout: corre
 * en cada cambio de ruta y en la carga inicial.
 *
 * - Con `#seccion` en la URL (desde el navbar de otra página, o por un link
 *   compartido): corta a esa sección una vez que sus escenas pinneadas
 *   midieron (ver lib/navegar.ts). Si el hash no es una sección (p. ej. el
 *   slug de un caso de Investigación, que abre su expediente) no hace nada.
 * - Sin hash: ARRIBA, por lejos que se haya scrolleado la página anterior
 *   (`abrirArriba`). Dos casos no se tocan, porque ahí el scroll es del
 *   navegador: la carga inicial (recargar deja donde se estaba) y el «atrás»
 *   y «adelante» del historial.
 */
export function AterrizajePorLink() {
  const pathname = usePathname();
  const anterior = useRef<string | null>(null);
  // La ruta a la que llevó el último «atrás» o «adelante». `popstate` llega
  // con la URL ya cambiada y antes de que la página nueva monte.
  const porHistorial = useRef<string | null>(null);

  useEffect(() => {
    const anotar = () => {
      porHistorial.current = window.location.pathname;
    };
    window.addEventListener("popstate", anotar);
    return () => window.removeEventListener("popstate", anotar);
  }, []);

  useEffect(() => {
    // Sin ruta anterior es la carga inicial; con la misma, el doble montaje de
    // desarrollo: en ninguno de los dos casos se llegó navegando.
    const llegoNavegando = anterior.current !== null && anterior.current !== pathname;
    anterior.current = pathname;
    const vinoDelHistorial = porHistorial.current === pathname;
    porHistorial.current = null;

    // decodeURIComponent tira URIError con un escape roto (un «%» suelto en el
    // hash alcanza), y acá eso cortaría el efecto entero. Un hash que no se
    // puede decodificar no es una sección: se usa crudo y, si tampoco existe,
    // aterrizarEn no hace nada.
    const crudo = window.location.hash.replace(/^#/, "");
    let id = crudo;
    try {
      id = decodeURIComponent(crudo);
    } catch {
      id = crudo;
    }
    if (id) return aterrizarEn(id);
    if (!llegoNavegando || vinoDelHistorial) return;
    return abrirArriba();
  }, [pathname]);
  return null;
}
