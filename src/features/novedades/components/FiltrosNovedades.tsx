"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealLines } from "@/components/ui/RevealLines";
import { NOVEDADES, CATEGORIAS, CATEGORIA_LABEL, type CategoriaKey } from "../data";
import { NovedadCard } from "./NovedadCard";
import { PaginacionNovedades } from "./PaginacionNovedades";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { getLenis } from "@/lib/lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Filtro = "todas" | CategoriaKey;
const POR_PAGINA = 6;

const filtrarLista = (f: Filtro) =>
  f === "todas" ? NOVEDADES : NOVEDADES.filter((n) => n.categoria === f);

/**
 * "Filtros por categoría" + "Últimas novedades" del sitemap: el archivo
 * completo, contenido en UN panel (cabecera con chips + contador, grilla,
 * pie con paginación separados por hairlines — referencia: el listado del
 * blog de Nominal). Chips y paginación mutan la misma grilla con FLIP real:
 * se mide la posición de cada card antes y después y se anima el delta. El
 * filtrado/paginado es imperativo sobre el DOM para no pelear con React; el
 * estado React solo pinta chips, contador, paginación y estado vacío.
 *
 * Filtro y página viajan en la URL (?categoria=&pagina=) vía replaceState:
 * links compartibles y estado que sobrevive al refresh, sin useSearchParams
 * (evita el bailout a CSR de Next). Sin motion: todo funciona, sin animar.
 */
