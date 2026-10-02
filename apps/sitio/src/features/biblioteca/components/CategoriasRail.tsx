"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  LampManual,
  Lightbulb,
  School,
  Target,
  TrendingUp,
  Users,
  type IconProps,
} from "@/components/ui/icons";
import { alCambiarTipo, bajarAlCatalogo, escribirTipoEnUrl, tipoDeUrl } from "./materiales-listado/filtros";

/**
 * Categorías principales de la Biblioteca (sitemap: "Académica, pedagógicos,
 * proyectos…"). Cada píldora filtra el catálogo por su tipo y baja al listado
 * (#materiales); la primera lo muestra entero.
 */
const CATEGORIAS: { label: string; Icon: (p: IconProps) => React.JSX.Element }[] = [
  // Los rótulos son los TIPOS de contenido/modelo.ts, tal cual: el riel
  // filtra por ese texto.
  { label: "Todo el catálogo", Icon: Compass },
  { label: "Artículos", Icon: BookOpen },
  { label: "Capítulos de libro", Icon: Lightbulb },
  { label: "Libros", Icon: School },
  { label: "Tesis", Icon: Target },
  { label: "Actas de congreso", Icon: Users },
  { label: "Divulgación", Icon: TrendingUp },
  { label: "Materiales", Icon: LampManual },
];

const PASO_SCROLL = 280;

/**
 * Riel de píldoras de categorías — banda blanca redondeada con scroll
 * horizontal (sin scrollbar) y flechas circulares POR FUERA del contenedor
 * blanco, sobre el azul de la tarjeta (como la referencia). Cada flecha se
 * muestra solo cuando hay categorías ocultas hacia ese lado; ocupan su lugar
 * siempre (fade de opacidad, sin saltos de layout). Píldoras sobrias según
 * DESIGN §9: uniformes en gris-fondo, la primera activa en navy.
 */
// Cada píldora deja su tipo en la URL (`?tipo=`, que el catálogo lee) y baja
// al listado; «Todo el catálogo» lo saca.
const elegir = (tipo: string | null) => {
  escribirTipoEnUrl(tipo);
  bajarAlCatalogo();
};

const sinTipo = () => null;

// En celular las flechas no van: entre las dos se comían un tercio del ancho
// y dejaban una sola píldora a la vista. Ahí el riel se arrastra con el dedo,
// y para que eso se vea no hay banda blanca: las píldoras van sueltas sobre el
// azul y la fila llega hasta el borde de la pantalla, que es quien corta la
// última. El buscador queda como lo único blanco del hero.
const flechaClase = (activa: boolean) =>
  `hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-azul-principal shadow-[0_16px_40px_-16px_rgb(0_0_0_/_0.4)] transition-[opacity,background-color] duration-300 hover:bg-azul-claro/60 md:flex ${
    activa ? "opacity-100" : "pointer-events-none opacity-0"
  }`;

export function CategoriasRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [hayIzq, setHayIzq] = useState(false);
  const [hayDer, setHayDer] = useState(false);
  // La píldora marcada es el tipo de la URL: lo cambian este riel, los filtros
  // del catálogo y el submenú del navbar. En el servidor, ninguno.
  const tipo = useSyncExternalStore(alCambiarTipo, tipoDeUrl, sinTipo);

  // Recalcula si quedan categorías ocultas a cada lado (margen de 4px para
  // tolerar subpíxeles del smooth scroll).
  const actualizar = () => {
    const el = railRef.current;
    if (!el) return;
    setHayIzq(el.scrollLeft > 4);
    setHayDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    actualizar();
    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
  }, []);

  const desplazar = (dir: 1 | -1) =>
    railRef.current?.scrollBy({ left: dir * PASO_SCROLL, behavior: "smooth" });

  return (
    <>
    <p id="categorias-rotulo" className="mb-3 font-mono text-[0.72rem] tracking-[0.14em] text-white/70 uppercase md:hidden">
      Explorá por tipo
    </p>
    <div role="group" aria-labelledby="categorias-rotulo" className="flex items-center gap-2 md:gap-3">
      <button
        type="button"
        aria-label="Ver categorías anteriores"
        aria-hidden={!hayIzq}
        tabIndex={hayIzq ? 0 : -1}
        onClick={() => desplazar(-1)}
        className={flechaClase(hayIzq)}
      >
        <ArrowRight size={18} className="rotate-180" />
      </button>

      {/* La banda blanca ES el contenedor de scroll: las píldoras se cortan
          contra su borde redondeado real (como la referencia), no contra una
          línea interna de padding. */}
      <div
        ref={railRef}
        onScroll={actualizar}
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-full bg-white p-2 shadow-[0_24px_60px_-24px_rgb(0_0_0_/_0.4)] max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-2 max-md:-mx-5 max-md:scroll-px-5 max-md:rounded-none max-md:bg-transparent max-md:px-5 max-md:py-0 max-md:shadow-none"
      >
        {CATEGORIAS.map(({ label, Icon }, i) => {
          const suTipo = i === 0 ? null : label;
          const activa = tipo === suTipo;
          return (
            <button
              key={label}
              type="button"
              data-bh-pill
              aria-pressed={activa}
              onClick={() => elegir(suTipo)}
              className={`flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 font-sans text-[0.9rem] font-medium whitespace-nowrap transition-colors max-lg:min-h-11 max-lg:snap-start ${
                activa
                  ? "bg-azul-principal text-white max-md:bg-white max-md:text-azul-principal"
                  : "bg-gris-fondo text-azul-principal hover:bg-azul-claro/40 max-md:bg-white/10 max-md:text-white max-md:ring-1 max-md:ring-white/20 max-md:ring-inset"
              }`}
            >
              <span className="text-verde-concepto">
                <Icon size={18} />
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Ver más categorías"
        aria-hidden={!hayDer}
        tabIndex={hayDer ? 0 : -1}
        onClick={() => desplazar(1)}
        className={flechaClase(hayDer)}
      >
        <ArrowRight size={18} />
      </button>
    </div>
    </>
  );
}
