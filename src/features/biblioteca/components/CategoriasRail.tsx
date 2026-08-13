"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Lightbulb,
  School,
  Target,
  TrendingUp,
  Users,
  type IconProps,
} from "@/components/ui/icons";

/**
 * Categorías principales de la Biblioteca (sitemap: "Académica, pedagógicos,
 * proyectos…"). Por ahora las píldoras anclan al futuro listado (#materiales);
 * cuando exista el catálogo pasan a filtrar de verdad — ahí conviene mover
 * esta lista a `features/biblioteca/data/` para compartirla con el listado.
 */
const CATEGORIAS: { label: string; Icon: (p: IconProps) => React.JSX.Element }[] = [
  { label: "Todo el catálogo", Icon: Compass },
  { label: "Producción académica", Icon: BookOpen },
  { label: "Recurso didáctico", Icon: Lightbulb },
  { label: "Proyectos", Icon: Target },
  { label: "Guías y cuadernos", Icon: School },
  { label: "Evaluación", Icon: TrendingUp },
  { label: "Charlas y seminarios", Icon: Users },
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
export function CategoriasRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [hayIzq, setHayIzq] = useState(false);
  const [hayDer, setHayDer] = useState(false);

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

  const irAlListado = () =>
    document.getElementById("materiales")?.scrollIntoView({ behavior: "smooth" });

  const flechaClase = (activa: boolean) =>
    `flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-azul-principal shadow-[0_16px_40px_-16px_rgb(0_0_0_/_0.4)] transition-[opacity,background-color] duration-300 hover:bg-azul-claro/60 ${
      activa ? "opacity-100" : "pointer-events-none opacity-0"
    }`;

  return (
    <div className="flex items-center gap-2 md:gap-3">
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
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-full bg-white p-2 shadow-[0_24px_60px_-24px_rgb(0_0_0_/_0.4)]"
      >
        {CATEGORIAS.map(({ label, Icon }, i) => (
          <button
            key={label}
            type="button"
            data-bh-pill
            onClick={irAlListado}
            className={`flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 font-sans text-[0.9rem] font-medium whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-azul-principal text-white"
                : "bg-gris-fondo text-azul-principal hover:bg-azul-claro/40"
            }`}
          >
            <span className="text-verde-concepto">
              <Icon size={18} />
            </span>
            {label}
          </button>
        ))}
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
  );
}