export function FiltrosNovedades() {
  const [activa, setActiva] = useState<Filtro>("todas");
  const [pagina, setPagina] = useState(1);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const filtradas = filtrarLista(activa);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));

  const aplicar = (
    filtro: Filtro,
    pag: number,
    opts: { animar?: boolean; scroll?: boolean } = {},
  ) => {
    const { animar = true, scroll = false } = opts;
    const grid = gridRef.current;
    if (!grid) return;
    const lista = filtrarLista(filtro);
    const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    const p = Math.min(Math.max(1, pag), total);
    const visibles = new Set(
      lista.slice((p - 1) * POR_PAGINA, p * POR_PAGINA).map((n) => n.id),
    );
    setActiva(filtro);
    setPagina(p);

    const qs = new URLSearchParams();
    if (filtro !== "todas") qs.set("categoria", filtro);
    if (p !== 1) qs.set("pagina", String(p));
    const q = qs.toString();
    // Se conserva el hash: al llegar por `/novedades#ultimas` (navbar) la
    // URL no tiene que perder la sección.
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`);

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-card]"));

    // FIRST: posición y visibilidad previas.
    const first = new Map(
      cards.map((c) => [
        c,
        { rect: c.getBoundingClientRect(), vis: c.style.display !== "none" },
      ]),
    );

    // Mutar: mostrar/ocultar según filtro + página.
    cards.forEach((c) => {
      c.style.display = visibles.has(c.dataset.id ?? "") ? "" : "none";
    });

    // Al paginar, volver al tope del panel (se ven chips + primera fila).
    // Lenis ignora window.scrollTo suave → usar su scrollTo; sin Lenis
    // (reduced motion) salto directo nativo.
    if (scroll && panelRef.current) {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(panelRef.current, { offset: -110, duration: 1 });
      } else {
        const y = panelRef.current.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: y });
      }
    }
    if (reduced || !animar) return;

    // LAST + PLAY: las que siguen visibles vuelan del rect viejo al nuevo;
    // las que reaparecen entran con fade/scale.
    let enterIdx = 0;
    cards.forEach((c) => {
      if (c.style.display === "none") return;
      const info = first.get(c);
      const last = c.getBoundingClientRect();
      if (info?.vis) {
        const dx = info.rect.left - last.left;
        const dy = info.rect.top - last.top;
        if (dx || dy) {
          gsap.fromTo(c, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
        }
      } else {
        gsap.fromTo(
          c,
          { autoAlpha: 0, scale: 0.92, y: 12 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out", delay: enterIdx * 0.04 },
        );
        enterIdx++;
      }
    });
  };

  // Estado inicial: leer ?categoria=&pagina= y aplicar sin animar (también
  // recorta a la página 1 cuando no hay params). Entrada en cascada después.
  useIsomorphicLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("categoria") as Filtro | null;
    const filtro: Filtro =
      cat && CATEGORIAS.some((c) => c.key === cat) ? cat : "todas";
    aplicar(filtro, Number(params.get("pagina")) || 1, { animar: false });

    const grid = gridRef.current;
    if (!grid || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-card]", {
        autoAlpha: 0,
        y: 28,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: grid, start: "top 80%" },
      });
    }, grid);
    return () => ctx.revert();
  }, [reduced]);

  const chips: Filtro[] = ["todas", ...CATEGORIAS.map((c) => c.key)];

  return (
    <section
      id="ultimas"
      data-indice="Últimas"
      className="bg-gris-fondo"
      aria-label="Últimas novedades"
    >
      <div className="mx-auto w-full max-w-screen-xl px-5 pt-6 pb-24 md:px-10 md:pb-28">
        {/* Sin max-w: los `ch` del wrapper se resolvían contra los 16px del
            body (~368px), no contra el tamaño del titular, y lo partían en dos. */}
        <div>
          <RevealLines
            as="h2"
            className="font-display text-azul-principal font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.8rem, 1rem + 2.6vw, 3.2rem)", lineHeight: 1.08 }}
          >
            Lo que viene pasando.
          </RevealLines>
        </div>

        {/* El panel: todo el archivo vive en un solo objeto. */}
        <div
          ref={panelRef}
          className="border-azul-principal/10 mt-8 rounded-[2rem] border bg-white shadow-[0_30px_70px_-45px_rgb(31_45_77/0.35)]"
        >
          {/* Cabecera: chips + contador */}
          <div className="border-azul-principal/10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b px-5 py-5 md:px-8">
            <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrar por categoría">
              {chips.map((key) => {
                const on = activa === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => aplicar(key, 1)}
                    aria-pressed={on}
                    className={`rounded-full border px-4 py-2 font-mono text-[0.72rem] tracking-[0.1em] uppercase transition-colors ${
                      on
                        ? "border-verde-concepto bg-verde-concepto text-white"
                        : "border-azul-principal/15 text-gris-texto hover:border-verde-concepto/50 hover:text-azul-principal"
                    }`}
                  >
                    {key === "todas" ? "Todas" : CATEGORIA_LABEL[key]}
                  </button>
                );
              })}
            </div>
            <p className="text-gris-texto font-mono text-[0.68rem] tracking-[0.14em] uppercase" aria-live="polite">
              {filtradas.length} {filtradas.length === 1 ? "novedad" : "novedades"}
              {activa !== "todas" && ` · ${CATEGORIA_LABEL[activa]}`}
            </p>
          </div>

          {/* Grilla — todas las cards viven siempre; el filtro es imperativo. */}
          <div className="px-5 py-6 md:px-8 md:py-8">
            {filtradas.length === 0 && (
              <div className="py-14 text-center">
                <p className="text-azul-principal font-display text-lg font-bold">
                  Todavía no hay novedades en esta categoría.
                </p>
                <p className="text-gris-texto mt-2 font-sans text-[0.95rem]">
                  Pronto vamos a compartir nuevas acá.
                </p>
                <button
                  type="button"
                  onClick={() => aplicar("todas", 1)}
                  className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto/50 mt-6 rounded-full border px-5 py-2 font-mono text-[0.72rem] tracking-[0.1em] uppercase transition-colors"
                >
                  Ver todas
                </button>
              </div>
            )}
            <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {NOVEDADES.map((n) => (
                <NovedadCard key={n.id} n={n} />
              ))}
            </div>
          </div>

          {/* Pie: paginación (solo si hay más de una página) */}
          {totalPaginas > 1 && (
            <div className="border-azul-principal/10 border-t px-5 py-4 md:px-8">
              <PaginacionNovedades
                total={totalPaginas}
                actual={pagina}
                onCambiar={(p) => aplicar(activa, p, { scroll: true })}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
