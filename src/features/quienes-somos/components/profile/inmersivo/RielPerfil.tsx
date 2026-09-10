"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Profile } from "@/features/quienes-somos/data/equipo";

// Alto del riel (fracción de la pantalla) y a qué altura de la pantalla
// «llega» una etapa: la misma que usa `crearEtapas` para revelarla.
const ALTO = 0.56;
const LLEGADA = 0.76;

type Marca = { n: number; title: string; pos: number; top: number };

/**
 * RIEL DE PROGRESO del recorrido, pegado al borde derecho del diálogo (a la
 * izquierda de la barra nativa): una línea fina con una marca por etapa y
 * un punto que baja con el scroll. Referencia: el riel de assistantly.com
 * (Gastón, 2026-09-10). Es la versión continua del índice vivo de la
 * izquierda —línea y nodos, el mismo lenguaje—: la izquierda dice en qué
 * etapa estás, esto dice cuánto queda. Manual de marca: línea en el navy
 * al 15 %, punto en azul medio con halo blanco, marcas recorridas en verde
 * (lo hecho) y por recorrer en gris. Mismo trazo y mismo punto que el
 * índice de página de Qué hacemos; difieren solo en las marcas (allá
 * guiones por sección, acá puntos por etapa).
 *
 * Está desde el primer momento (Gastón, 2026-09-10) y se apaga cuando entra
 * el cierre. La
 * posición del punto se escribe directo al DOM (transform), sin re-render
 * por tick. Las marcas son botones: saltan a la etapa con scroll suave del
 * propio diálogo. Solo inmersivo (desktop): en el lineal no hace falta.
 */
export function RielPerfil({
  profile,
  activeStage,
  refWrap,
}: {
  profile: Profile;
  activeStage: number;
  refWrap: RefObject<HTMLDivElement | null>;
}) {
  const punto = useRef<HTMLSpanElement | null>(null);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [visible, setVisible] = useState(false);
  const scrollerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const wrap = refWrap.current;
    const scroller = wrap?.closest<HTMLElement>("[data-profile-scroller]") ?? null;
    if (!wrap || !scroller) return;
    scrollerRef.current = scroller;
    let raf = 0;
    let recorrido = 1;
    let finCierre = Infinity;

    // Dónde cae cada etapa sobre el riel: el scroll al que su borde de
    // arriba toca la línea de llegada, como fracción del scroll total.
    // Posición de un elemento en el contenido del diálogo (offsetTop no
    // sirve: cada etapa lo mide contra su propio contenedor posicionado).
    const topEn = (el: HTMLElement) =>
      el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    const medir = () => {
      const ch = scroller.clientHeight;
      recorrido = Math.max(1, scroller.scrollHeight - ch);
      const cierre = wrap.querySelector<HTMLElement>("[data-cierre-perfil]");
      finCierre = cierre ? topEn(cierre) - ch * 0.7 : Infinity;
      const etapas = Array.from(wrap.querySelectorAll<HTMLElement>("[data-stage-n]"));
      setMarcas(
        etapas.map((el) => {
          const n = Number(el.dataset.stageN);
          const top = Math.max(0, topEn(el) - ch * LLEGADA);
          return { n, title: profile.stages.find((s) => s.n === n)?.title ?? "", pos: top / recorrido, top };
        }),
      );
      colocar();
    };
    const colocar = () => {
      raf = 0;
      const y = scroller.scrollTop;
      const ch = scroller.clientHeight;
      setVisible(y < finCierre);
      if (punto.current) {
        const p = Math.min(1, Math.max(0, y / recorrido));
        punto.current.style.transform = `translate(-50%, ${(p * ALTO * ch).toFixed(1)}px)`;
      }
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(colocar);
    };

    medir();
    scroller.addEventListener("scroll", pedir, { passive: true });
    // El contenido cambia de alto cuando cargan la figura y las fuentes.
    const observador = new ResizeObserver(medir);
    observador.observe(wrap);
    window.addEventListener("resize", medir);
    return () => {
      scroller.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", medir);
      observador.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [refWrap, profile]);

  const ir = (top: number) => scrollerRef.current?.scrollTo({ top, behavior: "smooth" });

  return (
    <nav
      aria-label="Progreso del recorrido"
      aria-hidden={!visible}
      className={`fixed top-1/2 right-8 z-[7] hidden -translate-y-1/2 transition-opacity duration-500 lg:block ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ height: `${ALTO * 100}vh` }}
    >
      <span aria-hidden="true" className="bg-azul-principal/15 absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2" />
      {marcas.map((m) => {
        const pasada = m.n <= activeStage;
        return (
          <button
            key={m.n}
            type="button"
            onClick={() => ir(m.top)}
            aria-label={`Ir a la etapa ${m.n}: ${m.title}`}
            tabIndex={visible ? 0 : -1}
            className="absolute left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-concepto"
            style={{ top: `${m.pos * 100}%` }}
          >
            <span
              aria-hidden="true"
              className={`block h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                pasada ? "bg-verde-concepto" : "bg-azul-principal/25"
              }`}
            />
          </button>
        );
      })}
      {/* El punto viajero: azul medio con halo blanco, encima de las marcas.
          El centrado horizontal va en el transform inline junto con la
          altura: con `-translate-x-1/2` de Tailwind (propiedad `translate`)
          se sumaban los dos y el punto quedaba corrido de la línea. */}
      <span
        ref={punto}
        aria-hidden="true"
        className="bg-azul-medio ring-azul-principal/15 absolute top-0 left-1/2 block h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_white] ring-1"
        style={{ marginTop: "-5px", transform: "translate(-50%, 0)" }}
      />
    </nav>
  );
}
