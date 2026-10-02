"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { PUBLICOS, TIPOS } from "@/features/biblioteca/contenido/modelo";
import type { Filtros } from "./filtros";
import { FiltroGrupo } from "./FiltroGrupo";

type Props = {
  abierta: boolean;
  onCerrar: () => void;
  anios: readonly number[];
  filtros: Filtros;
  onCambiar: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
  total: number;
};

const GRUPOS = ["Tipo de material", "Público", "Año"] as const;

/**
 * Hoja inferior con los tres grupos de filtros (los mismos FiltroGrupo de la
 * sidebar). `<dialog>` modal: el foco queda adentro y Escape cierra;
 * useLockScroll solo bloquea el scroll del `<body>` mientras está abierta —
 * `data-lenis-prevent` es lo que deja que la hoja scrollee sola si no entra.
 * Entra deslizando desde abajo (transform), no anima altura, y con
 * movimiento reducido aparece de una.
 *
 * Como en la sidebar de escritorio, los grupos son desplegables y hay uno
 * abierto a la vez (pedido de Gastón): expandidos los tres, la hoja era más
 * alta que la pantalla y «Año» quedaba abajo del pliegue. Cerrado, cada grupo
 * muestra lo elegido. Arranca abierto el de tipo.
 */
export function HojaFiltros({ abierta, onCerrar, anios, filtros, onCambiar, onLimpiar, total }: Props) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const reduced = useReducedMotion();
  const tituloId = useId();
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(GRUPOS[0]);
  const alternar = (grupo: string) => () => setGrupoAbierto((abierto) => (abierto === grupo ? null : grupo));
  useLockScroll(abierta);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    let tween: gsap.core.Tween | undefined;
    if (abierta && !d.open) {
      d.showModal();
      if (!reduced) tween = gsap.fromTo(d, { y: "100%" }, { y: 0, duration: 0.32, ease: "power3.out", clearProps: "transform" });
    } else if (!abierta && d.open) {
      d.close();
    }
    return () => {
      tween?.kill();
    };
  }, [abierta, reduced]);

  // Cerrar al tocar el ::backdrop: se escucha con addEventListener (no un
  // onClick de JSX) porque un <dialog> es un elemento no interactivo y el
  // gate de react-doctor marca cualquier handler de click puesto ahí.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const alTocarFondo = (e: MouseEvent) => {
      if (e.target === d) onCerrar();
    };
    d.addEventListener("click", alTocarFondo);
    return () => d.removeEventListener("click", alTocarFondo);
  }, [onCerrar]);

  return (
    <dialog
      ref={ref}
      data-hoja-filtros
      data-lenis-prevent
      aria-labelledby={tituloId}
      onClose={onCerrar}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-0 text-azul-principal shadow-[0_-24px_60px_-24px_rgb(31_45_77/0.35)] backdrop:bg-azul-principal/40"
    >
      <div className="px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <span aria-hidden="true" className="bg-azul-principal/20 mx-auto block h-1 w-10 rounded-full" />
        <div className="mt-3 flex items-center justify-between">
          <h2 id={tituloId} className="font-display text-azul-principal text-[1.2rem] font-bold tracking-[-0.01em]">Filtros</h2>
          <button type="button" onClick={onLimpiar} className="text-gris-texto min-h-11 px-2 font-sans text-[0.85rem] underline underline-offset-4">
            Limpiar todo
          </button>
        </div>
        <div className="border-azul-principal/10 mt-2 border-t [&_button[aria-pressed]]:min-h-11 [&_button[aria-pressed]]:px-4">
          <FiltroGrupo label={GRUPOS[0]} opciones={TIPOS} valor={filtros.tipo} onChange={(tipo) => onCambiar({ tipo })} abierto={grupoAbierto === GRUPOS[0]} onAlternar={alternar(GRUPOS[0])} />
          <FiltroGrupo label={GRUPOS[1]} opciones={PUBLICOS} valor={filtros.publico} onChange={(publico) => onCambiar({ publico })} abierto={grupoAbierto === GRUPOS[1]} onAlternar={alternar(GRUPOS[1])} />
          <FiltroGrupo label={GRUPOS[2]} opciones={anios.map(String)} valor={filtros.anio === null ? null : String(filtros.anio)} onChange={(anio) => onCambiar({ anio: anio === null ? null : Number(anio) })} abierto={grupoAbierto === GRUPOS[2]} onAlternar={alternar(GRUPOS[2])} />
        </div>
        <button
          type="button"
          data-cerrar-hoja
          onClick={onCerrar}
          className="bg-azul-principal mt-5 flex min-h-12 w-full items-center justify-center rounded-lg font-sans text-[0.95rem] font-medium text-white"
        >
          Ver {total === 1 ? "1 material" : `${total} materiales`}
        </button>
      </div>
    </dialog>
  );
}
