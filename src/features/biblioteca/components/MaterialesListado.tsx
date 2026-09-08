"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Search } from "@/components/ui/icons";
import { getLenis } from "@/lib/lenis";
import { EVENTO_URL } from "@/lib/navegar";
import {
  ACCION,
  ANIOS,
  MATERIALES,
  PUBLICOS,
  TIPOS,
  type Material,
} from "../data/materiales";

/** Búsqueda tolerante a tildes y mayúsculas ("evaluacion" matchea "Evaluación"). */
const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

type Filtros = {
  tipo: string | null;
  publico: string | null;
  anio: number | null;
};

const SIN_FILTROS: Filtros = { tipo: null, publico: null, anio: null };

/** `?tipo=` de la URL, si es un tipo real del catálogo. */
function tipoDeUrl(): string | null {
  const t = new URLSearchParams(window.location.search).get("tipo");
  return t && (TIPOS as readonly string[]).includes(t) ? t : null;
}

/** Escribe (o borra) `?tipo=` sin tocar el historial ni el hash. */
function escribirTipoEnUrl(tipo: string | null) {
  const qs = new URLSearchParams(window.location.search);
  if (tipo) qs.set("tipo", tipo);
  else qs.delete("tipo");
  const q = qs.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`,
  );
}

/**
 * Listado de recursos (#materiales, sitemap: "Buscador + filtros · Listado").
 * Arquitectura de la referencia: sidebar de filtros a la izquierda —
 * buscador arriba y grupos de píldoras (tipo, público, año) — STICKY en
 * desktop, así solo la columna de resultados acompaña el scroll. El sidebar
 * tiene que entrar completo en un viewport de laptop (~800px): por eso el
 * tema NO tiene grupo propio (se pisaba con tipo y era el grupo más alto);
 * sigue visible como chip en cada fila y la búsqueda lo matchea. A la
 * derecha, filas separadas por hairlines: portada fotográfica (placeholder
 * con fotos del hero hasta tener las reales), chips de tipo + tema, título,
 * descripción, metadata en mono y el link de acción en naranja (única
 * acción por fila, DESIGN §1).
 *
 * Filtros y búsqueda operan de verdad sobre el mock: un valor por grupo
 * (como la referencia), "Todos" lo destilda. Sin animación de entrada — es
 * una sección utilitaria y el contenido cambia con los filtros.
 */
export function MaterialesListado() {
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS);
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
    return MATERIALES.filter((m) => {
      if (filtros.tipo && m.tipo !== filtros.tipo) return false;
      if (filtros.publico && m.publico !== filtros.publico) return false;
      if (filtros.anio && m.anio !== filtros.anio) return false;
      if (!q) return true;
      return normalizar(
        `${m.titulo} ${m.descripcion} ${m.tema} ${m.tipo}`,
      ).includes(q);
    });
  }, [busqueda, filtros]);

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
          <aside
            aria-label="Buscador y filtros del catálogo"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-h3 text-azul-principal font-bold tracking-[-0.01em]">
                Filtros
              </h2>
              {hayFiltros && (
                <button
                  type="button"
                  onClick={limpiar}
                  className="text-gris-texto hover:text-azul-principal font-sans text-[0.83rem] underline underline-offset-4 transition-colors"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            <div className="border-azul-principal/15 focus-within:border-azul-medio focus-within:ring-azul-claro/60 mt-5 flex items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-colors focus-within:ring-2">
              <span className="text-gris-texto shrink-0">
                <Search size={18} />
              </span>
              <label htmlFor="materiales-buscar" className="sr-only">
                Buscar en el catálogo
              </label>
              <input
                id="materiales-buscar"
                type="search"
                value={busqueda}
                onChange={(e) => buscar(e.target.value)}
                placeholder="Buscá por título, tema o autora…"
                className="text-azul-principal placeholder:text-gris-texto h-11 min-w-0 flex-1 bg-transparent font-sans text-[0.95rem] outline-none"
              />
            </div>

            <FiltroGrupo
              label="Tipo de material"
              opciones={TIPOS}
              valor={filtros.tipo}
              onChange={(tipo) => cambiarFiltro({ tipo })}
            />
            <FiltroGrupo
              label="Público"
              opciones={PUBLICOS}
              valor={filtros.publico}
              onChange={(publico) => cambiarFiltro({ publico })}
            />
            <FiltroGrupo
              label="Año"
              opciones={ANIOS.map(String)}
              valor={filtros.anio === null ? null : String(filtros.anio)}
              onChange={(anio) =>
                cambiarFiltro({ anio: anio === null ? null : Number(anio) })
              }
            />
          </aside>

          {/* ── Resultados ──────────────────────────────────────────────── */}
          <div>
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
              <ul className="divide-azul-principal/10 mt-2 divide-y">
                {resultados.map((m) => (
                  <li key={m.titulo}>
                    <FilaMaterial material={m} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-azul-principal/15 mt-6 flex flex-col items-start gap-5 rounded-xl border border-dashed px-6 py-10 md:px-8">
                <p className="text-azul-principal font-sans text-[1.02rem] leading-relaxed">
                  No encontramos materiales con esa combinación de filtros.
                  Probá con menos filtros o con otras palabras.
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

/**
 * Grupo de filtros de un solo valor: "Todos" + una píldora por opción.
 * Tocar la opción activa la destilda (vuelve a "Todos").
 */
function FiltroGrupo({
  label,
  opciones,
  valor,
  onChange,
}: {
  label: string;
  opciones: readonly string[];
  valor: string | null;
  onChange: (valor: string | null) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="text-gris-texto font-mono text-[0.7rem] tracking-[0.12em] uppercase">
        {label}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pildora activa={valor === null} onClick={() => onChange(null)}>
          Todos
        </Pildora>
        {opciones.map((opcion) => (
          <Pildora
            key={opcion}
            activa={valor === opcion}
            onClick={() => onChange(valor === opcion ? null : opcion)}
          >
            {opcion}
          </Pildora>
        ))}
      </div>
    </fieldset>
  );
}

function Pildora({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 font-sans text-[0.82rem] font-medium transition-colors ${
        activa
          ? "border-azul-principal bg-azul-principal text-white"
          : "border-azul-principal/15 text-azul-principal hover:bg-azul-claro/30 bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function FilaMaterial({ material: m }: { material: Material }) {
  return (
    <article className="grid gap-5 py-7 md:grid-cols-[218px_minmax(0,1fr)] md:gap-8 md:py-8">
      {/* Portada: cualquier foto que el equipo cargue (mock: fotos del hero) */}
      <div className="bg-azul-claro/30 relative aspect-[16/9] overflow-hidden rounded-xl md:aspect-[4/3]">
        <Image
          src={m.portada}
          alt=""
          fill
          sizes="(min-width: 768px) 218px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-azul-principal rounded-md px-2.5 py-1 font-sans text-[0.72rem] font-medium text-white">
            {m.tipo}
          </span>
          <span className="bg-gris-fondo text-azul-principal rounded-md px-2.5 py-1 font-sans text-[0.72rem] font-medium">
            {m.tema}
          </span>
        </div>

        <h3 className="font-display text-azul-principal mt-3 text-[1.3rem] leading-snug font-bold tracking-[-0.01em]">
          {m.titulo}
        </h3>
        <p className="text-gris-texto mt-2 max-w-[68ch] font-sans text-[0.97rem] leading-relaxed">
          {m.descripcion}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5">
          <p className="text-gris-texto font-mono text-[0.72rem] tracking-[0.08em] uppercase">
            {m.fecha} · {m.paginas ? `${m.paginas} páginas` : m.formato}
          </p>
          {/* Placeholder hasta tener los archivos reales del catálogo. */}
          <a
            href="#materiales"
            className="text-naranja-accion group inline-flex items-center gap-1.5 font-sans text-[0.92rem] font-medium"
          >
            {ACCION[m.formato]}
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight size={17} />
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
