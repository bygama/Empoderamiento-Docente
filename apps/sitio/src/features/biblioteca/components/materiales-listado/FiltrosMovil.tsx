"use client";

import { useEffect, useState } from "react";
import { Search, X } from "@/components/ui/icons";
import { estiloDe, type EstiloDeTipo } from "@/features/biblioteca/components/portada/estilo-de-tipo";
import type { Tipo } from "@/features/biblioteca/contenido/modelo";
import type { Filtros } from "./filtros";
import { HojaFiltros } from "./HojaFiltros";

type Props = {
  busqueda: string;
  onBuscar: (v: string) => void;
  /** Los años que tiene el catálogo (los arma el listado). */
  anios: readonly number[];
  filtros: Filtros;
  onCambiar: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
  hayFiltros: boolean;
  total: number;
};

/**
 * Filtros del catálogo bajo `lg`: la sidebar de escritorio no cabe arriba de
 * los resultados (era una pantalla entera antes del primer material). Acá
 * queda una BARRA pegajosa que llega hasta el borde de arriba de la pantalla
 * (su blanco tapa lo que pasa por detrás del logo y del menú, que flotan; el
 * margen negativo compensa ese relleno mientras todavía no se pegó) —buscador, botón «Filtros» con la
 * cuenta de filtros puestos y los chips activos, cada uno con su ×— y una
 * HOJA inferior con los tres grupos (HojaFiltros). Mismo estado y mismos
 * callbacks que la sidebar: `?tipo=` sigue viajando en la URL.
 */
export function FiltrosMovil({ busqueda, onBuscar, anios, filtros, onCambiar, onLimpiar, hayFiltros, total }: Props) {
  const [abierta, setAbierta] = useState(false);

  // Si el viewport cruza a `lg` con la hoja abierta (rotación, resize de
  // ventana), el contenedor se esconde (`lg:hidden`) pero el <dialog> sigue
  // `open` y el body queda con `overflow: hidden` para siempre.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const alCambiar = (e: MediaQueryListEvent) => {
      if (e.matches) setAbierta(false);
    };
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  // El chip del tipo lleva el color de su tipo, como su portada y su píldora en la hoja.
  const activos: { etiqueta: string; quitar: () => void; estilo?: EstiloDeTipo }[] = [];
  if (filtros.tipo) activos.push({ etiqueta: filtros.tipo, quitar: () => onCambiar({ tipo: null }), estilo: estiloDe(filtros.tipo as Tipo) });
  if (filtros.publico) activos.push({ etiqueta: filtros.publico, quitar: () => onCambiar({ publico: null }) });
  if (filtros.anio !== null) activos.push({ etiqueta: String(filtros.anio), quitar: () => onCambiar({ anio: null }) });

  return (
    <div data-filtros-movil className="sticky top-0 z-20 -mx-5 -mt-16 border-b border-azul-principal/10 bg-white px-5 pt-[5.5rem] pb-3 md:-mx-10 md:-mt-24 md:px-10 lg:hidden">
      <div className="border-azul-principal/15 focus-within:border-azul-medio focus-within:ring-azul-claro/60 flex items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-colors focus-within:ring-2">
        <span className="text-gris-texto shrink-0">
          <Search size={18} />
        </span>
        <label htmlFor="materiales-buscar-movil" className="sr-only">
          Buscar en el catálogo
        </label>
        <input
          id="materiales-buscar-movil"
          type="search"
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscá por título, tema o autora…"
          className="text-azul-principal placeholder:text-gris-texto h-11 min-w-0 flex-1 bg-transparent font-sans text-[1rem] outline-none"
        />
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          data-abrir-filtros
          aria-expanded={abierta}
          aria-haspopup="dialog"
          onClick={() => setAbierta(true)}
          className="border-azul-principal text-azul-principal inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-4 font-sans text-[0.92rem] font-medium"
        >
          Filtros
          {activos.length > 0 && (
            <span className="bg-azul-principal rounded-full px-2 py-0.5 font-mono text-[0.7rem] text-white">
              {activos.length}
            </span>
          )}
        </button>
        {/* Chips activos en riel horizontal: se ve qué filtro hay puesto sin abrir la hoja. */}
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {activos.map((a) => (
            <span
              key={a.etiqueta}
              data-chip-activo
              className={`relative inline-flex shrink-0 items-center gap-1 overflow-hidden rounded-md pl-2.5 font-sans text-[0.8rem] font-medium ${a.estilo ? `${a.estilo.fondo} ${a.estilo.borde ? "ring-azul-principal/15 ring-1 ring-inset" : ""}` : "bg-azul-principal text-white"}`}
            >
              {a.estilo?.velo ? <span aria-hidden="true" className={`absolute inset-0 ${a.estilo.velo}`} /> : null}
              <span className="relative">{a.etiqueta}</span>
              <button type="button" aria-label={`Quitar ${a.etiqueta}`} onClick={a.quitar} className="relative flex h-11 w-9 items-center justify-center">
                <X size={14} />
              </button>
            </span>
          ))}
          {hayFiltros && (
            <button type="button" onClick={onLimpiar} className="text-gris-texto min-h-11 shrink-0 px-2 font-sans text-[0.83rem] underline underline-offset-4">
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      <HojaFiltros abierta={abierta} onCerrar={() => setAbierta(false)} anios={anios} filtros={filtros} onCambiar={onCambiar} onLimpiar={onLimpiar} total={total} />
    </div>
  );
}
