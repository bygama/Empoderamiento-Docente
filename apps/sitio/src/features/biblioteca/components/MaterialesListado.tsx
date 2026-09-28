"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Catalogo } from "@/features/biblioteca/contenido/catalogo";
import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { getLenis } from "@/lib/lenis";
import { EVENTO_URL } from "@/lib/navegar";
import { FilaMaterial } from "./materiales-listado/FilaMaterial";
import { FiltrosCatalogo } from "./materiales-listado/FiltrosCatalogo";
import { FiltrosMovil } from "./materiales-listado/FiltrosMovil";
import {
  coincide,
  escribirTipoEnUrl,
  normalizar,
  SIN_FILTROS,
  tipoDeUrl,
  type Filtros,
} from "./materiales-listado/filtros";

/** Filas que se muestran de entrada y que suma cada «Ver más». */
const PASO = 8;

/**
 * Listado de recursos (#materiales, sitemap: "Buscador + filtros · Listado").
 * Arquitectura de la referencia: sidebar de filtros a la izquierda
 * (materiales-listado/FiltrosCatalogo.tsx), STICKY en desktop, así solo la
 * columna de resultados acompaña el scroll. A la derecha, filas separadas
 * por hairlines (materiales-listado/FilaMaterial.tsx): portada fotográfica
 * (placeholder con fotos del hero hasta tener las reales), chips de tipo +
 * tema, título, descripción, metadata en mono y el link de acción en naranja
 * (única acción por fila, DESIGN §1).
 *
 * Filtros y búsqueda operan de verdad sobre el catálogo: un valor por grupo
 * (como la referencia), "Todos" lo destilda. Sin animación de entrada — es
 * una sección utilitaria y el contenido cambia con los filtros. Se muestra
 * de a PASO filas con «Ver más»: con 57 piezas la página no puede ser un
 * rollo. Los materiales llegan por props, de la base; el aviso sin
 * resultados también (de `features/biblioteca/contenido/catalogo.ts` o de
 * la base).
 */
export function MaterialesListado({ contenido, materiales }: { contenido: Catalogo; materiales: readonly MaterialDelSitio[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS);
  // Tramos extra pedidos con «Ver más», atados a la búsqueda con la que se
  // pidieron: si cambian los filtros dejan de contar, sin efecto que resetee.
  const [extra, setExtra] = useState({ firma: "", n: 0 });
  const rootRef = useRef<HTMLElement | null>(null);

  // El TIPO viaja en la URL (`?tipo=`): así el submenú "Biblioteca" del
  // navbar llega con el filtro aplicado desde cualquier página, y el link
  // se puede compartir. Se lee al montar y cada vez que el navbar cambia
  // la URL estando acá (EVENTO_URL) o al volver con el historial.
  useEffect(() => {
    const leer = () => {
      const tipo = tipoDeUrl();
      setFiltros((f) => (f.tipo === tipo ? f : { ...f, tipo }));
    };
    leer();
    window.addEventListener(EVENTO_URL, leer);
    window.addEventListener("popstate", leer);
    return () => {
      window.removeEventListener(EVENTO_URL, leer);
      window.removeEventListener("popstate", leer);
    };
  }, []);

  // Los años del filtro, de más nuevo a más viejo: los que tiene el catálogo.
  const anios = useMemo(() => [...new Set(materiales.map((m) => m.anio))].sort((a, b) => b - a), [materiales]);

  const hayFiltros =
    busqueda !== "" || Object.values(filtros).some((v) => v !== null);

  /**
   * Con el sidebar sticky se puede filtrar estando bien abajo en la página;
   * si el resultado tiene menos filas, la página se achica y el scroll queda
   * clavado contra el footer. Por eso: si el inicio de la sección quedó
   * arriba del viewport, volvemos ahí.
   *
   * OJO: tiene que ser vía la API de Lenis, no scrollIntoView nativo — el
   * RAF de Lenis pisa el smooth nativo en cada frame y su resize() (cuando
   * la lista se achica) re-clampea el target contra el fondo, así que el
   * scrollIntoView "no hace nada". El offset espeja scroll-mt-24 (header
   * fijo), que Lenis no lee. Sin Lenis (reduced motion) sí va el nativo,
   * instantáneo.
   */
  const volverAlListado = () => {
    const el = rootRef.current;
    const top = el?.getBoundingClientRect().top;
    if (!el || top === undefined || top >= 0) return;
    const lenis = getLenis();
    if (lenis) {
      // Target absoluto (no el elemento): si Lenis está a mitad de una
      // animación, su scroll interno difiere del real y el destino queda
      // corrido; rect.top + scrollY no depende de ese estado.
      lenis.scrollTo(top + window.scrollY - 96);
    } else {
      el.scrollIntoView();
    }
  };

  const cambiarFiltro = (parcial: Partial<Filtros>) => {
    setFiltros((f) => ({ ...f, ...parcial }));
    if ("tipo" in parcial) escribirTipoEnUrl(parcial.tipo ?? null);
    volverAlListado();
  };

  const buscar = (valor: string) => {
    setBusqueda(valor);
    volverAlListado();
  };

  const limpiar = () => {
    setBusqueda("");
    setFiltros(SIN_FILTROS);
    escribirTipoEnUrl(null);
    volverAlListado();
  };

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return materiales.filter((m) => {
      if (filtros.tipo && m.tipo !== filtros.tipo) return false;
      if (filtros.publico && m.publico !== filtros.publico) return false;
      if (filtros.anio && m.anio !== filtros.anio) return false;
      return !q || coincide(`${m.titulo} ${m.autores} ${m.descripcion} ${m.tema} ${m.tipo}`, q);
    });
  }, [busqueda, filtros, materiales]);

  const firma = `${busqueda}|${filtros.tipo}|${filtros.publico}|${filtros.anio}`;
  const extraActivo = extra.firma === firma ? extra.n : 0;
  const visibles = PASO + extraActivo;
  const restantes = Math.max(0, resultados.length - visibles);
  const verMas = () => setExtra({ firma, n: extraActivo + PASO });
  // «Ver menos» vuelve al primer tramo y sube al inicio del listado: si no,
  // la lista se achica y el scroll queda clavado contra el footer.
  const verMenos = () => {
    setExtra({ firma, n: 0 });
    volverAlListado();
  };

  return (
    <section
      ref={rootRef}
      id="materiales"
      data-indice="Catálogo"
      aria-label="Catálogo de materiales"
      className="scroll-mt-24 bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-screen-xl px-5 md:px-10">
        <div className="grid gap-y-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-x-14">
          {/* ── Sidebar: buscador + filtros (sticky en desktop) ─────────── */}
          <FiltrosCatalogo
            anios={anios}
            busqueda={busqueda}
            filtros={filtros}
            hayFiltros={hayFiltros}
            onBuscar={buscar}
            onCambiar={cambiarFiltro}
            onLimpiar={limpiar}
          />

          {/* ── Resultados ──────────────────────────────────────────────── */}
          <div>
            {/* Bajo lg la columna no va: una barra pegajosa y una hoja inferior
                con los mismos filtros (FiltrosMovil). */}
            <FiltrosMovil
              busqueda={busqueda}
              onBuscar={buscar}
              anios={anios}
              filtros={filtros}
              onCambiar={cambiarFiltro}
              onLimpiar={limpiar}
              hayFiltros={hayFiltros}
              total={resultados.length}
            />
            <p
              aria-live="polite"
              className="text-gris-texto font-mono text-[0.72rem] tracking-[0.08em] uppercase"
            >
              {resultados.length === 1
                ? "1 material"
                : `${resultados.length} materiales`}
              {hayFiltros && " con esta búsqueda"}
            </p>

            {resultados.length > 0 ? (
              <>
                <ul className="divide-azul-principal/10 mt-2 divide-y">
                  {resultados.slice(0, visibles).map((m) => (
                    <li key={m.id}>
                      <FilaMaterial material={m} />
                    </li>
                  ))}
                </ul>
                {(restantes > 0 || extraActivo > 0) && (
                  <div className="border-azul-principal/10 flex flex-col items-center gap-3 border-t pt-8">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {restantes > 0 && (
                        <button
                          type="button"
                          onClick={verMas}
                          className="border-azul-principal text-azul-principal hover:bg-azul-claro/30 rounded-lg border px-6 py-3 font-sans text-[0.95rem] font-medium transition-colors"
                        >
                          Ver {Math.min(PASO, restantes)} más
                        </button>
                      )}
                      {extraActivo > 0 && (
                        <button
                          type="button"
                          onClick={verMenos}
                          className="text-azul-principal hover:bg-azul-claro/30 rounded-lg px-5 py-3 font-sans text-[0.95rem] font-medium transition-colors"
                        >
                          Ver menos
                        </button>
                      )}
                    </div>
                    <p className="text-gris-texto font-mono text-[0.72rem] tracking-[0.08em] uppercase">
                      {Math.min(visibles, resultados.length)} de {resultados.length}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="border-azul-principal/15 mt-6 flex flex-col items-start gap-5 rounded-xl border border-dashed px-6 py-10 md:px-8">
                <p className="text-azul-principal font-sans text-[1.02rem] leading-relaxed">
                  {contenido.sinResultados}
                </p>
                <button
                  type="button"
                  onClick={limpiar}
                  className="border-azul-principal text-azul-principal hover:bg-azul-claro/30 rounded-lg border px-5 py-2.5 font-sans text-[0.92rem] font-medium transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
